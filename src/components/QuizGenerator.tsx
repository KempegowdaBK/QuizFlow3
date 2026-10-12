import React, { useState, useEffect } from 'react';
import { Quiz, DifficultyLevel, QuestionType } from '../types/quiz';
import { sound } from '../utils/sound';
import { 
  Sparkles, 
  FileText, 
  Sliders, 
  Layers, 
  CheckCircle2, 
  BookOpen, 
  HelpCircle, 
  AlertCircle,
  Clock,
  ArrowRight
} from 'lucide-react';

interface QuizGeneratorProps {
  initialTopic?: string;
  onQuizGenerated: (quiz: Quiz) => void;
}

const TOPIC_PRESETS = [
  'Human Anatomy & Organ Systems',
  'Quantum Mechanics & Entanglement',
  'World War II Pivotal Battles',
  'JavaScript ESNext & Event Loop',
  'Personal Finance & Investing Basics',
  'Cellular Respiration & Photosynthesis',
  'Spanish Travel Vocabulary & Idioms',
  'Cybersecurity & Network Defense',
  'Greek & Norse Mythology',
  'Macroeconomics & Central Banking',
];

const SAMPLE_STUDY_NOTE = `Photosynthesis is the biochemical process by which photoautotrophs convert light energy into chemical energy stored in glucose. The overall chemical equation is 6CO2 + 6H2O + light -> C6H12O6 + 6O2.

1. Light-Dependent Reactions: Occur inside the thylakoid membranes of chloroplasts. Chlorophyll absorbs solar photons, exciting electrons through Photosystem II (PSII) and Photosystem I (PSI). Photolysis splits water molecules into oxygen, protons, and electrons. This creates a proton gradient across the thylakoid membrane driving ATP synthase to produce ATP, while NADP+ reductase produces NADPH.

2. Light-Independent Reactions (Calvin Cycle): Occurs in the stroma of chloroplasts. It consists of three key phases: carbon fixation (catalyzed by the enzyme RuBisCO, combining CO2 with ribulose 1,5-bisphosphate), reduction (using ATP and NADPH to convert 3-PGA into G3P), and regeneration of RuBP. For every 6 turns of the cycle, one net glucose molecule is synthesized.`;

