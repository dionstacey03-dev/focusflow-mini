import React from 'react';
import { CheckCircle2, Flame, Clock, Award, Calendar, RotateCcw } from 'lucide-react';
import { Task, DailyLog, UserSettings } from '../types';
import { formatMinutes, getTodayDateString } from '../utils/storage';
import { playButtonTapSound } from '../utils/sound';

interface ProgressViewProps {
  tasks: Task[];
  dailyLogs: Record<string, DailyLog>;
  settings: UserSettings;
  onResetTodayProgress: () => void;
  soundEnabled: boolean;
}

export const ProgressView: React.FC<ProgressViewProps> = ({
  tasks,
  dailyLogs,
  settings,
  onResetTodayProgress,
  soundEnabled,
}) => {
  const todayStr = getTodayDateString();
  const todayLog = dailyLogs[todayStr] || {
    date: todayStr,
    completedPomodoros: 0,
    focusMinutes: 0,
    completedTaskIds: [],
  };

  const todayCompletedTasks = tasks.filter((t) => t.completed && todayLog.completedTaskIds.includes(t.id));

  // Calculate past 7 days logs
  const past7Days = Array.from({ length: 7 }, (_, i) => {
    const d = new Date();
    d.setDate(d.getDate() - (6 - i));
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    const dateKey = `${year}-${month}-${day}`;
    const log = dailyLogs[dateKey];
    const isToday = i === 6;

    return {
      dateKey,
      dayLabel: isToday ? 'Today' : d.toLocaleDateString('en-US', { weekday: 'narrow' }),
      shortDate: d.toLocaleDateString('en-US', { month: 'numeric', day: 'numeric' }),
      pomodoros: log?.completedPomodoros || 0,
      focusMinutes: log?.focusMinutes || 0,
      isToday,
    };
  });

  const goalRatio = Math.min(1, todayLog.completedPomodoros / Math.max(1, settings.dailyGoalPomodoros));
  const goalPercent = Math.round(goalRatio * 100);

  return (
    <div className="w-full max-w-xl mx-auto px-4 py-4 sm:py-6">
      {/* Title & Today's Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-xl font-bold text-white tracking-tight">Daily Progress</h2>
          <div className="flex items-center gap-2 text-xs text-slate-400 mt-0.5">
            <Calendar className="w-3.5 h-3.5 text-purple-400" />
            <span>
              {new Date().toLocaleDateString('en-US', {
                weekday: 'long',
                month: 'short',
                day: 'numeric',
              })}
            </span>
          </div>
        </div>

        <button
          onClick={() => {
            playButtonTapSound(soundEnabled);
            if (confirm("Reset today's recorded focus time and session counter?")) {
              onResetTodayProgress();
            }
          }}
          className="text-xs text-slate-400 hover:text-slate-200 py-1.5 px-3 rounded-xl border border-slate-800 bg-slate-900/60 hover:bg-slate-800 transition-colors flex items-center gap-1.5 min-h-[36px]"
          title="Reset today stats"
        >
          <RotateCcw className="w-3.5 h-3.5" />
          <span>Reset Day</span>
        </button>
      </div>

      {/* Main KPI Stat Grid */}
      <div className="grid grid-cols-3 gap-3 mb-6">
        {/* Metric 1: Focus Time */}
        <div className="p-3.5 rounded-2xl bg-slate-900/80 border border-slate-800 backdrop-blur-sm flex flex-col justify-between">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-[11px] font-medium uppercase tracking-wider">Focus Time</span>
            <Clock className="w-3.5 h-3.5 text-blue-400" />
          </div>
          <div className="font-mono text-xl sm:text-2xl font-bold text-white tabular-nums">
            {formatMinutes(todayLog.focusMinutes)}
          </div>
          <span className="text-[10px] text-slate-500 mt-1">Logged today</span>
        </div>

        {/* Metric 2: Pomodoro Sessions */}
        <div className="p-3.5 rounded-2xl bg-slate-900/80 border border-slate-800 backdrop-blur-sm flex flex-col justify-between">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-[11px] font-medium uppercase tracking-wider">Sessions</span>
            <Flame className="w-3.5 h-3.5 text-purple-400" />
          </div>
          <div className="font-mono text-xl sm:text-2xl font-bold text-white tabular-nums">
            {todayLog.completedPomodoros}
            <span className="text-xs font-normal text-slate-500 ml-1">/ {settings.dailyGoalPomodoros}</span>
          </div>
          <span className="text-[10px] text-slate-500 mt-1">{goalPercent}% of daily goal</span>
        </div>

        {/* Metric 3: Tasks Done */}
        <div className="p-3.5 rounded-2xl bg-slate-900/80 border border-slate-800 backdrop-blur-sm flex flex-col justify-between">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-[11px] font-medium uppercase tracking-wider">Tasks Done</span>
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
          </div>
          <div className="font-mono text-xl sm:text-2xl font-bold text-white tabular-nums">
            {todayCompletedTasks.length}
          </div>
          <span className="text-[10px] text-slate-500 mt-1">Completed today</span>
        </div>
      </div>

      {/* Daily Goal Progress Bar Card */}
      <div className="p-4 rounded-2xl bg-slate-900/70 border border-slate-800/80 mb-6 backdrop-blur-sm">
        <div className="flex items-center justify-between text-xs mb-2.5">
          <div className="flex items-center gap-1.5 font-semibold text-slate-200">
            <Award className="w-4 h-4 text-purple-400" />
            <span>Daily Focus Target</span>
          </div>
          <span className="font-mono font-bold text-purple-400 tabular-nums">
            {todayLog.completedPomodoros} of {settings.dailyGoalPomodoros} Pomodoros ({goalPercent}%)
          </span>
        </div>

        {/* Visual Progress Bar */}
        <div className="w-full h-3 rounded-full bg-slate-950 border border-slate-800/80 overflow-hidden p-0.5">
          <div
            className="h-full rounded-full bg-gradient-to-r from-purple-600 via-indigo-600 to-blue-500 transition-all duration-500"
            style={{ width: `${goalPercent}%` }}
          />
        </div>

        <p className="text-[11px] text-slate-400 mt-2.5">
          {goalPercent >= 100
            ? '🎉 Outstanding work! You smashed your focus target for today!'
            : goalPercent >= 50
            ? '🔥 Great momentum! Keep going to hit your daily productivity milestone.'
            : '⚡ Ready for deep work? Start a 25-minute sprint to make progress.'}
        </p>
      </div>

      {/* 7-Day Activity Sparkline / Bar Chart */}
      <div className="p-4 rounded-2xl bg-slate-900/70 border border-slate-800/80 mb-6 backdrop-blur-sm">
        <div className="flex items-center justify-between mb-4">
          <span className="text-xs font-semibold text-slate-300">7-Day Consistency</span>
          <span className="text-[11px] text-slate-500">Goal: {settings.dailyGoalPomodoros} / day</span>
        </div>

        <div className="grid grid-cols-7 gap-2 items-end h-28 pt-2">
          {past7Days.map((d) => {
            const maxDisplay = Math.max(settings.dailyGoalPomodoros, 8);
            const heightPercent = Math.min(100, Math.round((d.pomodoros / maxDisplay) * 100));
            return (
              <div key={d.dateKey} className="flex flex-col items-center gap-1.5 h-full justify-end">
                <span className="text-[10px] font-mono text-slate-400 tabular-nums">{d.pomodoros}</span>
                <div className="w-full bg-slate-950/80 rounded-lg h-16 flex items-end p-1 border border-slate-800/50">
                  <div
                    className={`w-full rounded-md transition-all duration-500 ${
                      d.isToday
                        ? 'bg-gradient-to-t from-purple-600 to-indigo-500 shadow-sm shadow-purple-600/30'
                        : d.pomodoros > 0
                        ? 'bg-slate-700 hover:bg-slate-600'
                        : 'bg-slate-900'
                    }`}
                    style={{ height: `${Math.max(8, heightPercent)}%` }}
                    title={`${d.shortDate}: ${d.pomodoros} pomodoros (${formatMinutes(d.focusMinutes)})`}
                  />
                </div>
                <span
                  className={`text-[10px] font-medium ${
                    d.isToday ? 'text-purple-400 font-bold' : 'text-slate-500'
                  }`}
                >
                  {d.dayLabel}
                </span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Completed Tasks Log List */}
      <div>
        <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-400 mb-3">
          Completed Tasks Today ({todayCompletedTasks.length})
        </h3>

        {todayCompletedTasks.length === 0 ? (
          <div className="p-4 rounded-2xl border border-dashed border-slate-800 bg-slate-900/30 text-center">
            <p className="text-xs text-slate-500">
              No tasks completed yet today. Check off tasks in the Tasks tab as you finish them!
            </p>
          </div>
        ) : (
          <div className="space-y-2">
            {todayCompletedTasks.map((t) => (
              <div
                key={t.id}
                className="flex items-center justify-between p-3 rounded-xl bg-slate-900/60 border border-slate-800/70 text-xs"
              >
                <div className="flex items-center gap-2.5 min-w-0 pr-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                  <span className="text-slate-200 font-medium truncate">{t.title}</span>
                </div>
                <div className="flex items-center gap-2 text-slate-500 shrink-0 font-mono">
                  <span>{t.completedPomodoros} focus</span>
                  {t.completedAt && (
                    <>
                      <span aria-hidden="true">·</span>
                      <span>
                        {new Date(t.completedAt).toLocaleTimeString('en-US', {
                          hour: 'numeric',
                          minute: '2-digit',
                        })}
                      </span>
                    </>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
