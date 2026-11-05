import React from 'react';
import { Play, Pause, RotateCcw, SkipForward, CheckCircle2, Plus, Sparkles, Coffee } from 'lucide-react';
import { TimerMode, Task, UserSettings } from '../types';
import { playButtonTapSound } from '../utils/sound';

interface TimerViewProps {
  mode: TimerMode;
  isRunning: boolean;
  timeLeft: number;
  totalTime: number;
  cycleCount: number;
  settings: UserSettings;
  activeTask: Task | null;
  onStart: () => void;
  onPause: () => void;
  onReset: () => void;
  onSkip: () => void;
  onSwitchMode: (mode: TimerMode) => void;
  onAdjustTime: (seconds: number) => void;
  onCompleteTask: (taskId: string) => void;
  onSelectTaskTab: () => void;
  todayPomodoros: number;
}

export const TimerView: React.FC<TimerViewProps> = ({
  mode,
  isRunning,
  timeLeft,
  totalTime,
  cycleCount,
  settings,
  activeTask,
  onStart,
  onPause,
  onReset,
  onSkip,
  onSwitchMode,
  onAdjustTime,
  onCompleteTask,
  onSelectTaskTab,
  todayPomodoros,
}) => {
  // Format MM:SS
  const minutes = Math.floor(timeLeft / 60);
  const seconds = timeLeft % 60;
  const timeString = `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;

  // SVG circular progress calculation
  const radius = 105;
  const strokeWidth = 9;
  const circumference = 2 * Math.PI * radius;
  // Progress from 0 to 1
  const progressRatio = totalTime > 0 ? (totalTime - timeLeft) / totalTime : 0;
  const strokeDashoffset = circumference - progressRatio * circumference;

  const handlePlayPause = () => {
    playButtonTapSound(settings.soundEnabled);
    if (isRunning) {
      onPause();
    } else {
      onStart();
    }
  };

  const handleReset = () => {
    playButtonTapSound(settings.soundEnabled);
    onReset();
  };

  const handleSkip = () => {
    playButtonTapSound(settings.soundEnabled);
    onSkip();
  };

  const isBreak = mode === 'shortBreak' || mode === 'longBreak';

  return (
    <div className="flex flex-col items-center justify-center w-full max-w-md mx-auto px-4 py-4 sm:py-6">
      {/* Mode Selector Tabs */}
      <div className="flex items-center gap-1.5 p-1 bg-slate-900/90 border border-slate-800/80 rounded-2xl w-full max-w-xs shadow-inner mb-6">
        <button
          onClick={() => {
            playButtonTapSound(settings.soundEnabled);
            onSwitchMode('focus');
          }}
          className={`flex-1 py-2 text-xs font-semibold rounded-xl transition-all min-h-[40px] flex items-center justify-center gap-1.5 ${
            mode === 'focus'
              ? 'bg-gradient-to-r from-purple-600 to-indigo-600 text-white shadow-md shadow-purple-600/25'
              : 'text-slate-400 hover:text-white hover:bg-slate-800/50'
          }`}
        >
          <Sparkles className="w-3.5 h-3.5" />
          <span>Focus</span>
          <span className="text-[10px] opacity-75 font-mono">25m</span>
        </button>

        <button
          onClick={() => {
            playButtonTapSound(settings.soundEnabled);
            onSwitchMode('shortBreak');
          }}
          className={`flex-1 py-2 text-xs font-semibold rounded-xl transition-all min-h-[40px] flex items-center justify-center gap-1.5 ${
            mode === 'shortBreak'
              ? 'bg-gradient-to-r from-blue-600 to-cyan-600 text-white shadow-md shadow-blue-600/25'
              : 'text-slate-400 hover:text-white hover:bg-slate-800/50'
          }`}
        >
          <Coffee className="w-3.5 h-3.5" />
          <span>Short</span>
          <span className="text-[10px] opacity-75 font-mono">5m</span>
        </button>

        <button
          onClick={() => {
            playButtonTapSound(settings.soundEnabled);
            onSwitchMode('longBreak');
          }}
          className={`flex-1 py-2 text-xs font-semibold rounded-xl transition-all min-h-[40px] flex items-center justify-center gap-1.5 ${
            mode === 'longBreak'
              ? 'bg-gradient-to-r from-indigo-600 to-blue-600 text-white shadow-md shadow-indigo-600/25'
              : 'text-slate-400 hover:text-white hover:bg-slate-800/50'
          }`}
        >
          <span>Long</span>
          <span className="text-[10px] opacity-75 font-mono">15m</span>
        </button>
      </div>

      {/* Circular Timer Display */}
      <div className="relative flex items-center justify-center my-2 sm:my-4 select-none">
        {/* Ambient subtle backglow */}
        <div
          className={`absolute w-64 h-64 rounded-full blur-3xl transition-opacity duration-700 pointer-events-none ${
            isBreak
              ? 'bg-blue-600/15'
              : 'bg-purple-600/20'
          } ${isRunning ? 'opacity-100 scale-105' : 'opacity-40 scale-95'}`}
        />

        <svg className="w-64 h-64 sm:w-72 sm:h-72 transform -rotate-90" viewBox="0 0 250 250">
          <defs>
            <linearGradient id="focusGradient" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#A855F7" />
              <stop offset="50%" stopColor="#6366F1" />
              <stop offset="100%" stopColor="#3B82F6" />
            </linearGradient>
            <linearGradient id="breakGradient" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#38BDF8" />
              <stop offset="100%" stopColor="#2563EB" />
            </linearGradient>
          </defs>

          {/* Background track circle */}
          <circle
            cx="125"
            cy="125"
            r={radius}
            fill="transparent"
            stroke="currentColor"
            strokeWidth={strokeWidth}
            className="text-slate-800/60"
          />

          {/* Active progress stroke */}
          <circle
            cx="125"
            cy="125"
            r={radius}
            fill="transparent"
            stroke={`url(#${isBreak ? 'breakGradient' : 'focusGradient'})`}
            strokeWidth={strokeWidth}
            strokeDasharray={circumference}
            strokeDashoffset={strokeDashoffset}
            strokeLinecap="round"
            className="transition-all duration-300 ease-linear"
          />
        </svg>

        {/* Center Timer Content */}
        <div className="absolute inset-0 flex flex-col items-center justify-center text-center px-4">
          <span
            className={`text-xs font-semibold tracking-wider uppercase mb-1.5 transition-colors ${
              isBreak ? 'text-blue-400' : 'text-purple-400'
            }`}
          >
            {mode === 'focus' ? 'Focus Session' : mode === 'shortBreak' ? 'Short Recharge' : 'Long Rest'}
          </span>

          <span className="font-mono text-5xl sm:text-6xl font-bold tracking-tight text-white tabular-nums drop-shadow-md">
            {timeString}
          </span>

          {/* Session Indicator Dots */}
          <div className="flex items-center gap-1.5 mt-3">
            {[1, 2, 3, 4].map((i) => {
              const currentInCycle = (cycleCount % 4) + 1;
              const isFilled = i <= (cycleCount % 4);
              const isCurrent = i === currentInCycle && isRunning;
              return (
                <div
                  key={i}
                  className={`h-2 rounded-full transition-all duration-300 ${
                    isCurrent
                      ? 'w-5 bg-gradient-to-r from-purple-400 to-indigo-400 ring-2 ring-purple-500/30'
                      : isFilled
                      ? 'w-2 bg-indigo-500'
                      : 'w-2 bg-slate-800'
                  }`}
                  title={`Session ${i} of 4`}
                />
              );
            })}
          </div>

          <span className="text-[11px] text-slate-400 mt-1.5 font-medium">
            Session {(cycleCount % 4) + 1} of 4 · {todayPomodoros} done today
          </span>
        </div>
      </div>

      {/* Pinned Active Task Card */}
      <div className="w-full mt-4">
        {activeTask ? (
          <div className="flex items-center justify-between p-3.5 rounded-2xl bg-slate-900/80 border border-indigo-900/40 shadow-sm backdrop-blur-sm transition-all hover:border-indigo-800/60">
            <div className="flex items-center gap-3 min-w-0 pr-2">
              <button
                onClick={() => onCompleteTask(activeTask.id)}
                className="flex-shrink-0 text-slate-500 hover:text-emerald-400 transition-colors p-1 -m-1"
                title="Mark task completed"
              >
                <div className="w-5 h-5 rounded-md border-2 border-slate-600 flex items-center justify-center hover:border-emerald-400">
                  {activeTask.completed && <CheckCircle2 className="w-4 h-4 text-emerald-400" />}
                </div>
              </button>
              <div className="min-w-0">
                <div className="text-[10px] text-indigo-400 font-semibold uppercase tracking-wider">Current Focus</div>
                <div className="text-sm font-medium text-slate-100 truncate">{activeTask.title}</div>
              </div>
            </div>

            <button
              onClick={onSelectTaskTab}
              className="text-xs text-slate-400 hover:text-white px-2 py-1 rounded-lg hover:bg-slate-800/80 transition-colors whitespace-nowrap shrink-0"
            >
              Change
            </button>
          </div>
        ) : (
          <button
            onClick={onSelectTaskTab}
            className="w-full flex items-center justify-between p-3 rounded-2xl border border-dashed border-slate-800 hover:border-slate-700 bg-slate-900/30 hover:bg-slate-900/60 text-left transition-colors group"
          >
            <div className="flex items-center gap-2.5">
              <div className="w-7 h-7 rounded-lg bg-slate-800/80 flex items-center justify-center text-slate-400 group-hover:text-purple-400 transition-colors">
                <Plus className="w-4 h-4" />
              </div>
              <span className="text-xs text-slate-400 group-hover:text-slate-300">
                Set a focus task from your list...
              </span>
            </div>
            <span className="text-[11px] text-purple-400 font-medium">Select</span>
          </button>
        )}
      </div>

      {/* Main Action Buttons */}
      <div className="flex items-center justify-center gap-4 mt-6 w-full max-w-xs">
        {/* Reset button */}
        <button
          onClick={handleReset}
          className="flex h-12 w-12 items-center justify-center rounded-2xl bg-slate-900 border border-slate-800 text-slate-300 hover:text-white hover:bg-slate-800 active:scale-95 transition-all shadow-sm"
          title="Reset timer"
          aria-label="Reset timer"
        >
          <RotateCcw className="w-4 h-4" />
        </button>

        {/* Primary Start/Pause Button */}
        <button
          onClick={handlePlayPause}
          className={`flex-1 h-14 rounded-2xl font-semibold text-white flex items-center justify-center gap-2.5 shadow-lg active:scale-[0.98] transition-all min-h-[48px] ${
            isBreak
              ? 'bg-gradient-to-r from-blue-600 via-indigo-600 to-blue-500 hover:from-blue-500 hover:to-indigo-500 shadow-blue-600/30'
              : 'bg-gradient-to-r from-purple-600 via-indigo-600 to-blue-600 hover:from-purple-500 hover:to-blue-500 shadow-purple-600/30'
          }`}
        >
          {isRunning ? (
            <>
              <Pause className="w-5 h-5 fill-current" />
              <span className="text-base tracking-wide">Pause</span>
            </>
          ) : (
            <>
              <Play className="w-5 h-5 fill-current ml-0.5" />
              <span className="text-base tracking-wide">{timeLeft === totalTime ? 'Start Focus' : 'Resume'}</span>
            </>
          )}
        </button>

        {/* Skip button */}
        <button
          onClick={handleSkip}
          className="flex h-12 w-12 items-center justify-center rounded-2xl bg-slate-900 border border-slate-800 text-slate-300 hover:text-white hover:bg-slate-800 active:scale-95 transition-all shadow-sm"
          title="Skip to next session"
          aria-label="Skip to next session"
        >
          <SkipForward className="w-4 h-4" />
        </button>
      </div>

      {/* Quick Time Adjustment Buttons */}
      <div className="flex items-center gap-2 mt-4 text-xs text-slate-400">
        <button
          onClick={() => {
            playButtonTapSound(settings.soundEnabled);
            onAdjustTime(-60);
          }}
          disabled={timeLeft <= 60}
          className="px-2.5 py-1 rounded-lg bg-slate-900/80 border border-slate-800/80 hover:bg-slate-800 hover:text-slate-200 disabled:opacity-30 disabled:pointer-events-none transition-colors"
        >
          -1 min
        </button>
        <button
          onClick={() => {
            playButtonTapSound(settings.soundEnabled);
            onAdjustTime(60);
          }}
          className="px-2.5 py-1 rounded-lg bg-slate-900/80 border border-slate-800/80 hover:bg-slate-800 hover:text-slate-200 transition-colors"
        >
          +1 min
        </button>
        <button
          onClick={() => {
            playButtonTapSound(settings.soundEnabled);
            onAdjustTime(300);
          }}
          className="px-2.5 py-1 rounded-lg bg-slate-900/80 border border-slate-800/80 hover:bg-slate-800 hover:text-slate-200 transition-colors"
        >
          +5 min
        </button>
      </div>
    </div>
  );
};
