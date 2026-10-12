import React, { useState } from 'react';
import { Quiz } from '../types/quiz';
import { sound } from '../utils/sound';
import { downloadQuizJSON, downloadQuizMarkdown, downloadQuizCSV } from '../utils/export';
import {
  Search,
  Play,
  Layers,
  Trash2,
  Download,
  FileText,
  Calendar,
  Sparkles,
  BookOpen
} from 'lucide-react';

interface SavedQuizzesProps {
  quizzes: Quiz[];
  onSelectQuiz: (quiz: Quiz) => void;
  onSelectFlashcards: (quiz: Quiz) => void;
  onDeleteQuiz: (quizId: string) => void;
  onNewQuiz: () => void;
}

export const SavedQuizzes: React.FC<SavedQuizzesProps> = ({
  quizzes,
  onSelectQuiz,
  onSelectFlashcards,
  onDeleteQuiz,
  onNewQuiz,
}) => {
  const [search, setSearch] = useState('');
  const [activeExportMenu, setActiveExportMenu] = useState<string | null>(null);

  const filteredQuizzes = quizzes.filter((q) => {
    const s = search.toLowerCase();
    return (
      q.title.toLowerCase().includes(s) ||
      q.topic.toLowerCase().includes(s) ||
      (q.tags && q.tags.some((t) => t.toLowerCase().includes(s)))
    );
  });

  const formatDate = (isoStr: string) => {
    try {
      return new Date(isoStr).toLocaleDateString(undefined, {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
      });
    } catch {
      return 'Recently';
    }
  };

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      {/* Header & Search */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight mb-1">
            My Quiz Library
          </h1>
          <p className="text-sm text-slate-500">
            {quizzes.length} saved {quizzes.length === 1 ? 'quiz' : 'quizzes'} available for practice and revision
          </p>
        </div>

        <div className="flex items-center gap-2">
          {/* Search Bar */}
          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search your library..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9 pr-4 py-2 bg-white border border-slate-200 rounded-xl text-xs sm:text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:border-indigo-600 w-52 sm:w-64"
            />
          </div>

          <button
            onClick={() => {
              sound.playClick();
              onNewQuiz();
            }}
            className="px-3.5 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs sm:text-sm font-semibold flex items-center gap-1.5 transition-colors shadow-xs shrink-0"
          >
            <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
            <span>New Quiz</span>
          </button>
        </div>
      </div>

      {/* Quizzes List */}
      {filteredQuizzes.length === 0 ? (
        <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center max-w-lg mx-auto">
          <div className="w-12 h-12 rounded-2xl bg-slate-100 text-slate-500 flex items-center justify-center mx-auto mb-4">
            <BookOpen className="w-6 h-6" />
          </div>
          <h3 className="text-base font-bold text-slate-900 mb-1">
            {quizzes.length === 0 ? 'Your library is empty' : 'No matching quizzes found'}
          </h3>
          <p className="text-xs text-slate-500 mb-6 leading-relaxed">
            {quizzes.length === 0
              ? 'Generate a custom quiz using AI from any subject or notes, or save samples from the explore tab.'
              : 'Try clearing your search query to see all quizzes.'}
          </p>
          <button
            onClick={() => {
              sound.playClick();
              onNewQuiz();
            }}
            className="px-4 py-2.5 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-semibold inline-flex items-center gap-2 shadow-xs transition-colors"
          >
            <Sparkles className="w-4 h-4 text-indigo-400" />
            <span>Generate New Quiz</span>
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredQuizzes.map((quiz) => (
            <div
              key={quiz.id}
              className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs hover:shadow-md transition-all flex flex-col justify-between group"
            >
              <div>
                <div className="flex items-center justify-between text-xs text-slate-500 mb-2.5">
                  <span className="font-semibold text-indigo-700 truncate max-w-[150px]">
                    {quiz.topic}
                  </span>
                  <span className="capitalize">{quiz.difficulty}</span>
                </div>

                <h3 className="text-base font-bold text-slate-900 mb-2 leading-snug group-hover:text-indigo-600 transition-colors">
                  {quiz.title}
                </h3>

                {quiz.description && (
                  <p className="text-xs text-slate-600 leading-relaxed mb-4 line-clamp-2">
                    {quiz.description}
                  </p>
                )}

                <div className="flex items-center gap-3 text-xs text-slate-500 mb-5">
                  <span>{quiz.questions.length} Questions</span>
                  <span>·</span>
                  <span className="flex items-center gap-1">
                    <Calendar className="w-3 h-3 text-slate-400" />
                    {formatDate(quiz.createdAt)}
                  </span>
                </div>
              </div>

              {/* Action Toolbar */}
              <div className="flex items-center gap-2 pt-3 border-t border-slate-100">
                <button
                  onClick={() => {
                    sound.playClick();
                    onSelectQuiz(quiz);
                  }}
                  className="flex-1 py-2 px-3 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors shadow-xs"
                >
                  <Play className="w-3 h-3 fill-current" />
                  <span>Play</span>
                </button>

                <button
                  onClick={() => {
                    sound.playClick();
                    onSelectFlashcards(quiz);
                  }}
                  className="py-2 px-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-medium flex items-center justify-center gap-1 transition-colors"
                  title="Study Flashcards"
                >
                  <Layers className="w-3.5 h-3.5" />
                  <span>Cards</span>
                </button>

                {/* Export Dropdown */}
                <div className="relative">
                  <button
                    onClick={() =>
                      setActiveExportMenu(activeExportMenu === quiz.id ? null : quiz.id)
                    }
                    className="p-2 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-xl text-xs transition-colors"
                    title="Export Quiz"
                  >
                    <Download className="w-3.5 h-3.5" />
                  </button>

                  {activeExportMenu === quiz.id && (
                    <div className="absolute right-0 bottom-full mb-1 w-44 bg-white rounded-xl shadow-lg border border-slate-200 py-1 z-30 text-left text-xs">
                      <button
                        onClick={() => {
                          downloadQuizMarkdown(quiz);
                          setActiveExportMenu(null);
                        }}
                        className="w-full px-3 py-1.5 hover:bg-slate-50 text-slate-700 flex items-center gap-2"
                      >
                        <FileText className="w-3 h-3 text-slate-400" />
                        <span>Markdown</span>
                      </button>
                      <button
                        onClick={() => {
                          downloadQuizCSV(quiz);
                          setActiveExportMenu(null);
                        }}
                        className="w-full px-3 py-1.5 hover:bg-slate-50 text-slate-700 flex items-center gap-2"
                      >
                        <FileText className="w-3 h-3 text-slate-400" />
                        <span>CSV (Anki)</span>
                      </button>
                      <button
                        onClick={() => {
                          downloadQuizJSON(quiz);
                          setActiveExportMenu(null);
                        }}
                        className="w-full px-3 py-1.5 hover:bg-slate-50 text-slate-700 flex items-center gap-2"
                      >
                        <Download className="w-3 h-3 text-slate-400" />
                        <span>JSON</span>
                      </button>
                    </div>
                  )}
                </div>

                <button
                  onClick={() => {
                    sound.playClick();
                    if (confirm(`Delete "${quiz.title}" from your library?`)) {
                      onDeleteQuiz(quiz.id);
                    }
                  }}
                  className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition-colors"
                  title="Delete quiz"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
