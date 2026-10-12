import React from 'react';
import { QuizAttempt, Quiz } from '../types/quiz';
import { sound } from '../utils/sound';
import {
  BarChart3,
  Trophy,
  CheckCircle2,
  Clock,
  Sparkles,
  RotateCcw,
  BookOpen
} from 'lucide-react';

interface AnalyticsViewProps {
  attempts: QuizAttempt[];
  quizzes: Quiz[];
  onRetakeQuiz: (quizId: string) => void;
  onNewQuiz: () => void;
}

export const AnalyticsView: React.FC<AnalyticsViewProps> = ({
  attempts,
  quizzes,
  onRetakeQuiz,
  onNewQuiz,
}) => {
  const totalAttempts = attempts.length;
  const avgPercentage =
    totalAttempts > 0
      ? Math.round(attempts.reduce((acc, a) => acc + a.percentage, 0) / totalAttempts)
      : 0;

  const bestPercentage =
    totalAttempts > 0 ? Math.max(...attempts.map((a) => a.percentage)) : 0;

  const totalSeconds = attempts.reduce((acc, a) => acc + a.timeSpentSeconds, 0);

  const formatTotalTime = (sec: number) => {
    const mins = Math.floor(sec / 60);
    if (mins < 60) return `${mins} mins`;
    const hrs = Math.floor(mins / 60);
    const remMins = mins % 60;
    return `${hrs}h ${remMins}m`;
  };

  const formatDate = (isoStr: string) => {
    try {
      const d = new Date(isoStr);
      return d.toLocaleDateString(undefined, {
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      });
    } catch {
      return 'Recently';
    }
  };

  return (
    <div className="max-w-5xl mx-auto px-4 py-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight mb-1">
          Study Analytics & Test History
        </h1>
        <p className="text-sm text-slate-500">
          Track your progress, mastery rates, and test completion across quizzes.
        </p>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
        <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs">
          <div className="w-8 h-8 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center mb-2">
            <Trophy className="w-4 h-4" />
          </div>
          <span className="text-2xl sm:text-3xl font-black text-slate-900 block mb-0.5">
            {avgPercentage}%
          </span>
          <span className="text-xs text-slate-500 font-medium">Average Accuracy</span>
        </div>

        <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs">
          <div className="w-8 h-8 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center mb-2">
            <CheckCircle2 className="w-4 h-4" />
          </div>
          <span className="text-2xl sm:text-3xl font-black text-slate-900 block mb-0.5">
            {bestPercentage}%
          </span>
          <span className="text-xs text-slate-500 font-medium">Best Score</span>
        </div>

        <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs">
          <div className="w-8 h-8 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center mb-2">
            <BookOpen className="w-4 h-4" />
          </div>
          <span className="text-2xl sm:text-3xl font-black text-slate-900 block mb-0.5">
            {totalAttempts}
          </span>
          <span className="text-xs text-slate-500 font-medium">Tests Completed</span>
        </div>

        <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs">
          <div className="w-8 h-8 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center mb-2">
            <Clock className="w-4 h-4" />
          </div>
          <span className="text-2xl sm:text-3xl font-black text-slate-900 block mb-0.5">
            {formatTotalTime(totalSeconds)}
          </span>
          <span className="text-xs text-slate-500 font-medium">Study Time</span>
        </div>
      </div>

      {/* History Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
          <h3 className="font-bold text-slate-900 text-sm">Recent Test Attempts</h3>
          {totalAttempts > 0 && (
            <span className="text-xs text-slate-500">{totalAttempts} records</span>
          )}
        </div>

        {totalAttempts === 0 ? (
          <div className="p-10 text-center">
            <p className="text-sm text-slate-500 mb-4">You haven't completed any quizzes yet.</p>
            <button
              onClick={() => {
                sound.playClick();
                onNewQuiz();
              }}
              className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-semibold inline-flex items-center gap-1.5 transition-colors"
            >
              <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
              <span>Take Your First Quiz</span>
            </button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs sm:text-sm">
              <thead className="bg-slate-50 text-slate-500 font-semibold text-xs border-b border-slate-100 uppercase tracking-wider">
                <tr>
                  <th className="py-3 px-6">Quiz Title</th>
                  <th className="py-3 px-4">Score</th>
                  <th className="py-3 px-4">Accuracy</th>
                  <th className="py-3 px-4">Time</th>
                  <th className="py-3 px-4">Date</th>
                  <th className="py-3 px-6 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {attempts.map((attempt) => (
                  <tr key={attempt.id} className="hover:bg-slate-50/70 transition-colors">
                    <td className="py-3.5 px-6 font-semibold text-slate-900">
                      {attempt.quizTitle}
                    </td>
                    <td className="py-3.5 px-4 text-slate-700">
                      {attempt.score} / {attempt.total}
                    </td>
                    <td className="py-3.5 px-4 font-bold">
                      <span
                        className={
                          attempt.percentage >= 80
                            ? 'text-emerald-700'
                            : attempt.percentage >= 60
                            ? 'text-indigo-700'
                            : 'text-rose-700'
                        }
                      >
                        {attempt.percentage}%
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-slate-500">
                      {Math.floor(attempt.timeSpentSeconds / 60)}m {attempt.timeSpentSeconds % 60}s
                    </td>
                    <td className="py-3.5 px-4 text-slate-500">
                      {formatDate(attempt.completedAt)}
                    </td>
                    <td className="py-3.5 px-6 text-right">
                      <button
                        onClick={() => {
                          sound.playClick();
                          onRetakeQuiz(attempt.quizId);
                        }}
                        className="text-xs font-semibold text-indigo-600 hover:text-indigo-900 inline-flex items-center gap-1 transition-colors"
                      >
                        <RotateCcw className="w-3 h-3" />
                        <span>Retake</span>
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};
