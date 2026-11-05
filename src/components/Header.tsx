import React from 'react';
import { Volume2, VolumeX, Sparkles, Settings as SettingsIcon } from 'lucide-react';
import { ActiveTab, UserSettings } from '../types';

interface HeaderProps {
  activeTab: ActiveTab;
  setActiveTab: (tab: ActiveTab) => void;
  settings: UserSettings;
  onToggleSound: () => void;
  onOpenSettings: () => void;
  todayPomodoros: number;
}

export const Header: React.FC<HeaderProps> = ({
  activeTab,
  setActiveTab,
  settings,
  onToggleSound,
  onOpenSettings,
  todayPomodoros,
}) => {
  return (
    <header className="sticky top-0 z-30 w-full border-b border-slate-800/80 bg-[#0B0F19]/80 backdrop-blur-md pt-safe">
      <div className="mx-auto flex h-14 max-w-5xl items-center justify-between px-4 sm:px-6">
        {/* Zone 1: Brand Wordmark */}
        <div className="flex items-center gap-2.5 shrink-0">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-tr from-purple-600 via-indigo-600 to-blue-500 shadow-md shadow-indigo-500/20">
            <Sparkles className="h-4 w-4 text-white" />
          </div>
          <span className="text-base font-bold tracking-tight text-white whitespace-nowrap">
            FocusFlow <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-blue-400">Mini</span>
          </span>
        </div>

        {/* Zone 2: Desktop Navigation Links */}
        <nav className="hidden md:flex items-center gap-1 bg-slate-900/60 p-1 rounded-xl border border-slate-800">
          <button
            onClick={() => setActiveTab('timer')}
            className={`px-3.5 py-1.5 text-xs font-semibold rounded-lg transition-all whitespace-nowrap min-h-[36px] ${
              activeTab === 'timer'
                ? 'bg-gradient-to-r from-purple-600 to-indigo-600 text-white shadow-sm'
                : 'text-slate-400 hover:text-white hover:bg-slate-800/50'
            }`}
          >
            Timer
          </button>
          <button
            onClick={() => setActiveTab('tasks')}
            className={`px-3.5 py-1.5 text-xs font-semibold rounded-lg transition-all whitespace-nowrap min-h-[36px] ${
              activeTab === 'tasks'
                ? 'bg-gradient-to-r from-purple-600 to-indigo-600 text-white shadow-sm'
                : 'text-slate-400 hover:text-white hover:bg-slate-800/50'
            }`}
          >
            Tasks
          </button>
          <button
            onClick={() => setActiveTab('progress')}
            className={`px-3.5 py-1.5 text-xs font-semibold rounded-lg transition-all whitespace-nowrap min-h-[36px] ${
              activeTab === 'progress'
                ? 'bg-gradient-to-r from-purple-600 to-indigo-600 text-white shadow-sm'
                : 'text-slate-400 hover:text-white hover:bg-slate-800/50'
            }`}
          >
            Daily Progress
          </button>
        </nav>

        {/* Zone 3: Quick Controls */}
        <div className="flex items-center gap-1.5 shrink-0">
          {/* Quick daily mini counter */}
          <div className="hidden sm:flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-slate-900/80 border border-slate-800 text-xs text-slate-300">
            <span className="text-purple-400 font-bold tabular-nums">{todayPomodoros}</span>
            <span className="text-slate-500">/</span>
            <span className="text-slate-400 tabular-nums">{settings.dailyGoalPomodoros}</span>
            <span className="text-[11px] text-slate-500 font-normal">done today</span>
          </div>

          <button
            onClick={onToggleSound}
            aria-label={settings.soundEnabled ? 'Mute sound effects' : 'Enable sound effects'}
            className="flex h-10 w-10 items-center justify-center rounded-lg text-slate-400 hover:text-white hover:bg-slate-800/70 transition-colors"
            title={settings.soundEnabled ? 'Sound Enabled' : 'Sound Muted'}
          >
            {settings.soundEnabled ? (
              <Volume2 className="h-4 w-4 text-purple-400" />
            ) : (
              <VolumeX className="h-4 w-4 text-slate-500" />
            )}
          </button>

          <button
            onClick={onOpenSettings}
            aria-label="Open settings"
            className="flex h-10 w-10 items-center justify-center rounded-lg text-slate-400 hover:text-white hover:bg-slate-800/70 transition-colors"
            title="Settings"
          >
            <SettingsIcon className="h-4 w-4" />
          </button>
        </div>
      </div>
    </header>
  );
};
