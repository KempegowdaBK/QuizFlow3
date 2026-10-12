export type QuestionType = 'multiple-choice' | 'true-false' | 'fill-blank';
export type DifficultyLevel = 'beginner' | 'intermediate' | 'advanced' | 'expert';

export interface Question {
  id: string;
  question: string;
  type: QuestionType;
  options: string[];
  correctAnswer: string;
  explanation: string;
  hint?: string;
  difficulty?: 'easy' | 'medium' | 'hard';
  keyConcept?: string;
}

export interface Quiz {
  id: string;
  title: string;
  description: string;
  topic: string;
  difficulty: DifficultyLevel;
  estimatedMinutes?: number;
  tags?: string[];
  questions: Question[];
  createdAt: string;
  sourceType?: 'topic' | 'text' | 'sample';
}

export interface QuizAttempt {
  id: string;
  quizId: string;
  quizTitle: string;
  completedAt: string;
  score: number;
  total: number;
  percentage: number;
  timeSpentSeconds: number;
  userAnswers: Record<string, string>; // questionId -> answer
  flaggedQuestionIds: string[];
}

export interface QuizPlaySettings {
  timerMode: 'none' | 'per-question' | 'total';
  totalTimeMinutes: number;
  perQuestionSeconds: number;
  instantFeedback: boolean;
  shuffleQuestions: boolean;
  soundEnabled: boolean;
}
