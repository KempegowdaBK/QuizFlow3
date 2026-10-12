import React from 'react';
import { Sparkles, Compass, BookOpen, BarChart3, Volume2, VolumeX, Plus } from 'lucide-react';
import { sound } from '../utils/sound';

export type ActiveTab = 'generate' | 'explore' | 'library' | 'analytics';

interface HeaderProps {
  activeTab: ActiveTab;
  onTabChange: (tab: ActiveTab) => void;
  savedCount: number;
  soundEnabled: boolean;
  onToggleSound: () => void;
  onNewQuiz: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  activeTab,
  onTabChange,
  savedCount,
  soundEnabled,
  onToggleSound,
  onNewQuiz,
}) => {
  return (
    <header className="sticky top-0 z-40 bg-white/90 backdrop-blur-md border-b border-slate-200">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between gap-4">
        {/* Brand */}
        <div 
          onClick={() => onTabChange('generate')} 
          className="flex items-center gap-2.5 cursor-pointer group select-none shrink-0"
        >
          <div className="w-9 h-9 rounded-xl bg-slate-900 text-white flex items-center justify-center shadow-xs group-hover:scale-105 transition-transform">
            <Sparkles className="w-5 h-5 text-indigo-400" />
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="font-bold text-slate-900 tracking-tight text-lg">QuizForge</span>
              <span className="text-[10px] uppercase font-bold tracking-wider px-1.5 py-0.5 rounded-sm bg-indigo-50 text-indigo-700 border border-indigo-200/60">
                AI
              </span>
            </div>
            <p className="text-[11px] text-slate-500 leading-none hidden sm:block">Smart Quiz Generator & Studio</p>
          </div>
        </div>

        {/* Navigation Tabs */}
        <nav className="flex items-center gap-1 p-1 bg-slate-100/90 rounded-xl border border-slate-200/80 text-xs sm:text-sm">
          <button
            onClick={() => {
              sound.playClick();
              onTabChange('generate');
            }}
            className={`px-3 py-1.5 font-medium rounded-lg transition-all flex items-center gap-1.5 ${
              activeTab === 'generate'
                ? 'bg-white text-slate-900 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5 text-indigo-600" />
            <span>Generate</span>
          </button>

          <button
            onClick={() => {
              sound.playClick();
              onTabChange('explore');
            }}
            className={`px-3 py-1.5 font-medium rounded-lg transition-all flex items-center gap-1.5 ${
              activeTab === 'explore'
                ? 'bg-white text-slate-900 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Compass className="w-3.5 h-3.5 text-slate-600" />
            <span>Explore</span>
          </button>

          <button
            onClick={() => {
              sound.playClick();
              onTabChange('library');
            }}
            className={`px-3 py-1.5 font-medium rounded-lg transition-all flex items-center gap-1.5 ${
              activeTab === 'library'
                ? 'bg-white text-slate-900 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <BookOpen className="w-3.5 h-3.5 text-slate-600" />
            <span>Library</span>
            {savedCount > 0 && (
              <span className="text-[10px] font-semibold text-slate-600 ml-0.5">
                ({savedCount})
              </span>
            )}
          </button>

          <button
            onClick={() => {
              sound.playClick();
              onTabChange('analytics');
            }}
            className={`px-3 py-1.5 font-medium rounded-lg transition-all flex items-center gap-1.5 ${
              activeTab === 'analytics'
                ? 'bg-white text-slate-900 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <BarChart3 className="w-3.5 h-3.5 text-slate-600" />
            <span className="hidden sm:inline">Stats</span>
          </button>
        </nav>

        {/* Right Action Tools */}
        <div className="flex items-center gap-2">
          {/* Sound Mute Toggle */}
          <button
            onClick={onToggleSound}
            title={soundEnabled ? 'Sound FX On (click to mute)' : 'Sound FX Muted'}
            className="p-2 rounded-xl text-slate-500 hover:text-slate-800 hover:bg-slate-100 border border-slate-200/60 transition-colors"
            aria-label="Toggle Sound Effects"
          >
            {soundEnabled ? (
              <Volume2 className="w-4 h-4 text-indigo-600" />
            ) : (
              <VolumeX className="w-4 h-4 text-slate-400" />
            )}
          </button>

          {/* Quick Create Button */}
          {activeTab !== 'generate' && (
            <button
              onClick={() => {
                sound.playClick();
                onNewQuiz();
              }}
              className="px-3 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-medium flex items-center gap-1.5 transition-colors shadow-xs"
            >
              <Plus className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Create Quiz</span>
            </button>
          )}
        </div>
      </div>
    </header>
  );
};
