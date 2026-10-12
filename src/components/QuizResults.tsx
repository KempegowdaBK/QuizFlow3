import React, { useState, useEffect } from 'react';
import { Quiz, QuizAttempt, Question } from '../types/quiz';
import { sound } from '../utils/sound';
import { downloadQuizJSON, downloadQuizMarkdown, downloadQuizCSV } from '../utils/export';
import { AITutorModal } from './AITutorModal';
import confetti from 'canvas-confetti';
import {
  Trophy,
  RotateCcw,
  Sparkles,
  Layers,
  Download,
  Printer,
  CheckCircle2,
  XCircle,
  Flag,
  HelpCircle,
  Clock,
  ArrowRight,
  Filter,
  Check,
  FileText
} from 'lucide-react';

interface QuizResultsProps {
  quiz: Quiz;
  attempt: QuizAttempt;
  onRetakeAll: () => void;
  onRetakeMissed: (missedQuestions: Question[]) => void;
  onSwitchToFlashcards: () => void;
  onNewQuiz: () => void;
  onMasteryQuizGenerated: (newQuiz: Quiz) => void;
}

export const QuizResults: React.FC<QuizResultsProps> = ({
  quiz,
  attempt,
  onRetakeAll,
  onRetakeMissed,
  onSwitchToFlashcards,
  onNewQuiz,
  onMasteryQuizGenerated,
}) => {
  const [filter, setFilter] = useState<'all' | 'missed' | 'flagged'>('all');
  const [tutorQuestion, setTutorQuestion] = useState<Question | null>(null);
  const [isGeneratingWeakSpots, setIsGeneratingWeakSpots] = useState(false);
  const [exportMenuOpen, setExportMenuOpen] = useState(false);

  // Missed questions computation
  const missedQuestions = quiz.questions.filter(
    (q) => attempt.userAnswers[q.id] !== q.correctAnswer
  );

  const flaggedQuestions = quiz.questions.filter((q) =>
    attempt.flaggedQuestionIds.includes(q.id)
  );

  useEffect(() => {
    sound.playComplete();
    if (attempt.percentage >= 60) {
      try {
        confetti({
          particleCount: 80,
          spread: 70,
          origin: { y: 0.6 },
          colors: ['#4f46e5', '#10b981', '#f59e0b', '#3b82f6'],
        });
      } catch {}
    }
  }, [attempt.percentage]);

  const handleGenerateWeakSpots = async () => {
    if (missedQuestions.length === 0) return;
    setIsGeneratingWeakSpots(true);
    sound.playClick();
    try {
      const res = await fetch('/api/generate-weak-spots-quiz', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          topic: quiz.topic,
          missedQuestions: missedQuestions.map((q) => ({
            question: q.question,
            correctAnswer: q.correctAnswer,
            userAnswer: attempt.userAnswers[q.id],
            keyConcept: q.keyConcept,
          })),
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Failed to generate review quiz');
      }

      const reinforcementQuiz: Quiz = {
        id: `weak_spots_${Date.now()}`,
        title: `Mastery Focus: ${quiz.topic}`,
        description: `Targeted practice based on your previous test results, reinforcing core missed concepts.`,
        topic: quiz.topic,
        difficulty: quiz.difficulty,
        estimatedMinutes: 5,
        tags: [...(quiz.tags || []), 'Mastery', 'Reinforcement'],
        questions: data.quiz.questions,
        createdAt: new Date().toISOString(),
        sourceType: 'topic',
      };

      onMasteryQuizGenerated(reinforcementQuiz);
    } catch (err: any) {
      console.error(err);
      alert(err.message || 'Could not generate targeted quiz. Please try again.');
    } finally {
      setIsGeneratingWeakSpots(false);
    }
  };

  const formatTimer = (totalSecs: number) => {
    const mins = Math.floor(totalSecs / 60);
    const secs = totalSecs % 60;
    return `${mins}m ${secs}s`;
  };

  const getTier = (pct: number) => {
    if (pct === 100) return { label: 'Flawless Mastery!', color: 'text-emerald-700 bg-emerald-50 border-emerald-200' };
    if (pct >= 80) return { label: 'Outstanding Proficiency', color: 'text-indigo-700 bg-indigo-50 border-indigo-200' };
    if (pct >= 60) return { label: 'Solid Grasp', color: 'text-blue-700 bg-blue-50 border-blue-200' };
    return { label: 'Room for Growth', color: 'text-amber-700 bg-amber-50 border-amber-200' };
  };

  const tier = getTier(attempt.percentage);

  // Filtered review questions
  const displayedQuestions = quiz.questions.filter((q) => {
    if (filter === 'missed') return attempt.userAnswers[q.id] !== q.correctAnswer;
    if (filter === 'flagged') return attempt.flaggedQuestionIds.includes(q.id);
    return true;
  });

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      {/* Score Summary Card */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 sm:p-8 shadow-sm mb-6 text-center">
        <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-indigo-50 text-indigo-600 mb-4 shadow-xs">
          <Trophy className="w-7 h-7" />
        </div>

        <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight mb-2">
          Quiz Completed!
        </h1>
        <p className="text-sm text-slate-500 mb-6">{quiz.title}</p>

        {/* Big Metrics Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 max-w-2xl mx-auto mb-6">
          <div className="p-4 rounded-xl bg-slate-50 border border-slate-100">
            <span className="text-2xl sm:text-3xl font-black text-slate-900 block">
              {attempt.percentage}%
            </span>
            <span className="text-xs text-slate-500 font-medium">Final Score</span>
          </div>

          <div className="p-4 rounded-xl bg-slate-50 border border-slate-100">
            <span className="text-2xl sm:text-3xl font-black text-emerald-700 block">
              {attempt.score} / {attempt.total}
            </span>
            <span className="text-xs text-slate-500 font-medium">Correct Answers</span>
          </div>

          <div className="p-4 rounded-xl bg-slate-50 border border-slate-100">
            <span className="text-2xl sm:text-3xl font-black text-slate-900 block">
              {formatTimer(attempt.timeSpentSeconds)}
            </span>
            <span className="text-xs text-slate-500 font-medium">Time Taken</span>
          </div>

          <div className="p-4 rounded-xl bg-slate-50 border border-slate-100">
            <span className="text-2xl sm:text-3xl font-black text-rose-700 block">
              {missedQuestions.length}
            </span>
            <span className="text-xs text-slate-500 font-medium">Needs Review</span>
          </div>
        </div>

        {/* Tier badge */}
        <div className="inline-block mb-6">
          <span className={`px-3 py-1 rounded-full text-xs font-semibold border ${tier.color}`}>
            {tier.label}
          </span>
        </div>

        {/* Action Buttons Toolbar */}
        <div className="flex flex-wrap items-center justify-center gap-2.5 pt-6 border-t border-slate-100">
          {missedQuestions.length > 0 && (
            <button
              onClick={() => {
                sound.playClick();
                onRetakeMissed(missedQuestions);
              }}
              className="px-4 py-2.5 bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-xs sm:text-sm font-semibold transition-colors flex items-center gap-1.5 shadow-xs"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Practice {missedQuestions.length} Missed Only</span>
            </button>
          )}

          {missedQuestions.length > 0 && (
            <button
              onClick={handleGenerateWeakSpots}
              disabled={isGeneratingWeakSpots}
              className="px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-60 text-white rounded-xl text-xs sm:text-sm font-semibold transition-colors flex items-center gap-1.5 shadow-xs"
            >
              <Sparkles className="w-3.5 h-3.5 text-indigo-300" />
              <span>{isGeneratingWeakSpots ? 'Generating Mastery Quiz...' : 'AI Follow-Up on Weak Spots'}</span>
            </button>
          )}

          <button
            onClick={() => {
              sound.playClick();
              onRetakeAll();
            }}
            className="px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-xl text-xs sm:text-sm font-medium transition-colors flex items-center gap-1.5"
          >
            <RotateCcw className="w-3.5 h-3.5 text-slate-600" />
            <span>Retake Full Test</span>
          </button>

          <button
            onClick={() => {
              sound.playClick();
              onSwitchToFlashcards();
            }}
            className="px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-xl text-xs sm:text-sm font-medium transition-colors flex items-center gap-1.5"
          >
            <Layers className="w-3.5 h-3.5 text-slate-600" />
            <span>Study Flashcards</span>
          </button>

          {/* Export Dropdown */}
          <div className="relative">
            <button
              onClick={() => setExportMenuOpen(!exportMenuOpen)}
              className="px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-xl text-xs sm:text-sm font-medium transition-colors flex items-center gap-1.5"
            >
              <Download className="w-3.5 h-3.5 text-slate-600" />
              <span>Export</span>
            </button>

            {exportMenuOpen && (
              <div className="absolute right-0 mt-2 w-48 bg-white rounded-xl shadow-lg border border-slate-200 py-1 z-30 text-left text-xs">
                <button
                  onClick={() => {
                    downloadQuizMarkdown(quiz);
                    setExportMenuOpen(false);
                  }}
                  className="w-full px-3 py-2 hover:bg-slate-50 text-slate-700 flex items-center gap-2"
                >
                  <FileText className="w-3.5 h-3.5 text-slate-500" />
                  <span>Markdown Study Guide</span>
                </button>
                <button
                  onClick={() => {
                    downloadQuizCSV(quiz);
                    setExportMenuOpen(false);
                  }}
                  className="w-full px-3 py-2 hover:bg-slate-50 text-slate-700 flex items-center gap-2"
                >
                  <FileText className="w-3.5 h-3.5 text-slate-500" />
                  <span>CSV (Anki & Quizlet)</span>
                </button>
                <button
                  onClick={() => {
                    downloadQuizJSON(quiz);
                    setExportMenuOpen(false);
                  }}
                  className="w-full px-3 py-2 hover:bg-slate-50 text-slate-700 flex items-center gap-2"
                >
                  <Download className="w-3.5 h-3.5 text-slate-500" />
                  <span>QuizForge JSON</span>
                </button>
                <button
                  onClick={() => {
                    window.print();
                    setExportMenuOpen(false);
                  }}
                  className="w-full px-3 py-2 hover:bg-slate-50 text-slate-700 flex items-center gap-2 border-t border-slate-100"
                >
                  <Printer className="w-3.5 h-3.5 text-slate-500" />
                  <span>Print Test Sheet</span>
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Question Breakdown Header & Filter */}
      <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
        <div>
          <h2 className="text-base font-bold text-slate-900">Detailed Question Breakdown</h2>
          <p className="text-xs text-slate-500">Review answers, explanations, and key learning points</p>
        </div>

        {/* Filter Segmented Control */}
        <div className="flex items-center gap-1 p-1 bg-slate-100 rounded-xl text-xs font-medium">
          <button
            onClick={() => {
              sound.playClick();
              setFilter('all');
            }}
            className={`px-3 py-1.5 rounded-lg transition-all ${
              filter === 'all'
                ? 'bg-white text-slate-900 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            All ({quiz.questions.length})
          </button>

          <button
            onClick={() => {
              sound.playClick();
              setFilter('missed');
            }}
            className={`px-3 py-1.5 rounded-lg transition-all ${
              filter === 'missed'
                ? 'bg-white text-slate-900 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Missed ({missedQuestions.length})
          </button>

          {flaggedQuestions.length > 0 && (
            <button
              onClick={() => {
                sound.playClick();
                setFilter('flagged');
              }}
              className={`px-3 py-1.5 rounded-lg transition-all ${
                filter === 'flagged'
                  ? 'bg-white text-slate-900 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Flagged ({flaggedQuestions.length})
            </button>
          )}
        </div>
      </div>

      {/* Questions Review List */}
      <div className="space-y-4">
        {displayedQuestions.map((q, idx) => {
          const userAns = attempt.userAnswers[q.id];
          const isCorrect = userAns === q.correctAnswer;
          const isFlagged = attempt.flaggedQuestionIds.includes(q.id);

          return (
            <div
              key={q.id}
              className={`p-5 rounded-2xl border transition-all ${
                isCorrect
                  ? 'bg-white border-slate-200'
                  : 'bg-rose-50/20 border-rose-200/80'
              }`}
            >
              {/* Question metadata header */}
              <div className="flex items-center justify-between text-xs text-slate-500 mb-2">
                <div className="flex items-center gap-2">
                  <span className="font-semibold text-slate-700">Question {idx + 1}</span>
                  {q.keyConcept && (
                    <>
                      <span>·</span>
                      <span className="text-indigo-700 font-medium">{q.keyConcept}</span>
                    </>
                  )}
                </div>

                <div className="flex items-center gap-2">
                  {isFlagged && (
                    <span className="flex items-center gap-1 text-amber-600">
                      <Flag className="w-3 h-3 fill-amber-500" />
                      <span>Flagged</span>
                    </span>
                  )}
                  {isCorrect ? (
                    <span className="flex items-center gap-1 text-emerald-700 font-semibold">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                      <span>Correct</span>
                    </span>
                  ) : (
                    <span className="flex items-center gap-1 text-rose-700 font-semibold">
                      <XCircle className="w-3.5 h-3.5 text-rose-600" />
                      <span>Incorrect</span>
                    </span>
                  )}
                </div>
              </div>

              {/* Question text */}
              <h3 className="text-sm sm:text-base font-semibold text-slate-900 mb-3 leading-snug">
                {q.question}
              </h3>

              {/* Options status */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mb-3">
                {q.options?.map((opt, oIdx) => {
                  const isThisCorrect = opt === q.correctAnswer;
                  const isThisUserPick = opt === userAns;

                  let style = 'bg-slate-50 border-slate-200/80 text-slate-700';
                  if (isThisCorrect) {
                    style = 'bg-emerald-50 border-emerald-300 text-emerald-950 font-medium';
                  } else if (isThisUserPick && !isThisCorrect) {
                    style = 'bg-rose-50 border-rose-300 text-rose-950 font-medium';
                  }

                  return (
                    <div
                      key={oIdx}
                      className={`p-2.5 rounded-xl border text-xs flex items-center justify-between ${style}`}
                    >
                      <span className="truncate pr-2">{opt}</span>
                      {isThisCorrect && (
                        <span className="text-[10px] font-bold text-emerald-700 uppercase shrink-0">
                          Correct
                        </span>
                      )}
                      {isThisUserPick && !isThisCorrect && (
                        <span className="text-[10px] font-bold text-rose-700 uppercase shrink-0">
                          Your Answer
                        </span>
                      )}
                    </div>
                  );
                })}
              </div>

              {/* Detailed Explanation */}
              <div className="p-3.5 rounded-xl bg-slate-50/80 border border-slate-200/60 text-xs text-slate-700 leading-relaxed mb-3">
                <span className="font-semibold text-slate-900 block mb-0.5">Explanation:</span>
                {q.explanation}
              </div>

              {/* AI Tutor Button on Question */}
              <div className="flex justify-end">
                <button
                  type="button"
                  onClick={() => {
                    sound.playClick();
                    setTutorQuestion(q);
                  }}
                  className="text-xs font-semibold text-indigo-700 hover:text-indigo-900 flex items-center gap-1 transition-colors px-2 py-1 rounded-lg hover:bg-indigo-50"
                >
                  <Sparkles className="w-3.5 h-3.5 text-indigo-600" />
                  <span>Ask AI Tutor about this question</span>
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Tutor Modal */}
      {tutorQuestion && (
        <AITutorModal
          question={tutorQuestion}
          userAnswer={attempt.userAnswers[tutorQuestion.id]}
          isOpen={true}
          onClose={() => setTutorQuestion(null)}
        />
      )}
    </div>
  );
};
