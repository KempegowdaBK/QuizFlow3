import React, { useState } from 'react';
import { Quiz, Question } from '../types/quiz';
import { sound } from '../utils/sound';
import {
  X,
  Plus,
  Trash2,
  Save,
  CheckCircle2,
  AlertCircle,
  HelpCircle
} from 'lucide-react';

interface QuizEditorProps {
  quiz: Quiz;
  isOpen: boolean;
  onClose: () => void;
  onSaveQuiz: (updatedQuiz: Quiz) => void;
}

export const QuizEditor: React.FC<QuizEditorProps> = ({
  quiz,
  isOpen,
  onClose,
  onSaveQuiz,
}) => {
  const [title, setTitle] = useState(quiz.title);
  const [description, setDescription] = useState(quiz.description);
  const [topic, setTopic] = useState(quiz.topic);
  const [questions, setQuestions] = useState<Question[]>(quiz.questions);
  const [activeIdx, setActiveIdx] = useState(0);

  if (!isOpen) return null;

  const currentQ = questions[activeIdx];

  const handleUpdateQuestion = (updated: Partial<Question>) => {
    setQuestions((prev) =>
      prev.map((q, idx) => (idx === activeIdx ? { ...q, ...updated } : q))
    );
  };

  const handleAddQuestion = () => {
    sound.playClick();
    const newQ: Question = {
      id: `custom_q_${Date.now()}`,
      question: 'New Question Stem',
      type: 'multiple-choice',
      options: ['Option A', 'Option B', 'Option C', 'Option D'],
      correctAnswer: 'Option A',
      explanation: 'Explanation of why Option A is correct.',
      hint: '',
      difficulty: 'medium',
      keyConcept: 'General Concept',
    };
    setQuestions([...questions, newQ]);
    setActiveIdx(questions.length);
  };

  const handleDeleteQuestion = (delIdx: number) => {
    if (questions.length <= 1) {
      alert('A quiz must have at least one question.');
      return;
    }
    sound.playClick();
    const next = questions.filter((_, idx) => idx !== delIdx);
    setQuestions(next);
    setActiveIdx(Math.max(0, delIdx - 1));
  };

  const handleSave = () => {
    sound.playCorrect();
    onSaveQuiz({
      ...quiz,
      title,
      description,
      topic,
      questions,
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
      <div className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full border border-slate-200 overflow-hidden flex flex-col max-h-[92vh]">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between bg-slate-50">
          <div>
            <h2 className="font-bold text-slate-900 text-base">Edit Quiz & Questions</h2>
            <p className="text-xs text-slate-500">Fine-tune wording, answer choices, and explanations</p>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handleSave}
              className="px-3.5 py-1.5 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-colors shadow-xs"
            >
              <Save className="w-3.5 h-3.5" />
              <span>Save Changes</span>
            </button>
            <button
              onClick={onClose}
              className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-200/60 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Editor Body */}
        <div className="flex-1 overflow-hidden flex flex-col sm:flex-row">
          {/* Question List Sidebar */}
          <div className="w-full sm:w-64 border-r border-slate-200 bg-slate-50/60 p-3 overflow-y-auto space-y-1.5 shrink-0 max-h-48 sm:max-h-none">
            <div className="flex items-center justify-between px-2 py-1 mb-1">
              <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
                Questions ({questions.length})
              </span>
              <button
                onClick={handleAddQuestion}
                className="text-xs font-semibold text-indigo-600 hover:text-indigo-800 flex items-center gap-0.5"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add</span>
              </button>
            </div>

            {questions.map((q, idx) => (
              <div
                key={q.id || idx}
                onClick={() => setActiveIdx(idx)}
                className={`p-2.5 rounded-xl text-xs cursor-pointer flex items-center justify-between gap-2 transition-all ${
                  activeIdx === idx
                    ? 'bg-white border border-slate-300 text-slate-900 shadow-xs font-semibold'
                    : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                }`}
              >
                <span className="truncate">
                  {idx + 1}. {q.question || 'Untitled question'}
                </span>
                {questions.length > 1 && (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDeleteQuestion(idx);
                    }}
                    className="text-slate-400 hover:text-rose-600 p-1 rounded-md"
                    title="Delete question"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
            ))}
          </div>

          {/* Question Form Editor */}
          {currentQ && (
            <div className="flex-1 p-6 overflow-y-auto space-y-4 text-xs sm:text-sm">
              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                  Question Stem
                </label>
                <textarea
                  value={currentQ.question}
                  onChange={(e) => handleUpdateQuestion({ question: e.target.value })}
                  rows={2}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 focus:outline-none focus:border-indigo-600 font-medium leading-relaxed"
                />
              </div>

              {/* Options & Correct Answer Radio */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-2">
                  Answer Options (Select which one is the correct answer)
                </label>
                <div className="space-y-2.5">
                  {currentQ.options?.map((opt, oIdx) => {
                    const isCorrect = opt === currentQ.correctAnswer;
                    return (
                      <div key={oIdx} className="flex items-center gap-2">
                        <input
                          type="radio"
                          name={`correct_${currentQ.id}`}
                          checked={isCorrect}
                          onChange={() => handleUpdateQuestion({ correctAnswer: opt })}
                          className="text-indigo-600 focus:ring-indigo-500 cursor-pointer"
                          title="Set as correct answer"
                        />
                        <span className="w-5 text-slate-400 font-bold text-xs">
                          {String.fromCharCode(65 + oIdx)}.
                        </span>
                        <input
                          type="text"
                          value={opt}
                          onChange={(e) => {
                            const newOptions = [...currentQ.options];
                            const oldVal = newOptions[oIdx];
                            newOptions[oIdx] = e.target.value;
                            const update: Partial<Question> = { options: newOptions };
                            if (currentQ.correctAnswer === oldVal) {
                              update.correctAnswer = e.target.value;
                            }
                            handleUpdateQuestion(update);
                          }}
                          className={`flex-1 px-3 py-2 border rounded-xl text-xs sm:text-sm ${
                            isCorrect
                              ? 'bg-emerald-50/60 border-emerald-300 font-medium text-emerald-950'
                              : 'bg-slate-50 border-slate-200 text-slate-800'
                          } focus:outline-none focus:border-indigo-600`}
                        />
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Explanation */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                  Educational Explanation
                </label>
                <textarea
                  value={currentQ.explanation}
                  onChange={(e) => handleUpdateQuestion({ explanation: e.target.value })}
                  rows={3}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 focus:outline-none focus:border-indigo-600 leading-relaxed text-xs sm:text-sm"
                />
              </div>

              {/* Hint & Key Concept */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                    Hint (Optional)
                  </label>
                  <input
                    type="text"
                    value={currentQ.hint || ''}
                    onChange={(e) => handleUpdateQuestion({ hint: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 focus:outline-none focus:border-indigo-600 text-xs sm:text-sm"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                    Key Concept
                  </label>
                  <input
                    type="text"
                    value={currentQ.keyConcept || ''}
                    onChange={(e) => handleUpdateQuestion({ keyConcept: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 focus:outline-none focus:border-indigo-600 text-xs sm:text-sm"
                  />
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