export const QuizGenerator: React.FC<QuizGeneratorProps> = ({ initialTopic = '', onQuizGenerated }) => {
  const [mode, setMode] = useState<'topic' | 'text'>('topic');
  const [topic, setTopic] = useState(initialTopic);

  useEffect(() => {
    if (initialTopic) {
      setTopic(initialTopic);
      setMode('topic');
    }
  }, [initialTopic]);
  const [sourceText, setSourceText] = useState('');
  const [difficulty, setDifficulty] = useState<DifficultyLevel>('intermediate');
  const [questionCount, setQuestionCount] = useState<number>(10);
  const [questionType, setQuestionType] = useState<string>('mixed');
  const [audience, setAudience] = useState<string>('Academic Exam Prep');
  const [language, setLanguage] = useState<string>('English');
  const [includeHints, setIncludeHints] = useState<boolean>(true);
  const [includeExplanations, setIncludeExplanations] = useState<boolean>(true);
  const [showAdvanced, setShowAdvanced] = useState<boolean>(false);

  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [stepIndex, setStepIndex] = useState<number>(0);

  const steps = [
    'Parsing curriculum and target subject domain...',
    'Synthesizing thought-provoking questions & distractors...',
    'Validating misconceptions and calibrating difficulty...',
    'Formatting hints, key concepts, and explanations...',
  ];

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (loading) {
      setStepIndex(0);
      interval = setInterval(() => {
        setStepIndex((prev) => (prev < steps.length - 1 ? prev + 1 : prev));
      }, 2400);
    }
    return () => clearInterval(interval);
  }, [loading]);

  const handleGenerate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (mode === 'topic' && !topic.trim()) {
      setError('Please enter a topic or subject.');
      return;
    }
    if (mode === 'text' && !sourceText.trim()) {
      setError('Please paste study notes or text to generate questions from.');
      return;
    }

    setLoading(true);
    setError(null);
    sound.playClick();

    try {
      const response = await fetch('/api/generate-quiz', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          topic: mode === 'topic' ? topic : topic || 'Study Notes Excerpt',
          sourceText: mode === 'text' ? sourceText : undefined,
          difficulty,
          questionCount,
          questionType,
          audience,
          language,
          includeHints,
          includeExplanations,
        }),
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || 'Failed to generate quiz');
      }

      const generatedQuiz: Quiz = {
        id: `quiz_${Date.now()}`,
        title: data.quiz.title || (mode === 'topic' ? `${topic} Quiz` : 'Custom Study Quiz'),
        description: data.quiz.description || '',
        topic: data.quiz.topic || topic || 'General',
        difficulty: (data.quiz.difficulty as DifficultyLevel) || difficulty,
        estimatedMinutes: data.quiz.estimatedMinutes || Math.ceil(questionCount * 1.2),
        tags: data.quiz.tags || [topic || 'Study'],
        questions: data.quiz.questions,
        createdAt: new Date().toISOString(),
        sourceType: mode,
      };

      sound.playCorrect();
      onQuizGenerated(generatedQuiz);
    } catch (err: any) {
      console.error(err);
      sound.playIncorrect();
      setError(err.message || 'Something went wrong while generating the quiz. Please check your connection or retry.');
    } finally {
      setLoading(false);
    }
  };

  const handleUseSampleNotes = () => {
    sound.playClick();
    setTopic('Photosynthesis & Cellular Energy');
    setSourceText(SAMPLE_STUDY_NOTE);
    setMode('text');
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      {/* Hero Intro */}
      <div className="text-center mb-8">
        <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight mb-3">
          Instant Quizzes from Any Topic or Notes
        </h1>
        <p className="text-slate-600 max-w-2xl mx-auto text-sm sm:text-base leading-relaxed">
          Powered by Gemini 3.8. Create interactive multiple-choice tests, flashcards, and study guides tailored to your exact curriculum, difficulty, and goals.
        </p>
      </div>

      {/* Main Generator Card */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        {/* Source Mode Tabs */}
        <div className="flex border-b border-slate-200 bg-slate-50/70 p-1.5 gap-1.5">
          <button
            type="button"
            onClick={() => {
              sound.playClick();
              setMode('topic');
            }}
            disabled={loading}
            className={`flex-1 py-3 px-4 rounded-xl text-xs sm:text-sm font-semibold flex items-center justify-center gap-2 transition-all ${
              mode === 'topic'
                ? 'bg-white text-slate-900 shadow-xs border border-slate-200/80'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Sparkles className="w-4 h-4 text-indigo-600" />
            <span>Generate by Topic / Subject</span>
          </button>

          <button
            type="button"
            onClick={() => {
              sound.playClick();
              setMode('text');
            }}
            disabled={loading}
            className={`flex-1 py-3 px-4 rounded-xl text-xs sm:text-sm font-semibold flex items-center justify-center gap-2 transition-all ${
              mode === 'text'
                ? 'bg-white text-slate-900 shadow-xs border border-slate-200/80'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <FileText className="w-4 h-4 text-indigo-600" />
            <span>From Notes, Text or Syllabus</span>
          </button>
        </div>

        <form onSubmit={handleGenerate} className="p-6 sm:p-8 space-y-6">
          {/* Mode 1: Topic */}
          {mode === 'topic' && (
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-2">
                  What would you like to test?
                </label>
                <div className="relative">
                  <input
                    type="text"
                    value={topic}
                    onChange={(e) => setTopic(e.target.value)}
                    placeholder="e.g. World War II Turning Points, React 19 State, Human Circulatory System..."
                    disabled={loading}
                    className="w-full px-4 py-3.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 text-sm font-medium transition-all"
                  />
                  {topic && (
                    <button
                      type="button"
                      onClick={() => setTopic('')}
                      className="absolute right-3.5 top-1/2 -translate-y-1/2 text-xs text-slate-400 hover:text-slate-600"
                    >
                      Clear
                    </button>
                  )}
                </div>
              </div>

              {/* Inspiration Presets */}
              <div>
                <p className="text-xs text-slate-500 font-medium mb-2 flex items-center gap-1.5">
                  <BookOpen className="w-3.5 h-3.5 text-slate-400" />
                  <span>Popular inspiration topics:</span>
                </p>
                <div className="flex flex-wrap gap-1.5">
                  {TOPIC_PRESETS.map((preset) => (
                    <button
                      key={preset}
                      type="button"
                      onClick={() => {
                        sound.playClick();
                        setTopic(preset);
                      }}
                      disabled={loading}
                      className="text-xs px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-indigo-50 hover:text-indigo-700 hover:border-indigo-200 border border-slate-200/60 text-slate-600 transition-colors"
                    >
                      {preset}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Mode 2: Paste Text / Notes */}
          {mode === 'text' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider">
                  Paste Study Material, Lecture Notes or Textbook Excerpts
                </label>
                <button
                  type="button"
                  onClick={handleUseSampleNotes}
                  className="text-xs font-medium text-indigo-600 hover:text-indigo-800 transition-colors flex items-center gap-1"
                >
                  <Sparkles className="w-3.5 h-3.5" />
                  Try Sample Biology Note
                </button>
              </div>

              <textarea
                value={sourceText}
                onChange={(e) => setSourceText(e.target.value)}
                placeholder="Paste any article, lecture transcript, study notes, or textbook chapter here (up to 8,000 characters)..."
                rows={6}
                maxLength={8000}
                disabled={loading}
                className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 text-sm font-sans transition-all resize-y leading-relaxed"
              />

              <div className="flex items-center justify-between text-xs text-slate-500">
                <span>Supports bullet points, research abstracts, code notes, & lesson outlines</span>
                <span>{sourceText.length} / 8000 chars</span>
              </div>
            </div>
          )}

          {/* Primary Quick Controls: Difficulty & Count */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2 border-t border-slate-100">
            {/* Difficulty Selector */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-2">
                Difficulty Level
              </label>
              <div className="grid grid-cols-4 gap-1.5 p-1 bg-slate-100 rounded-xl">
                {(['beginner', 'intermediate', 'advanced', 'expert'] as DifficultyLevel[]).map((lvl) => (
                  <button
                    key={lvl}
                    type="button"
                    onClick={() => {
                      sound.playClick();
                      setDifficulty(lvl);
                    }}
                    disabled={loading}
                    className={`py-2 px-1 text-xs font-medium capitalize rounded-lg transition-all ${
                      difficulty === lvl
                        ? 'bg-white text-slate-900 shadow-xs font-semibold'
                        : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    {lvl}
                  </button>
                ))}
              </div>
            </div>

            {/* Question Count Selector */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-2">
                Number of Questions
              </label>
              <div className="grid grid-cols-5 gap-1.5 p-1 bg-slate-100 rounded-xl">
                {[5, 8, 10, 15, 20].map((num) => (
                  <button
                    key={num}
                    type="button"
                    onClick={() => {
                      sound.playClick();
                      setQuestionCount(num);
                    }}
                    disabled={loading}
                    className={`py-2 text-xs font-medium rounded-lg transition-all ${
                      questionCount === num
                        ? 'bg-white text-slate-900 shadow-xs font-semibold'
                        : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    {num} Qs
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Collapsible Advanced Customization */}
          <div>
            <button
              type="button"
              onClick={() => setShowAdvanced(!showAdvanced)}
              className="text-xs font-semibold text-slate-600 hover:text-slate-900 flex items-center gap-1.5 transition-colors py-1"
            >
              <Sliders className="w-3.5 h-3.5 text-indigo-600" />
              <span>{showAdvanced ? 'Hide Advanced Settings' : 'Advanced Configuration (Question Types, Tone, Language)'}</span>
            </button>

            {showAdvanced && (
              <div className="mt-3 p-4 bg-slate-50 rounded-xl border border-slate-200/80 space-y-4 text-sm animate-in fade-in-50">
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  {/* Question Type */}
                  <div>
                    <label className="block text-xs font-medium text-slate-600 mb-1.5">Question Format</label>
                    <select
                      value={questionType}
                      onChange={(e) => setQuestionType(e.target.value)}
                      disabled={loading}
                      className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-xs text-slate-800 focus:outline-none focus:border-indigo-600"
                    >
                      <option value="mixed">Mixed (Multiple Choice + True/False)</option>
                      <option value="multiple-choice">Multiple Choice Only (4 Options)</option>
                      <option value="true-false">True / False Only</option>
                      <option value="fill-blank">Fill-in-the-Blank</option>
                    </select>
                  </div>

                  {/* Audience / Tone */}
                  <div>
                    <label className="block text-xs font-medium text-slate-600 mb-1.5">Audience & Tone</label>
                    <select
                      value={audience}
                      onChange={(e) => setAudience(e.target.value)}
                      disabled={loading}
                      className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-xs text-slate-800 focus:outline-none focus:border-indigo-600"
                    >
                      <option value="Academic Exam Prep">Academic Exam Prep (Rigorous)</option>
                      <option value="Trivia & Pub Game">Trivia & Fun (Engaging)</option>
                      <option value="Professional Certification">Professional Certification</option>
                      <option value="High School & AP Level">High School / AP Level</option>
                      <option value="Kids & Elementary">Kids & Elementary (Accessible)</option>
                    </select>
                  </div>

                  {/* Language */}
                  <div>
                    <label className="block text-xs font-medium text-slate-600 mb-1.5">Output Language</label>
                    <select
                      value={language}
                      onChange={(e) => setLanguage(e.target.value)}
                      disabled={loading}
                      className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-xs text-slate-800 focus:outline-none focus:border-indigo-600"
                    >
                      <option value="English">English</option>
                      <option value="Spanish">Español (Spanish)</option>
                      <option value="French">Français (French)</option>
                      <option value="German">Deutsch (German)</option>
                      <option value="Japanese">日本語 (Japanese)</option>
                      <option value="Hindi">हिन्दी (Hindi)</option>
                      <option value="Portuguese">Português</option>
                    </select>
                  </div>
                </div>

                <div className="flex flex-wrap items-center gap-6 pt-2 border-t border-slate-200/60 text-xs text-slate-700">
                  <label className="flex items-center gap-2 cursor-pointer select-none">
                    <input
                      type="checkbox"
                      checked={includeHints}
                      onChange={(e) => setIncludeHints(e.target.checked)}
                      disabled={loading}
                      className="rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
                    />
                    <span>Include helpful hints for test takers</span>
                  </label>

                  <label className="flex items-center gap-2 cursor-pointer select-none">
                    <input
                      type="checkbox"
                      checked={includeExplanations}
                      onChange={(e) => setIncludeExplanations(e.target.checked)}
                      disabled={loading}
                      className="rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
                    />
                    <span>Include deep educational explanations</span>
                  </label>
                </div>
              </div>
            )}
          </div>

          {/* Error Banner */}
          {error && (
            <div className="p-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-start gap-2.5">
              <AlertCircle className="w-4 h-4 shrink-0 text-rose-600 mt-0.5" />
              <div className="flex-1">
                <p className="font-semibold mb-0.5">Quiz Generation Error</p>
                <p className="leading-relaxed">{error}</p>
              </div>
            </div>
          )}

          {/* Loading Progress State */}
          {loading && (
            <div className="p-6 bg-indigo-50/60 rounded-xl border border-indigo-100 space-y-3">
              <div className="flex items-center justify-between text-xs text-indigo-900 font-semibold">
                <span className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-indigo-600 animate-pulse" />
                  Generating Your Quiz with Gemini 3.8
                </span>
                <span className="text-indigo-600">{Math.round(((stepIndex + 1) / steps.length) * 100)}%</span>
              </div>
              <div className="w-full bg-indigo-200/60 h-2 rounded-full overflow-hidden">
                <div
                  className="bg-indigo-600 h-full rounded-full transition-all duration-700 ease-out"
                  style={{ width: `${((stepIndex + 1) / steps.length) * 100}%` }}
                />
              </div>
              <p className="text-xs text-indigo-700 font-medium transition-all">
                {steps[stepIndex]}
              </p>
            </div>
          )}

          {/* Submit Action Button */}
          <div>
            <button
              type="submit"
              disabled={loading}
              className="w-full py-4 px-6 bg-slate-900 hover:bg-slate-800 disabled:bg-slate-400 text-white rounded-xl font-semibold text-sm sm:text-base flex items-center justify-center gap-2.5 shadow-sm transition-all transform active:scale-[0.99] cursor-pointer"
            >
              <Sparkles className="w-5 h-5 text-indigo-400" />
              <span>{loading ? 'Synthesizing Quiz...' : `Generate ${questionCount} Questions Quiz`}</span>
              {!loading && <ArrowRight className="w-4 h-4 text-slate-300" />}
            </button>
          </div>
        </form>
      </div>

      {/* Feature Highlights Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-8">
        <div className="p-4 rounded-xl bg-white border border-slate-200/80">
          <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-700 flex items-center justify-center mb-2.5">
            <CheckCircle2 className="w-4 h-4" />
          </div>
          <h4 className="text-sm font-semibold text-slate-900 mb-1">Instant Feedback & Explanations</h4>
          <p className="text-xs text-slate-500 leading-relaxed">
            Every question comes with pedagogical breakdowns explaining why the correct answer is right and correcting common misconceptions.
          </p>
        </div>

        <div className="p-4 rounded-xl bg-white border border-slate-200/80">
          <div className="w-8 h-8 rounded-lg bg-indigo-50 text-indigo-700 flex items-center justify-center mb-2.5">
            <Layers className="w-4 h-4" />
          </div>
          <h4 className="text-sm font-semibold text-slate-900 mb-1">Flashcards & Study Sheets</h4>
          <p className="text-xs text-slate-500 leading-relaxed">
            Flip between interactive test runner, 3D memory flashcards, and printable study guides in one click.
          </p>
        </div>

        <div className="p-4 rounded-xl bg-white border border-slate-200/80">
          <div className="w-8 h-8 rounded-lg bg-amber-50 text-amber-700 flex items-center justify-center mb-2.5">
            <Clock className="w-4 h-4" />
          </div>
          <h4 className="text-sm font-semibold text-slate-900 mb-1">Adaptive Weak Spot Retakes</h4>
          <p className="text-xs text-slate-500 leading-relaxed">
            Missed a few questions? Generate an AI follow-up quiz targeting your exact weak spots for mastery.
          </p>
        </div>
      </div>
    </div>
  );
};
