import React, { useState, useEffect, useCallback } from 'react';
import { Quiz, Question } from '../types/quiz';
import { sound } from '../utils/sound';
import {
  ChevronLeft,
  ChevronRight,
  RotateCw,
  Shuffle,
  CheckCircle2,
  XCircle,
  Sparkles,
  HelpCircle,
  Lightbulb
} from 'lucide-react';

interface FlashcardViewerProps {
  quiz: Quiz;
  onExit: () => void;
  onStartQuiz: () => void;
}

export const FlashcardViewer: React.FC<FlashcardViewerProps> = ({
  quiz,
  onExit,
  onStartQuiz,
}) => {
  const [cards, setCards] = useState<Question[]>(quiz.questions);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [masteredIds, setMasteredIds] = useState<Set<string>>(new Set());

  const currentCard = cards[currentIndex];

  const handleFlip = () => {
    sound.playClick();
    setIsFlipped(!isFlipped);
  };

  const handleNext = () => {
    sound.playClick();
    setIsFlipped(false);
    setCurrentIndex((prev) => (prev < cards.length - 1 ? prev + 1 : 0));
  };

  const handlePrev = () => {
    sound.playClick();
    setIsFlipped(false);
    setCurrentIndex((prev) => (prev > 0 ? prev - 1 : cards.length - 1));
  };

  const handleShuffle = () => {
    sound.playClick();
    setIsFlipped(false);
    const shuffled = [...cards].sort(() => Math.random() - 0.5);
    setCards(shuffled);
    setCurrentIndex(0);
  };

  const toggleMastered = (id: string) => {
    sound.playClick();
    setMasteredIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else {
        next.add(id);
        sound.playCorrect();
      }
      return next;
    });
  };

  // Keyboard controls
  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (e.key === ' ' || e.code === 'Space') {
        e.preventDefault();
        handleFlip();
      } else if (e.key === 'ArrowRight') {
        handleNext();
      } else if (e.key === 'ArrowLeft') {
        handlePrev();
      } else if (e.key.toLowerCase() === 'm' && currentCard) {
        toggleMastered(currentCard.id);
      }
    },
    [isFlipped, currentIndex, cards, currentCard]
  );

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleKeyDown]);

  if (!currentCard) return null;

  const isMastered = masteredIds.has(currentCard.id);
  const progressPercent = Math.round(((currentIndex + 1) / cards.length) * 100);

  return (
    <div className="max-w-3xl mx-auto px-4 py-8">
      {/* Top Header */}
      <div className="flex flex-wrap items-center justify-between gap-3 mb-6">
        <button
          onClick={onExit}
          className="text-xs font-semibold text-slate-500 hover:text-slate-800 flex items-center gap-1 transition-colors px-2 py-1 rounded-lg hover:bg-slate-100"
        >
          <ChevronLeft className="w-4 h-4" />
          <span>Exit Flashcards</span>
        </button>

        <div className="flex items-center gap-2">
          <button
            onClick={handleShuffle}
            className="px-3 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-medium flex items-center gap-1.5 transition-colors"
            title="Shuffle deck"
          >
            <Shuffle className="w-3.5 h-3.5" />
            <span>Shuffle</span>
          </button>

          <button
            onClick={onStartQuiz}
            className="px-3 py-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 text-white text-xs font-medium flex items-center gap-1.5 transition-colors shadow-xs"
          >
            <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
            <span>Take Test</span>
          </button>
        </div>
      </div>

      {/* Title & Progress */}
      <div className="text-center mb-6">
        <h2 className="text-xl font-bold text-slate-900 mb-1">{quiz.title}</h2>
        <p className="text-xs text-slate-500 mb-3">
          Card {currentIndex + 1} of {cards.length} · {masteredIds.size} Mastered
        </p>

        <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden max-w-md mx-auto">
          <div
            className="bg-indigo-600 h-full rounded-full transition-all duration-300"
            style={{ width: `${progressPercent}%` }}
          />
        </div>
      </div>

      {/* 3D Flashcard Box */}
      <div
        onClick={handleFlip}
        className="w-full min-h-[340px] bg-white rounded-3xl border border-slate-200 p-8 shadow-md hover:shadow-lg transition-all cursor-pointer flex flex-col justify-between select-none relative group"
      >
        {/* Card Header */}
        <div className="flex items-center justify-between text-xs text-slate-500">
          <span className="font-semibold text-indigo-600">
            {isFlipped ? 'ANSWER & EXPLANATION' : 'QUESTION'}
          </span>
          {currentCard.keyConcept && (
            <span className="text-slate-400">{currentCard.keyConcept}</span>
          )}
        </div>

        {/* Card Center Content */}
        <div className="my-auto py-6 text-center">
          {!isFlipped ? (
            <div className="space-y-4">
              <h3 className="text-xl sm:text-2xl font-bold text-slate-900 leading-snug">
                {currentCard.question}
              </h3>
              <p className="text-xs text-slate-400 font-medium">Click card or press Space to reveal answer</p>
            </div>
          ) : (
            <div className="space-y-4 animate-in fade-in-50 duration-200">
              <div className="p-3.5 rounded-xl bg-emerald-50 text-emerald-900 border border-emerald-200 max-w-lg mx-auto">
                <span className="text-xs font-bold uppercase tracking-wider block mb-1 text-emerald-700">Correct Answer</span>
                <p className="text-lg font-bold">{currentCard.correctAnswer}</p>
              </div>

              <p className="text-sm text-slate-700 leading-relaxed max-w-lg mx-auto">
                {currentCard.explanation}
              </p>

              {currentCard.hint && (
                <div className="text-xs text-amber-800 bg-amber-50 p-2.5 rounded-lg max-w-md mx-auto flex items-center justify-center gap-1.5">
                  <Lightbulb className="w-3.5 h-3.5 text-amber-600 shrink-0" />
                  <span>{currentCard.hint}</span>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Card Footer Controls */}
        <div className="flex items-center justify-between pt-4 border-t border-slate-100 text-xs">
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              toggleMastered(currentCard.id);
            }}
            className={`px-3 py-1.5 rounded-xl font-medium flex items-center gap-1.5 transition-colors ${
              isMastered
                ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            <CheckCircle2 className={`w-4 h-4 ${isMastered ? 'text-emerald-600' : 'text-slate-400'}`} />
            <span>{isMastered ? 'Mastered' : 'Mark as Mastered (M)'}</span>
          </button>

          <span className="text-slate-400 flex items-center gap-1">
            <RotateCw className="w-3.5 h-3.5 group-hover:rotate-180 transition-transform duration-300" />
            <span>Click to flip</span>
          </span>
        </div>
      </div>

      {/* Navigation Bar */}
      <div className="flex items-center justify-between mt-6 max-w-sm mx-auto">
        <button
          onClick={handlePrev}
          className="p-3 rounded-2xl bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 shadow-xs transition-colors"
          title="Previous Card (Left Arrow)"
        >
          <ChevronLeft className="w-5 h-5" />
        </button>

        <span className="text-xs font-medium text-slate-500">
          Use ← and → keys to navigate
        </span>

        <button
          onClick={handleNext}
          className="p-3 rounded-2xl bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 shadow-xs transition-colors"
          title="Next Card (Right Arrow)"
        >
          <ChevronRight className="w-5 h-5" />
        </button>
      </div>
    </div>
  );
};
