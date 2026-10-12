import express, { Request, Response } from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
import { GoogleGenAI, Type } from '@google/genai';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT ? parseInt(process.env.PORT, 10) : 3000;

app.use(express.json({ limit: '10mb' }));

// Shared server-side Gemini client
const getAiClient = () => {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    throw new Error('GEMINI_API_KEY environment variable is missing.');
  }
  return new GoogleGenAI({
    apiKey,
    httpOptions: {
      headers: {
        'User-Agent': 'aistudio-build',
      },
    },
  });
};

// Resilient content generator that retries on transient errors or high demand (503/429)
async function generateWithRetry(ai: GoogleGenAI, params: any) {
  const models = ['gemini-3.8-flash', 'gemini-3.1-flash-lite'];
  let lastErr: any = null;

  for (const model of models) {
    for (let attempt = 1; attempt <= 2; attempt++) {
      try {
        const response = await ai.models.generateContent({
          ...params,
          model,
        });
        if (response && response.text) {
          return response;
        }
      } catch (err: any) {
        lastErr = err;
        console.warn(`[Gemini] Model ${model} attempt ${attempt} warning:`, err?.message || err);
        // Wait 1.5s before retry
        if (attempt < 2) {
          await new Promise((resolve) => setTimeout(resolve, 1500));
        }
      }
    }
  }

  throw lastErr;
}

// API: Generate Quiz
app.post('/api/generate-quiz', async (req: Request, res: Response) => {
  try {
    const {
      topic,
      sourceText,
      difficulty = 'intermediate',
      questionCount = 10,
      questionType = 'mixed', // 'multiple-choice', 'true-false', 'fill-blank', 'mixed'
      audience = 'general',
      language = 'English',
      includeHints = true,
      includeExplanations = true,
    } = req.body;

    if (!topic && !sourceText) {
      return res.status(400).json({ error: 'Please provide a topic or source text.' });
    }

    const ai = getAiClient();

    const count = Math.min(Math.max(parseInt(String(questionCount), 10) || 5, 3), 25);

    const prompt = `You are a world-class educational exam designer and quiz creator.
Generate a high-quality, comprehensive, and engaging quiz based on the following specifications:

${topic ? `TOPIC: ${topic}` : ''}
${sourceText ? `REFERENCE CONTENT / STUDY NOTES:\n"""\n${sourceText.slice(0, 8000)}\n"""` : ''}

SPECIFICATIONS:
- Number of Questions: ${count}
- Target Difficulty: ${difficulty} (beginner: foundational facts; intermediate: conceptual application; advanced: deep analysis & nuanced scenarios; expert: tricky edge cases & mastery)
- Question Types: ${questionType} (if mixed, provide a healthy balance of multiple-choice and true-false)
- Target Audience/Tone: ${audience}
- Language: ${language}
- Include clear, pedagogical explanations: ${includeExplanations}
- Include helpful, non-spoiling hints: ${includeHints}

RULES FOR HIGH QUALITY QUESTIONS:
1. Every multiple-choice question MUST have exactly 4 plausible options. Avoid "All of the above" or "None of the above" where possible.
2. For multiple-choice and true-false, options must be an array of strings. The correctAnswer must match EXACTLY one of the strings in the options array.
3. For true-false, options must be ["True", "False"].
4. For fill-blank questions, provide 4 options where 1 is the correct term/phrase, or provide the exact word in options and correctAnswer.
5. Explanations must clearly explain WHY the correct answer is right and clarify why the other options are common misconceptions.
6. Make questions thought-provoking, avoiding trivial duplicates.`;

    const response = await generateWithRetry(ai, {
      contents: prompt,
      config: {
        systemInstruction: 'You are an expert curriculum developer. Return the quiz strictly in structured JSON matching the provided schema.',
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            title: { type: Type.STRING, description: 'Engaging, concise title of the quiz' },
            description: { type: Type.STRING, description: 'Brief 1-2 sentence overview of what this quiz covers' },
            topic: { type: Type.STRING, description: 'Subject area category' },
            estimatedMinutes: { type: Type.INTEGER, description: 'Estimated time to complete in minutes' },
            difficulty: { type: Type.STRING, description: 'beginner, intermediate, advanced, or expert' },
            tags: {
              type: Type.ARRAY,
              items: { type: Type.STRING },
              description: '3-5 relevant topic keywords',
            },
            questions: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  id: { type: Type.STRING, description: 'Unique ID like q1, q2' },
                  question: { type: Type.STRING, description: 'Clear question stem' },
                  type: { type: Type.STRING, description: 'multiple-choice, true-false, or fill-blank' },
                  options: {
                    type: Type.ARRAY,
                    items: { type: Type.STRING },
                    description: 'List of answer choices (usually 4 for multiple choice, 2 for true/false)',
                  },
                  correctAnswer: { type: Type.STRING, description: 'The exact matching string from options' },
                  explanation: { type: Type.STRING, description: 'Detailed educational explanation of the answer' },
                  hint: { type: Type.STRING, description: 'Helpful hint that guides the user without giving it away' },
                  difficulty: { type: Type.STRING, description: 'easy, medium, or hard' },
                  keyConcept: { type: Type.STRING, description: 'Core concept tested, e.g. Mitochondria function' },
                },
                required: ['id', 'question', 'type', 'options', 'correctAnswer', 'explanation'],
              },
            },
          },
          required: ['title', 'description', 'topic', 'difficulty', 'questions'],
        },
      },
    });

    const text = response.text;
    if (!text) {
      throw new Error('No content returned from Gemini model.');
    }

    const quizData = JSON.parse(text);
    // Sanitize question ids if needed
    if (Array.isArray(quizData.questions)) {
      quizData.questions = quizData.questions.map((q: any, idx: number) => ({
        ...q,
        id: q.id || `q_${idx + 1}_${Date.now()}`,
      }));
    }

    return res.json({ success: true, quiz: quizData });
  } catch (error: any) {
    console.error('Error generating quiz:', error);
    return res.status(500).json({
      error: error?.message || 'Failed to generate quiz. Please check your request and try again.',
    });
  }
});

