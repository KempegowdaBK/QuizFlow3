import React, { useState, useEffect, useCallback } from 'react';
import { Quiz, Question, QuizAttempt, QuizPlaySettings } from '../types/quiz';
import { sound } from '../utils/sound';
import { AITutorModal } from './AITutorModal';
import {
  ChevronLeft,
  ChevronRight,
  Flag,
  HelpCircle,
  Clock,
  Sparkles,
  CheckCircle2,
  XCircle,
  LayoutGrid,
  RotateCcw,
  SlidersHorizontal,
  Lightbulb,
  Check
} from 'lucide-react';

interface QuizPlayerProps {
  quiz: Quiz;
  onFinishQuiz: (attempt: QuizAttempt) => void;
  onExit: () => void;
  onSwitchToFlashcards: () => void;
}

export const QuizPlayer: React.FC<QuizPlayerProps> = ({
  quiz,
  onFinishQuiz,
  onExit,
  onSwitchToFlashcards,
}) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [userAnswers, setUserAnswers] = useState<Record<string, string>>({});
  const [flaggedIds, setFlaggedIds] = useState<Set<string>>(new Set());
  const [revealedHints, setRevealedHints] = useState<Set<string>>(new Set());

  // Settings
  const [instantFeedback, setInstantFeedback] = useState<boolean>(true);
  const [showQuestionGrid, setShowQuestionGrid] = useState<boolean>(false);
  const [tutorQuestion, setTutorQuestion] = useState<Question | null>(null);

  // Timer State
  const [secondsElapsed, setSecondsElapsed] = useState(0);
  const [isTimerRunning, setIsTimerRunning] = useState(true);

  const currentQuestion = quiz.questions[currentIndex];
  const isLastQuestion = currentIndex === quiz.questions.length - 1;
  const currentAnswer = userAnswers[currentQuestion?.id];
  const isAnswered = currentAnswer !== undefined;

  // Track timer
  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (isTimerRunning) {
      timer = setInterval(() => {
        setSecondsElapsed((prev) => prev + 1);
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [isTimerRunning]);

  // Handle Option Select
  const handleSelectOption = (option: string) => {
    if (instantFeedback && isAnswered) {
      // In instant feedback mode, don't allow re-answering once locked
      return;
    }

    sound.playClick();
    const isCorrect = option === currentQuestion.correctAnswer;
    if (instantFeedback) {
      if (isCorrect) {
        sound.playCorrect();
      } else {
        sound.playIncorrect();
      }
    }

    setUserAnswers((prev) => ({
      ...prev,
      [currentQuestion.id]: option,
    }));
  };

  // Flag toggle
  const toggleFlag = (id: string) => {
    sound.playClick();
    setFlaggedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  // Reveal hint
  const toggleHint = (id: string) => {
    sound.playClick();
    setRevealedHints((prev) => {
      const next = new Set(prev);
      next.add(id);
      return next;
    });
  };

  // Next / Previous navigation
  const handleNext = () => {
    sound.playClick();
    if (currentIndex < quiz.questions.length - 1) {
      setCurrentIndex((prev) => prev + 1);
    } else {
      handleComplete();
    }
  };

  const handlePrev = () => {
    sound.playClick();
    if (currentIndex > 0) {
      setCurrentIndex((prev) => prev - 1);
    }
  };

  // Complete Quiz & Compute Score
  const handleComplete = () => {
    setIsTimerRunning(false);

    let score = 0;
    quiz.questions.forEach((q) => {
      if (userAnswers[q.id] === q.correctAnswer) {
        score += 1;
      }
    });

    const total = quiz.questions.length;
    const percentage = Math.round((score / total) * 100);

    const attempt: QuizAttempt = {
      id: `attempt_${Date.now()}`,
      quizId: quiz.id,
      quizTitle: quiz.title,
      completedAt: new Date().toISOString(),
      score,
      total,
      percentage,
      timeSpentSeconds: secondsElapsed,
      userAnswers,
      flaggedQuestionIds: Array.from(flaggedIds),
    };

    onFinishQuiz(attempt);
  };

  // Keyboard navigation shortcuts
  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      // Ignore if in inputs
      if (['INPUT', 'TEXTAREA'].includes((e.target as HTMLElement)?.tagName)) return;

      if (!currentQuestion) return;

      // 1-4 or A-D option selection
      const key = e.key.toUpperCase();
      const options = currentQuestion.options || [];

      let optionIndex = -1;
      if (['1', '2', '3', '4'].includes(key)) {
        optionIndex = parseInt(key, 10) - 1;
      } else if (['A', 'B', 'C', 'D'].includes(key)) {
        optionIndex = key.charCodeAt(0) - 65;
      }

      if (optionIndex >= 0 && optionIndex < options.length) {
        handleSelectOption(options[optionIndex]);
      } else if (e.key === 'ArrowRight' || e.key === 'Enter') {
        if (isAnswered || !instantFeedback) {
          handleNext();
        }
      } else if (e.key === 'ArrowLeft') {
        handlePrev();
      } else if (key === 'F') {
        toggleFlag(currentQuestion.id);
      } else if (key === 'H' && currentQuestion.hint) {
        toggleHint(currentQuestion.id);
      }
    },
    [currentQuestion, isAnswered, instantFeedback, currentIndex]
  );

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleKeyDown]);

  const formatTimer = (totalSecs: number) => {
    const mins = Math.floor(totalSecs / 60);
    const secs = totalSecs % 60;
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
  };

  const answeredCount = Object.keys(userAnswers).length;
  const progressPercent = Math.round(((currentIndex + 1) / quiz.questions.length) * 100);

  return (
    <div className="max-w-4xl mx-auto px-4 py-6">
      {/* Quiz Top Status Bar */}
      <div className="bg-white rounded-2xl border border-slate-200 p-4 sm:p-5 shadow-xs mb-6">
        <div className="flex flex-wrap items-center justify-between gap-3 mb-3">
          {/* Back & Title */}
          <div className="flex items-center gap-3">
            <button
              onClick={onExit}
              className="text-xs font-semibold text-slate-500 hover:text-slate-800 flex items-center gap-1 transition-colors px-2 py-1 rounded-lg hover:bg-slate-100"
            >
              <ChevronLeft className="w-4 h-4" />
              <span>Back</span>
            </button>
            <div className="h-4 w-px bg-slate-200" />
            <div>
              <h2 className="text-sm font-bold text-slate-900 truncate max-w-[200px] sm:max-w-sm">
                {quiz.title}
              </h2>
              <div className="flex items-center gap-2 text-xs text-slate-500">
                <span className="capitalize">{quiz.difficulty}</span>
                <span>·</span>
                <span>{quiz.topic}</span>
              </div>
            </div>
          </div>

          {/* Right Controls */}
          <div className="flex items-center gap-2.5">
            {/* Timer Badge */}
            <div className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-slate-100 text-slate-700 text-xs font-medium border border-slate-200/60">
              <Clock className="w-3.5 h-3.5 text-slate-500" />
              <span>{formatTimer(secondsElapsed)}</span>
            </div>

            {/* Instant Mode Toggle */}
            <button
              type="button"
              onClick={() => {
                sound.playClick();
                setInstantFeedback(!instantFeedback);
              }}
              title={instantFeedback ? 'Instant Feedback: Explanations show immediately' : 'Exam Mode: Explanations hidden until test submit'}
              className={`px-2.5 py-1.5 rounded-lg text-xs font-medium border transition-colors flex items-center gap-1.5 ${
                instantFeedback
                  ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                  : 'bg-slate-100 text-slate-700 border-slate-200'
              }`}
            >
              <SlidersHorizontal className="w-3 h-3" />
              <span className="hidden sm:inline">{instantFeedback ? 'Study Mode' : 'Exam Mode'}</span>
            </button>

            {/* Grid Map Toggle */}
            <button
              type="button"
              onClick={() => {
                sound.playClick();
                setShowQuestionGrid(!showQuestionGrid);
              }}
              className={`p-1.5 rounded-lg border text-xs font-medium transition-colors ${
                showQuestionGrid
                  ? 'bg-slate-900 text-white border-slate-900'
                  : 'bg-slate-100 text-slate-700 border-slate-200 hover:bg-slate-200'
              }`}
              title="Question Map Navigator"
            >
              <LayoutGrid className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Linear Progress Bar */}
        <div className="space-y-1.5">
          <div className="flex items-center justify-between text-xs text-slate-500 font-medium">
            <span>Question {currentIndex + 1} of {quiz.questions.length}</span>
            <span>{answeredCount} of {quiz.questions.length} answered ({progressPercent}%)</span>
          </div>
          <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
            <div
              className="bg-slate-900 h-full rounded-full transition-all duration-300 ease-out"
              style={{ width: `${progressPercent}%` }}
            />
          </div>
        </div>

        {/* Question Map Drawer */}
        {showQuestionGrid && (
          <div className="mt-4 pt-4 border-t border-slate-100">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-semibold text-slate-700">Question Jump Grid</span>
              <div className="flex items-center gap-3 text-[11px] text-slate-500">
                <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-emerald-500 inline-block" /> Answered</span>
                <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-amber-500 inline-block" /> Flagged</span>
                <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-slate-300 inline-block" /> Unanswered</span>
              </div>
            </div>
            <div className="grid grid-cols-5 sm:grid-cols-10 gap-1.5">
              {quiz.questions.map((q, idx) => {
                const ans = userAnswers[q.id];
                const isFlag = flaggedIds.has(q.id);
                const isCurrent = idx === currentIndex;

                return (
                  <button
                    key={q.id}
                    onClick={() => {
                      sound.playClick();
                      setCurrentIndex(idx);
                      setShowQuestionGrid(false);
                    }}
                    className={`h-8 rounded-lg text-xs font-medium flex items-center justify-center relative transition-all ${
                      isCurrent
                        ? 'ring-2 ring-slate-900 font-bold bg-white text-slate-900 shadow-xs'
                        : ans
                        ? 'bg-emerald-100 text-emerald-800'
                        : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                    }`}
                  >
                    <span>{idx + 1}</span>
                    {isFlag && (
                      <span className="absolute top-1 right-1 w-1.5 h-1.5 rounded-full bg-amber-500" />
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        )}
      </div>

      {/* Main Question Card */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden mb-6">
        {/* Card Header with concept & flag */}
        <div className="px-6 py-4 bg-slate-50/70 border-b border-slate-100 flex items-center justify-between">
          <div className="flex items-center gap-2 text-xs text-slate-500">
            {currentQuestion.keyConcept && (
              <span className="font-semibold text-indigo-700">{currentQuestion.keyConcept}</span>
            )}
            {currentQuestion.difficulty && (
              <>
                <span>·</span>
                <span className="capitalize">{currentQuestion.difficulty}</span>
              </>
            )}
          </div>

          <div className="flex items-center gap-2">
            {/* Flag for Review */}
            <button
              onClick={() => toggleFlag(currentQuestion.id)}
              className={`p-1.5 rounded-lg text-xs font-medium flex items-center gap-1 transition-colors ${
                flaggedIds.has(currentQuestion.id)
                  ? 'bg-amber-100 text-amber-800'
                  : 'text-slate-400 hover:text-slate-700 hover:bg-slate-100'
              }`}
              title="Flag this question for review"
            >
              <Flag className={`w-3.5 h-3.5 ${flaggedIds.has(currentQuestion.id) ? 'fill-amber-600' : ''}`} />
              <span className="hidden sm:inline">
                {flaggedIds.has(currentQuestion.id) ? 'Flagged' : 'Flag'}
              </span>
            </button>

            {/* Ask AI Tutor */}
            <button
              onClick={() => {
                sound.playClick();
                setTutorQuestion(currentQuestion);
              }}
              className="px-2.5 py-1.5 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 border border-indigo-200/60 rounded-lg text-xs font-medium flex items-center gap-1.5 transition-colors"
            >
              <Sparkles className="w-3.5 h-3.5 text-indigo-600" />
              <span>Ask AI Tutor</span>
            </button>
          </div>
        </div>

        {/* Question Content */}
        <div className="p-6 sm:p-8 space-y-6">
          <h3 className="text-lg sm:text-xl font-bold text-slate-900 leading-snug">
            {currentQuestion.question}
          </h3>

          {/* Answer Options */}
          <div className="space-y-3">
            {currentQuestion.options?.map((option, optIdx) => {
              const letter = String.fromCharCode(65 + optIdx);
              const isSelected = currentAnswer === option;
              const isCorrect = option === currentQuestion.correctAnswer;
              
              // Styling based on feedback mode
              let optionStyle = 'bg-white hover:bg-slate-50 border-slate-200 text-slate-800';
              let badgeStyle = 'bg-slate-100 text-slate-700 border-slate-200';

              if (instantFeedback && isAnswered) {
                if (isCorrect) {
                  optionStyle = 'bg-emerald-50/90 border-emerald-400 text-emerald-950 font-medium';
                  badgeStyle = 'bg-emerald-600 text-white border-emerald-600';
                } else if (isSelected && !isCorrect) {
                  optionStyle = 'bg-rose-50/90 border-rose-400 text-rose-950 font-medium';
                  badgeStyle = 'bg-rose-600 text-white border-rose-600';
                } else {
                  optionStyle = 'bg-white opacity-50 border-slate-200 text-slate-500';
                }
              } else if (isSelected) {
                optionStyle = 'bg-indigo-50/70 border-indigo-500 text-indigo-950 ring-1 ring-indigo-500';
                badgeStyle = 'bg-indigo-600 text-white border-indigo-600';
              }

              return (
                <button
                  key={optIdx}
                  type="button"
                  onClick={() => handleSelectOption(option)}
                  disabled={instantFeedback && isAnswered}
                  className={`w-full p-4 rounded-xl border text-left flex items-start gap-3.5 transition-all cursor-pointer group ${optionStyle}`}
                >
                  <span className={`w-7 h-7 rounded-lg border flex items-center justify-center font-bold text-xs shrink-0 transition-colors ${badgeStyle}`}>
                    {instantFeedback && isAnswered && isCorrect ? (
                      <Check className="w-4 h-4 stroke-[3]" />
                    ) : instantFeedback && isAnswered && isSelected && !isCorrect ? (
                      <XCircle className="w-4 h-4" />
                    ) : (
                      letter
                    )}
                  </span>
                  <span className="text-sm sm:text-base leading-relaxed pt-0.5 flex-1">
                    {option}
                  </span>
                </button>
              );
            })}
          </div>

          {/* Hint disclosure */}
          {currentQuestion.hint && (
            <div>
              {revealedHints.has(currentQuestion.id) ? (
                <div className="p-3.5 rounded-xl bg-amber-50/70 border border-amber-200/80 text-amber-900 text-xs flex items-start gap-2.5">
                  <Lightbulb className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                  <div>
                    <span className="font-semibold block mb-0.5">Hint:</span>
                    <p className="leading-relaxed">{currentQuestion.hint}</p>
                  </div>
                </div>
              ) : (
                <button
                  type="button"
                  onClick={() => toggleHint(currentQuestion.id)}
                  className="text-xs font-semibold text-slate-500 hover:text-indigo-600 flex items-center gap-1.5 transition-colors py-1"
                >
                  <Lightbulb className="w-3.5 h-3.5 text-amber-500" />
                  <span>Stuck? Reveal a hint</span>
                </button>
              )}
            </div>
          )}

          {/* Instant feedback explanation disclosure */}
          {instantFeedback && isAnswered && (
            <div className={`p-4 rounded-xl border text-xs sm:text-sm leading-relaxed space-y-2 animate-in fade-in-50 duration-200 ${
              currentAnswer === currentQuestion.correctAnswer
                ? 'bg-emerald-50/80 border-emerald-200 text-emerald-950'
                : 'bg-slate-50 border-slate-200 text-slate-800'
            }`}>
              <div className="flex items-center gap-2 font-semibold">
                {currentAnswer === currentQuestion.correctAnswer ? (
                  <>
                    <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                    <span className="text-emerald-900">Correct! Excellent job.</span>
                  </>
                ) : (
                  <>
                    <XCircle className="w-4 h-4 text-rose-600" />
                    <span className="text-rose-900">Not quite. The correct answer is {currentQuestion.correctAnswer}.</span>
                  </>
                )}
              </div>
              <p className="text-slate-700">
                {currentQuestion.explanation}
              </p>
            </div>
          )}
        </div>

        {/* Footer Navigation Bar */}
        <div className="px-6 py-4 bg-slate-50 border-t border-slate-100 flex items-center justify-between gap-3">
          <button
            type="button"
            onClick={handlePrev}
            disabled={currentIndex === 0}
            className="px-4 py-2 text-xs sm:text-sm font-semibold text-slate-700 hover:text-slate-900 disabled:opacity-30 disabled:hover:text-slate-700 rounded-xl hover:bg-slate-200/60 transition-colors flex items-center gap-1.5"
          >
            <ChevronLeft className="w-4 h-4" />
            <span>Previous</span>
          </button>

          <div className="flex items-center gap-2">
            {isLastQuestion ? (
              <button
                type="button"
                onClick={handleComplete}
                className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs sm:text-sm font-semibold shadow-xs transition-colors flex items-center gap-1.5 cursor-pointer"
              >
                <span>Submit & Review Score</span>
                <CheckCircle2 className="w-4 h-4" />
              </button>
            ) : (
              <button
                type="button"
                onClick={handleNext}
                className="px-5 py-2.5 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs sm:text-sm font-semibold shadow-xs transition-colors flex items-center gap-1.5 cursor-pointer"
              >
                <span>Next Question</span>
                <ChevronRight className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>
      </div>

      {/* AI Tutor Modal */}
      {tutorQuestion && (
        <AITutorModal
          question={tutorQuestion}
          userAnswer={userAnswers[tutorQuestion.id]}
          isOpen={true}
          onClose={() => setTutorQuestion(null)}
        />
      )}
    </div>
  );
};
