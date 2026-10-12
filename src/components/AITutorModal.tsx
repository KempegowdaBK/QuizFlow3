import React, { useState } from 'react';
import { Question } from '../types/quiz';
import { X, Sparkles, Send, Loader2, Lightbulb, AlertCircle } from 'lucide-react';

interface AITutorModalProps {
  question: Question;
  userAnswer?: string;
  isOpen: boolean;
  onClose: () => void;
}

export const AITutorModal: React.FC<AITutorModalProps> = ({
  question,
  userAnswer,
  isOpen,
  onClose,
}) => {
  const [query, setQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const [response, setResponse] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleAskTutor = async (customQuery?: string) => {
    const promptToSend = customQuery || query;
    setLoading(true);
    setError(null);
    try {
      const res = await fetch('/api/explain-question', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          question: question.question,
          options: question.options,
          selectedAnswer: userAnswer || 'Not answered yet',
          correctAnswer: question.correctAnswer,
          explanation: question.explanation,
          userQuery: promptToSend,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Failed to get tutor answer');
      }
      setResponse(data.explanation);
    } catch (err: any) {
      setError(err.message || 'Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const samplePrompts = [
    'Why is the correct answer right?',
    userAnswer && userAnswer !== question.correctAnswer
      ? `Why is "${userAnswer}" wrong?`
      : 'Give me a real-world analogy',
    'How can I easily remember this for tests?',
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
      <div className="bg-white rounded-2xl shadow-2xl max-w-xl w-full border border-slate-200 overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-indigo-100 text-indigo-700 flex items-center justify-center">
              <Sparkles className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-semibold text-slate-900 text-sm">AI Study Tutor</h3>
              <p className="text-xs text-slate-500">Ask questions and get instant conceptual breakdowns</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 p-1.5 rounded-lg hover:bg-slate-200/60 transition-colors"
            aria-label="Close"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-6 overflow-y-auto space-y-4 text-sm flex-1">
          {/* Question context card */}
          <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200/80">
            <p className="text-xs font-medium text-slate-500 uppercase tracking-wider mb-1">Target Question</p>
            <p className="text-slate-800 font-medium">{question.question}</p>
            <div className="mt-2.5 pt-2.5 border-t border-slate-200/60 text-xs flex flex-wrap gap-x-4 gap-y-1 text-slate-600">
              <span>Correct: <strong className="text-emerald-700">{question.correctAnswer}</strong></span>
              {userAnswer && (
                <span>Your Pick: <strong className={userAnswer === question.correctAnswer ? 'text-emerald-700' : 'text-rose-700'}>{userAnswer}</strong></span>
              )}
            </div>
          </div>

          {/* Quick preset questions */}
          <div>
            <p className="text-xs text-slate-500 mb-2 font-medium">Quick Questions</p>
            <div className="flex flex-wrap gap-2">
              {samplePrompts.map((p, idx) => (
                <button
                  key={idx}
                  onClick={() => {
                    setQuery(p);
                    handleAskTutor(p);
                  }}
                  disabled={loading}
                  className="px-3 py-1.5 text-xs text-slate-700 bg-slate-100 hover:bg-indigo-50 hover:text-indigo-700 hover:border-indigo-200 border border-slate-200 rounded-lg transition-colors text-left"
                >
                  {p}
                </button>
              ))}
            </div>
          </div>

          {/* Tutor Response Box */}
          {loading && (
            <div className="p-6 rounded-xl bg-indigo-50/50 border border-indigo-100 flex flex-col items-center justify-center text-center">
              <Loader2 className="w-6 h-6 animate-spin text-indigo-600 mb-2" />
              <p className="text-xs font-medium text-indigo-900">Consulting AI Tutor...</p>
              <p className="text-xs text-indigo-700/70">Crafting a clear pedagogical explanation</p>
            </div>
          )}

          {error && (
            <div className="p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 flex items-start gap-2.5">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-rose-600" />
              <p className="text-xs leading-relaxed">{error}</p>
            </div>
          )}

          {response && !loading && (
            <div className="p-4 rounded-xl bg-emerald-50/60 border border-emerald-200/80 text-slate-800">
              <div className="flex items-center gap-1.5 text-xs font-semibold text-emerald-800 mb-2">
                <Lightbulb className="w-4 h-4 text-emerald-600" />
                Tutor Explanation
              </div>
              <p className="whitespace-pre-line text-sm leading-relaxed text-slate-800">
                {response}
              </p>
            </div>
          )}
        </div>

        {/* Input Bar */}
        <div className="p-4 border-t border-slate-100 bg-white">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              if (query.trim()) handleAskTutor();
            }}
            className="flex items-center gap-2"
          >
            <input
              type="text"
              placeholder="Ask anything about this question..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              disabled={loading}
              className="flex-1 px-3.5 py-2.5 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 transition-all text-slate-900"
            />
            <button
              type="submit"
              disabled={loading || !query.trim()}
              className="px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white rounded-xl text-sm font-medium flex items-center gap-1.5 transition-colors shadow-xs shrink-0"
            >
              <Send className="w-3.5 h-3.5" />
              <span>Ask</span>
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};