// API: Ask AI Tutor about a specific question
app.post('/api/explain-question', async (req: Request, res: Response) => {
  try {
    const { question, options, selectedAnswer, correctAnswer, explanation, userQuery } = req.body;

    if (!question) {
      return res.status(400).json({ error: 'Question data is required.' });
    }

    const ai = getAiClient();

    const prompt = `You are a friendly, encouraging AI Study Tutor helping a student understand a quiz question.

QUESTION: ${question}
OPTIONS: ${JSON.stringify(options)}
STUDENT'S ANSWER: ${selectedAnswer || 'None selected'}
CORRECT ANSWER: ${correctAnswer}
DEFAULT EXPLANATION: ${explanation}

STUDENT'S INQUIRY: "${userQuery || 'Can you explain why the correct answer is right and why my answer or other options might be misleading in simple terms?'}"

Provide a clear, pedagogical response:
1. Validate their curiosity.
2. Directly answer their inquiry with a memorable analogy or breakdown.
3. Offer a quick memory trick or rule-of-thumb to never miss this in exams.
Keep it under 180 words, punchy and engaging.`;

    const response = await generateWithRetry(ai, {
      contents: prompt,
    });

    return res.json({ success: true, explanation: response.text });
  } catch (error: any) {
    console.error('Error explaining question:', error);
    return res.status(500).json({
      error: error?.message || 'Failed to get tutor explanation.',
    });
  }
});

// API: Generate Targeted Follow-up Quiz on Weak Spots
app.post('/api/generate-weak-spots-quiz', async (req: Request, res: Response) => {
  try {
    const { topic, missedQuestions } = req.body;

    if (!missedQuestions || !Array.isArray(missedQuestions) || missedQuestions.length === 0) {
      return res.status(400).json({ error: 'No missed questions provided.' });
    }

    const ai = getAiClient();

    const missedSummary = missedQuestions.map((m: any, i: number) => 
      `${i + 1}. Q: ${m.question} | Correct Answer was: ${m.correctAnswer} | Student Picked: ${m.userAnswer || 'Skipped'} | Key Concept: ${m.keyConcept || 'N/A'}`
    ).join('\n');

    const prompt = `A student just took a quiz on "${topic || 'General Knowledge'}" and struggled with the following questions:

${missedSummary}

Create a focused "Review & Mastery" follow-up quiz consisting of 5 targeted questions that reinforce and test the exact concepts they missed, but with newly phrased scenarios, fresh questions, and varied angles to ensure true comprehension.`;

    const response = await generateWithRetry(ai, {
      contents: prompt,
      config: {
        systemInstruction: 'Return the targeted reinforcement quiz strictly matching the JSON schema.',
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            title: { type: Type.STRING },
            description: { type: Type.STRING },
            topic: { type: Type.STRING },
            difficulty: { type: Type.STRING },
            questions: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  id: { type: Type.STRING },
                  question: { type: Type.STRING },
                  type: { type: Type.STRING },
                  options: {
                    type: Type.ARRAY,
                    items: { type: Type.STRING },
                  },
                  correctAnswer: { type: Type.STRING },
                  explanation: { type: Type.STRING },
                  hint: { type: Type.STRING },
                  difficulty: { type: Type.STRING },
                  keyConcept: { type: Type.STRING },
                },
                required: ['id', 'question', 'type', 'options', 'correctAnswer', 'explanation'],
              },
            },
          },
          required: ['title', 'description', 'topic', 'questions'],
        },
      },
    });

    const text = response.text;
    if (!text) {
      throw new Error('No content returned from Gemini model.');
    }

    const quizData = JSON.parse(text);
    return res.json({ success: true, quiz: quizData });
  } catch (error: any) {
    console.error('Error generating weak spots quiz:', error);
    return res.status(500).json({
      error: error?.message || 'Failed to generate targeted quiz.',
    });
  }
});

// Setup Vite middleware in dev or static files in production
async function startServer() {
  if (process.env.NODE_ENV === 'production') {
    app.use(express.static(path.join(__dirname, 'dist')));
    app.get('*', (_req, res) => {
      res.sendFile(path.join(__dirname, 'dist', 'index.html'));
    });
  } else {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`QuizForge AI server running at http://0.0.0.0:${PORT}`);
  });
}

startServer();
