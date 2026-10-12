import React, { useState, useEffect } from 'react';
import { Quiz, QuizAttempt, Question } from './types/quiz';
import { SAMPLE_QUIZZES } from './data/sampleQuizzes';
import { sound } from './utils/sound';
import { Header, ActiveTab } from './components/Header';
import { QuizGenerator } from './components/QuizGenerator';
import { QuizPlayer } from './components/QuizPlayer';
import { QuizResults } from './components/QuizResults';
import { FlashcardViewer } from './components/FlashcardViewer';
import { SavedQuizzes } from './components/SavedQuizzes';
import { ExploreGallery } from './components/ExploreGallery';
import { AnalyticsView } from './components/AnalyticsView';
import { QuizEditor } from './components/QuizEditor';

const STORAGE_KEY_QUIZZES = 'quizforge_saved_quizzes_v1';
const STORAGE_KEY_ATTEMPTS = 'quizforge_attempts_v1';
const STORAGE_KEY_SOUND = 'quizforge_sound_v1';

export default function App() {
  const [activeTab, setActiveTab] = useState<ActiveTab>('generate');
  const [view, setView] = useState<'main' | 'playing' | 'results' | 'flashcards'>('main');

  const [activeQuiz, setActiveQuiz] = useState<Quiz | null>(null);
  const [activeAttempt, setActiveAttempt] = useState<QuizAttempt | null>(null);

  const [savedQuizzes, setSavedQuizzes] = useState<Quiz[]>(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY_QUIZZES);
      if (stored) return JSON.parse(stored);
    } catch {}
    return SAMPLE_QUIZZES;
  });

  const [attempts, setAttempts] = useState<QuizAttempt[]>(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY_ATTEMPTS);
      if (stored) return JSON.parse(stored);
    } catch {}
    return [];
  });

  const [soundEnabled, setSoundEnabled] = useState<boolean>(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY_SOUND);
      return stored !== null ? JSON.parse(stored) : true;
    } catch {
      return true;
    }
  });

  const [editingQuiz, setEditingQuiz] = useState<Quiz | null>(null);
  const [prefillTopic, setPrefillTopic] = useState<string>('');

  // Sync sound setting
  useEffect(() => {
    sound.enabled = soundEnabled;
    try {
      localStorage.setItem(STORAGE_KEY_SOUND, JSON.stringify(soundEnabled));
    } catch {}
  }, [soundEnabled]);

  // Persist quizzes
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY_QUIZZES, JSON.stringify(savedQuizzes));
    } catch {}
  }, [savedQuizzes]);

  // Persist attempts
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY_ATTEMPTS, JSON.stringify(attempts));
    } catch {}
  }, [attempts]);

  const toggleSound = () => {
    setSoundEnabled((prev) => !prev);
  };

  // Generation Handlers
  const handleQuizGenerated = (newQuiz: Quiz) => {
    // Add to library
    setSavedQuizzes((prev) => [newQuiz, ...prev.filter((q) => q.id !== newQuiz.id)]);
    setActiveQuiz(newQuiz);
    setView('playing');
  };

  const handleStartQuiz = (quiz: Quiz) => {
    setActiveQuiz(quiz);
    setView('playing');
  };

  const handleStartFlashcards = (quiz: Quiz) => {
    setActiveQuiz(quiz);
    setView('flashcards');
  };

  const handleFinishQuiz = (attempt: QuizAttempt) => {
    setAttempts((prev) => [attempt, ...prev]);
    setActiveAttempt(attempt);
    setView('results');
  };

  const handleRetakeAll = () => {
    if (activeQuiz) {
      setView('playing');
    }
  };

  const handleRetakeMissed = (missedQuestions: Question[]) => {
    if (!activeQuiz) return;
    const miniQuiz: Quiz = {
      ...activeQuiz,
      id: `${activeQuiz.id}_missed_${Date.now()}`,
      title: `${activeQuiz.title} (Missed Review)`,
      questions: missedQuestions,
    };
    setActiveQuiz(miniQuiz);
    setView('playing');
  };

  const handleMasteryQuizGenerated = (newQuiz: Quiz) => {
    setSavedQuizzes((prev) => [newQuiz, ...prev]);
    setActiveQuiz(newQuiz);
    setView('playing');
  };

  const handleDeleteQuiz = (quizId: string) => {
    setSavedQuizzes((prev) => prev.filter((q) => q.id !== quizId));
    if (activeQuiz?.id === quizId) {
      setActiveQuiz(null);
      setView('main');
    }
  };

  const handleSaveEditedQuiz = (updatedQuiz: Quiz) => {
    setSavedQuizzes((prev) =>
      prev.map((q) => (q.id === updatedQuiz.id ? updatedQuiz : q))
    );
    if (activeQuiz?.id === updatedQuiz.id) {
      setActiveQuiz(updatedQuiz);
    }
  };

  const handleGenerateFromTopic = (topic: string) => {
    setPrefillTopic(topic);
    setActiveTab('generate');
    setView('main');
  };

  return (
    <div className="min-h-screen bg-slate-50/50 text-slate-900 flex flex-col font-sans selection:bg-indigo-100 selection:text-indigo-900">
      {/* Top Navigation */}
      <Header
        activeTab={activeTab}
        onTabChange={(tab) => {
          setActiveTab(tab);
          setView('main');
        }}
        savedCount={savedQuizzes.length}
        soundEnabled={soundEnabled}
        onToggleSound={toggleSound}
        onNewQuiz={() => {
          setActiveTab('generate');
          setView('main');
        }}
      />

      {/* Main Content Router */}
      <main className="flex-1 pb-16">
        {view === 'playing' && activeQuiz ? (
          <QuizPlayer
            quiz={activeQuiz}
            onFinishQuiz={handleFinishQuiz}
            onExit={() => setView('main')}
            onSwitchToFlashcards={() => setView('flashcards')}
          />
        ) : view === 'results' && activeQuiz && activeAttempt ? (
          <QuizResults
            quiz={activeQuiz}
            attempt={activeAttempt}
            onRetakeAll={handleRetakeAll}
            onRetakeMissed={handleRetakeMissed}
            onSwitchToFlashcards={() => setView('flashcards')}
            onNewQuiz={() => {
              setActiveTab('generate');
              setView('main');
            }}
            onMasteryQuizGenerated={handleMasteryQuizGenerated}
          />
        ) : view === 'flashcards' && activeQuiz ? (
          <FlashcardViewer
            quiz={activeQuiz}
            onExit={() => setView('main')}
            onStartQuiz={() => setView('playing')}
          />
        ) : (
          /* View === 'main' (Tabs) */
          <>
            {activeTab === 'generate' && (
              <QuizGenerator
                initialTopic={prefillTopic}
                onQuizGenerated={handleQuizGenerated}
              />
            )}

            {activeTab === 'explore' && (
              <ExploreGallery
                onSelectQuiz={handleStartQuiz}
                onSelectFlashcards={handleStartFlashcards}
                onGenerateTopic={handleGenerateFromTopic}
              />
            )}

            {activeTab === 'library' && (
              <SavedQuizzes
                quizzes={savedQuizzes}
                onSelectQuiz={handleStartQuiz}
                onSelectFlashcards={handleStartFlashcards}
                onDeleteQuiz={handleDeleteQuiz}
                onNewQuiz={() => {
                  setActiveTab('generate');
                  setView('main');
                }}
              />
            )}

            {activeTab === 'analytics' && (
              <AnalyticsView
                attempts={attempts}
                quizzes={savedQuizzes}
                onRetakeQuiz={(quizId) => {
                  const target = savedQuizzes.find((q) => q.id === quizId);
                  if (target) {
                    handleStartQuiz(target);
                  }
                }}
                onNewQuiz={() => {
                  setActiveTab('generate');
                  setView('main');
                }}
              />
            )}
          </>
        )}
      </main>

      {/* Quiz Editor Modal */}
      {editingQuiz && (
        <QuizEditor
          quiz={editingQuiz}
          isOpen={true}
          onClose={() => setEditingQuiz(null)}
          onSaveQuiz={handleSaveEditedQuiz}
        />
      )}

      {/* Clean, quiet footer */}
      <footer className="border-t border-slate-200/80 bg-white/70 py-6 text-xs text-slate-500">
        <div className="max-w-6xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <span className="font-semibold text-slate-700">QuizForge AI</span>
            <span>·</span>
            <span>Powered by Gemini 3.8</span>
          </div>
          <div className="flex items-center gap-4 text-slate-500">
            <span>Multiple Choice & True/False</span>
            <span>·</span>
            <span>Flashcard Engine</span>
            <span>·</span>
            <span>Instant AI Explanations</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
