import React, { useState } from 'react';
import { X, Sliders, Volume2, Bell, AlertTriangle } from 'lucide-react';
import { UserSettings } from '../types';
import { DEFAULT_SETTINGS } from '../utils/storage';
import { playButtonTapSound } from '../utils/sound';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  settings: UserSettings;
  onSaveSettings: (settings: UserSettings) => void;
  onClearAllData: () => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({
  isOpen,
  onClose,
  settings,
  onSaveSettings,
  onClearAllData,
}) => {
  const [form, setForm] = useState<UserSettings>(settings);

  if (!isOpen) return null;

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    playButtonTapSound(form.soundEnabled);
    onSaveSettings(form);
    onClose();
  };

  const handleResetDefaults = () => {
    playButtonTapSound(form.soundEnabled);
    setForm(DEFAULT_SETTINGS);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/70 backdrop-blur-sm animate-in fade-in duration-200">
      <div
        className="w-full max-w-md bg-slate-900 border border-slate-800 rounded-t-3xl sm:rounded-3xl p-5 sm:p-6 shadow-2xl max-h-[90vh] overflow-y-auto"
        role="dialog"
        aria-modal="true"
        aria-labelledby="settings-title"
      >
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-800 mb-5">
          <div className="flex items-center gap-2">
            <Sliders className="w-5 h-5 text-purple-400" />
            <h2 id="settings-title" className="text-lg font-bold text-white tracking-tight">
              Timer Preferences
            </h2>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full flex items-center justify-center text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
            aria-label="Close settings"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSave} className="space-y-5">
          {/* Durations */}
          <div>
            <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-400 mb-3">
              Session Durations (Minutes)
            </h3>
            <div className="grid grid-cols-3 gap-3">
              {/* Focus */}
              <div className="p-3 rounded-xl bg-slate-950/70 border border-slate-800">
                <label className="text-[11px] text-slate-400 block mb-1">Focus</label>
                <input
                  type="number"
                  min="1"
                  max="90"
                  value={form.focusDuration}
                  onChange={(e) =>
                    setForm({ ...form, focusDuration: Math.max(1, parseInt(e.target.value) || 1) })
                  }
                  className="w-full bg-slate-900 border border-slate-700/80 rounded-lg px-2 py-1.5 font-mono text-base font-bold text-white focus:outline-none focus:border-purple-500"
                />
              </div>

              {/* Short Break */}
              <div className="p-3 rounded-xl bg-slate-950/70 border border-slate-800">
                <label className="text-[11px] text-slate-400 block mb-1">Short Break</label>
                <input
                  type="number"
                  min="1"
                  max="30"
                  value={form.shortBreakDuration}
                  onChange={(e) =>
                    setForm({ ...form, shortBreakDuration: Math.max(1, parseInt(e.target.value) || 1) })
                  }
                  className="w-full bg-slate-900 border border-slate-700/80 rounded-lg px-2 py-1.5 font-mono text-base font-bold text-white focus:outline-none focus:border-purple-500"
                />
              </div>

              {/* Long Break */}
              <div className="p-3 rounded-xl bg-slate-950/70 border border-slate-800">
                <label className="text-[11px] text-slate-400 block mb-1">Long Break</label>
                <input
                  type="number"
                  min="1"
                  max="60"
                  value={form.longBreakDuration}
                  onChange={(e) =>
                    setForm({ ...form, longBreakDuration: Math.max(1, parseInt(e.target.value) || 1) })
                  }
                  className="w-full bg-slate-900 border border-slate-700/80 rounded-lg px-2 py-1.5 font-mono text-base font-bold text-white focus:outline-none focus:border-purple-500"
                />
              </div>
            </div>
          </div>

          {/* Daily Target Goal */}
          <div className="p-3.5 rounded-xl bg-slate-950/70 border border-slate-800 flex items-center justify-between">
            <div>
              <span className="text-sm font-medium text-slate-200 block">Daily Pomodoro Goal</span>
              <span className="text-xs text-slate-400">Target sessions per day</span>
            </div>
            <div className="flex items-center gap-2">
              <input
                type="number"
                min="1"
                max="24"
                value={form.dailyGoalPomodoros}
                onChange={(e) =>
                  setForm({ ...form, dailyGoalPomodoros: Math.max(1, parseInt(e.target.value) || 1) })
                }
                className="w-16 bg-slate-900 border border-slate-700/80 rounded-lg px-2.5 py-1.5 font-mono text-center text-sm font-bold text-white focus:outline-none focus:border-purple-500"
              />
            </div>
          </div>

          {/* Preferences Toggles */}
          <div className="space-y-3">
            <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-400">
              Audio & Automation
            </h3>

            {/* Sound toggle */}
            <div className="p-3 rounded-xl bg-slate-950/70 border border-slate-800 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <Volume2 className="w-4 h-4 text-purple-400" />
                <div>
                  <span className="text-sm font-medium text-slate-200 block">Sound Chimes</span>
                  <span className="text-xs text-slate-400">Play pleasant alert on session end</span>
                </div>
              </div>
              <input
                type="checkbox"
                checked={form.soundEnabled}
                onChange={(e) => setForm({ ...form, soundEnabled: e.target.checked })}
                className="w-5 h-5 accent-purple-600 rounded cursor-pointer"
              />
            </div>

            {/* Auto-start breaks */}
            <div className="p-3 rounded-xl bg-slate-950/70 border border-slate-800 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <Bell className="w-4 h-4 text-indigo-400" />
                <div>
                  <span className="text-sm font-medium text-slate-200 block">Auto-Start Breaks</span>
                  <span className="text-xs text-slate-400">Automatically start countdown for breaks</span>
                </div>
              </div>
              <input
                type="checkbox"
                checked={form.autoStartBreaks}
                onChange={(e) => setForm({ ...form, autoStartBreaks: e.target.checked })}
                className="w-5 h-5 accent-purple-600 rounded cursor-pointer"
              />
            </div>
          </div>

          {/* Reset All Data Area */}
          <div className="pt-2 border-t border-slate-800/80 flex items-center justify-between">
            <button
              type="button"
              onClick={handleResetDefaults}
              className="text-xs text-slate-400 hover:text-slate-200 transition-colors py-1.5 px-2"
            >
              Reset to 25/5 defaults
            </button>

            <button
              type="button"
              onClick={() => {
                if (confirm('Clear all tasks, daily history, and reset to defaults? This cannot be undone.')) {
                  onClearAllData();
                  onClose();
                }
              }}
              className="text-xs text-rose-400 hover:text-rose-300 py-1.5 px-2 flex items-center gap-1 hover:bg-rose-500/10 rounded-lg transition-colors"
            >
              <AlertTriangle className="w-3.5 h-3.5" />
              <span>Clear all data</span>
            </button>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-3 pt-3">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-2.5 rounded-xl border border-slate-700 bg-slate-800/60 hover:bg-slate-800 text-slate-300 text-sm font-medium transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex-1 py-2.5 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white text-sm font-semibold shadow-lg shadow-purple-600/25 transition-all"
            >
              Save Changes
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
