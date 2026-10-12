import React from 'react';
import { Quiz } from '../types/quiz';
import { SAMPLE_QUIZZES } from '../data/sampleQuizzes';
import { sound } from '../utils/sound';
import { Sparkles, Layers, BookOpen, Clock, Tag, Play } from 'lucide-react';

interface ExploreGalleryProps {
  onSelectQuiz: (quiz: Quiz) => void;
  onSelectFlashcards: (quiz: Quiz) => void;
  onGenerateTopic: (topic: string) => void;
}

const TRENDING_TOPICS = [
  { topic: 'Neuroscience & Human Cognition', category: 'Science', qCount: 10 },
  { topic: 'Cybersecurity Threat Modeling', category: 'Tech', qCount: 10 },
  { topic: 'Renaissance Art & Masters', category: 'History', qCount: 8 },
  { topic: 'Environmental Science & Climate Systems', category: 'Nature', qCount: 10 },
  { topic: 'Macroeconomics & Global Trade', category: 'Economics', qCount: 8 },
  { topic: 'Ancient Rome: Republic to Empire', category: 'History', qCount: 10 },
];

export const ExploreGallery: React.FC<ExploreGalleryProps> = ({
  onSelectQuiz,
  onSelectFlashcards,
  onGenerateTopic,
}) => {
  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight mb-2">
          Curated Quiz Showcase & Inspiration
        </h1>
        <p className="text-sm text-slate-600">
          Try these pre-built, verified educational quizzes or launch 1-click generation from trending topics.
        </p>
      </div>

      {/* Featured Curated Quizzes */}
      <div className="mb-12">
        <h2 className="text-base font-bold text-slate-900 mb-4 flex items-center gap-2">
          <BookOpen className="w-4 h-4 text-indigo-600" />
          <span>Curated Sample Quizzes</span>
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {SAMPLE_QUIZZES.map((quiz) => (
            <div
              key={quiz.id}
              className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs hover:shadow-md transition-all flex flex-col justify-between group"
            >
              <div>
                <div className="flex items-center justify-between text-xs text-slate-500 mb-3">
                  <span className="font-semibold text-indigo-700">{quiz.topic}</span>
                  <span className="capitalize">{quiz.difficulty}</span>
                </div>

                <h3 className="text-base font-bold text-slate-900 mb-2 leading-snug group-hover:text-indigo-600 transition-colors">
                  {quiz.title}
                </h3>

                <p className="text-xs text-slate-600 leading-relaxed mb-4 line-clamp-3">
                  {quiz.description}
                </p>

                <div className="flex items-center gap-3 text-xs text-slate-500 mb-6">
                  <span>{quiz.questions.length} Questions</span>
                  <span>·</span>
                  <span>~{quiz.estimatedMinutes} mins</span>
                </div>
              </div>

              <div className="flex items-center gap-2 pt-4 border-t border-slate-100">
                <button
                  onClick={() => {
                    sound.playClick();
                    onSelectQuiz(quiz);
                  }}
                  className="flex-1 py-2.5 px-3 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors shadow-xs"
                >
                  <Play className="w-3.5 h-3.5 fill-current" />
                  <span>Take Quiz</span>
                </button>

                <button
                  onClick={() => {
                    sound.playClick();
                    onSelectFlashcards(quiz);
                  }}
                  className="py-2.5 px-3 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-medium flex items-center justify-center gap-1 transition-colors"
                  title="Study as flashcards"
                >
                  <Layers className="w-3.5 h-3.5" />
                  <span>Cards</span>
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 1-Click Trending Topics Generator */}
      <div>
        <h2 className="text-base font-bold text-slate-900 mb-4 flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-indigo-600" />
          <span>Generate from Trending Curriculums</span>
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {TRENDING_TOPICS.map((item, idx) => (
            <div
              key={idx}
              className="p-4 rounded-xl bg-white border border-slate-200/80 hover:border-indigo-300 transition-all flex items-center justify-between gap-3 group cursor-pointer"
              onClick={() => {
                sound.playClick();
                onGenerateTopic(item.topic);
              }}
            >
              <div>
                <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider block mb-1">
                  {item.category}
                </span>
                <h4 className="text-sm font-semibold text-slate-900 group-hover:text-indigo-600 transition-colors">
                  {item.topic}
                </h4>
              </div>

              <button
                type="button"
                className="px-2.5 py-1.5 bg-indigo-50 group-hover:bg-indigo-600 text-indigo-700 group-hover:text-white rounded-lg text-xs font-medium transition-colors shrink-0"
              >
                Create
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
