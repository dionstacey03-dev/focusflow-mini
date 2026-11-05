import React from 'react';
import { Timer, CheckSquare, BarChart3, Settings as SettingsIcon } from 'lucide-react';
import { ActiveTab } from '../types';
import { playButtonTapSound } from '../utils/sound';

interface BottomNavProps {
  activeTab: ActiveTab;
  setActiveTab: (tab: ActiveTab) => void;
  activeTaskCount: number;
  soundEnabled: boolean;
  onOpenSettings: () => void;
}

export const BottomNav: React.FC<BottomNavProps> = ({
  activeTab,
  setActiveTab,
  activeTaskCount,
  soundEnabled,
  onOpenSettings,
}) => {
  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 md:hidden bg-[#0B0F19]/95 backdrop-blur-lg border-t border-slate-800/80 pb-safe">
      <div className="grid grid-cols-4 items-center h-16 max-w-md mx-auto px-2">
        {/* Tab 1: Timer */}
        <button
          onClick={() => {
            playButtonTapSound(soundEnabled);
            setActiveTab('timer');
          }}
          className={`flex flex-col items-center justify-center min-h-[48px] py-1 transition-colors ${
            activeTab === 'timer'
              ? 'text-purple-400 font-semibold'
              : 'text-slate-500 hover:text-slate-300'
          }`}
          aria-label="Timer"
        >
          <div className="relative">
            <Timer className={`w-5 h-5 transition-transform ${activeTab === 'timer' ? 'scale-110' : ''}`} />
            {activeTab === 'timer' && (
              <span className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full bg-purple-400" />
            )}
          </div>
          <span className="text-[10px] tracking-tight mt-1">Timer</span>
        </button>

        {/* Tab 2: Tasks */}
        <button
          onClick={() => {
            playButtonTapSound(soundEnabled);
            setActiveTab('tasks');
          }}
          className={`flex flex-col items-center justify-center min-h-[48px] py-1 transition-colors relative ${
            activeTab === 'tasks'
              ? 'text-purple-400 font-semibold'
              : 'text-slate-500 hover:text-slate-300'
          }`}
          aria-label="Tasks"
        >
          <div className="relative">
            <CheckSquare className={`w-5 h-5 transition-transform ${activeTab === 'tasks' ? 'scale-110' : ''}`} />
            {activeTaskCount > 0 && (
              <span className="absolute -top-1 -right-2 px-1 min-w-[14px] h-3.5 rounded-full bg-purple-600 text-[9px] font-bold text-white flex items-center justify-center tabular-nums">
                {activeTaskCount}
              </span>
            )}
            {activeTab === 'tasks' && (
              <span className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full bg-purple-400" />
            )}
          </div>
          <span className="text-[10px] tracking-tight mt-1">Tasks</span>
        </button>

        {/* Tab 3: Progress */}
        <button
          onClick={() => {
            playButtonTapSound(soundEnabled);
            setActiveTab('progress');
          }}
          className={`flex flex-col items-center justify-center min-h-[48px] py-1 transition-colors ${
            activeTab === 'progress'
              ? 'text-purple-400 font-semibold'
              : 'text-slate-500 hover:text-slate-300'
          }`}
          aria-label="Daily Progress"
        >
          <div className="relative">
            <BarChart3 className={`w-5 h-5 transition-transform ${activeTab === 'progress' ? 'scale-110' : ''}`} />
            {activeTab === 'progress' && (
              <span className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full bg-purple-400" />
            )}
          </div>
          <span className="text-[10px] tracking-tight mt-1">Progress</span>
        </button>

        {/* Tab 4: Settings */}
        <button
          onClick={() => {
            playButtonTapSound(soundEnabled);
            onOpenSettings();
          }}
          className="flex flex-col items-center justify-center min-h-[48px] py-1 text-slate-500 hover:text-slate-300 transition-colors"
          aria-label="Settings"
        >
          <SettingsIcon className="w-5 h-5" />
          <span className="text-[10px] tracking-tight mt-1">Settings</span>
        </button>
      </div>
    </nav>
  );
};
