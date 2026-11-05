import React, { useState } from 'react';
import { Plus, Check, Trash2, Pin, Sparkles, CheckCircle2 } from 'lucide-react';
import { Task, Priority } from '../types';
import { playButtonTapSound } from '../utils/sound';

interface TasksViewProps {
  tasks: Task[];
  activeTaskId: string | null;
  onAddTask: (title: string, priority: Priority, estimatedPomodoros: number) => void;
  onToggleTask: (taskId: string) => void;
  onDeleteTask: (taskId: string) => void;
  onSetActiveTask: (taskId: string | null) => void;
  onClearCompleted: () => void;
  soundEnabled: boolean;
  onSwitchToTimer?: () => void;
}

export const TasksView: React.FC<TasksViewProps> = ({
  tasks,
  activeTaskId,
  onAddTask,
  onToggleTask,
  onDeleteTask,
  onSetActiveTask,
  onClearCompleted,
  soundEnabled,
  onSwitchToTimer,
}) => {
  const [newTitle, setNewTitle] = useState('');
  const [priority, setPriority] = useState<Priority>('medium');
  const [estimate, setEstimate] = useState<number>(2);
  const [filter, setFilter] = useState<'all' | 'active' | 'completed'>('all');
  const [isAddingOpen, setIsAddingOpen] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim()) return;
    playButtonTapSound(soundEnabled);
    onAddTask(newTitle.trim(), priority, estimate);
    setNewTitle('');
    setIsAddingOpen(false);
  };

  const filteredTasks = tasks.filter((t) => {
    if (filter === 'active') return !t.completed;
    if (filter === 'completed') return t.completed;
    return true;
  });

  const completedCount = tasks.filter((t) => t.completed).length;
  const activeCount = tasks.length - completedCount;

  return (
    <div className="w-full max-w-xl mx-auto px-4 py-4 sm:py-6">
      {/* Top Header & Filter Segment */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-5">
        <div>
          <h2 className="text-xl font-bold text-white tracking-tight">Tasks</h2>
          <div className="flex items-center gap-2 text-xs text-slate-400 mt-0.5">
            <span>{activeCount} active</span>
            <span aria-hidden="true">·</span>
            <span>{completedCount} completed</span>
          </div>
        </div>

        {/* Filter Segmented Control */}
        <div className="flex items-center gap-1 p-1 bg-slate-900/90 border border-slate-800 rounded-xl self-start sm:self-auto">
          {(['all', 'active', 'completed'] as const).map((f) => (
            <button
              key={f}
              onClick={() => {
                playButtonTapSound(soundEnabled);
                setFilter(f);
              }}
              className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-all capitalize whitespace-nowrap min-h-[34px] ${
                filter === f
                  ? 'bg-gradient-to-r from-purple-600 to-indigo-600 text-white shadow-sm'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              {f}
            </button>
          ))}
        </div>
      </div>

      {/* Task Creation Card / Trigger */}
      <div className="mb-5 rounded-2xl bg-slate-900/70 border border-slate-800/80 p-3.5 shadow-sm backdrop-blur-sm">
        <form onSubmit={handleSubmit} className="flex flex-col gap-3">
          <div className="flex items-center gap-2">
            <input
              type="text"
              value={newTitle}
              onChange={(e) => setNewTitle(e.target.value)}
              onFocus={() => setIsAddingOpen(true)}
              placeholder="What do you want to accomplish?"
              className="flex-1 bg-slate-950/80 border border-slate-800 rounded-xl px-3.5 py-2.5 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-purple-500/80 focus:ring-1 focus:ring-purple-500/80 transition-all"
            />
            <button
              type="submit"
              disabled={!newTitle.trim()}
              className="h-10 px-4 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 disabled:opacity-40 disabled:pointer-events-none text-white text-xs font-semibold flex items-center gap-1.5 shadow-md shadow-purple-600/20 active:scale-95 transition-all whitespace-nowrap shrink-0"
            >
              <Plus className="w-4 h-4" />
              <span>Add</span>
            </button>
          </div>

          {/* Expanded Task Options */}
          {isAddingOpen && (
            <div className="flex flex-wrap items-center justify-between gap-3 pt-2 border-t border-slate-800/80 text-xs">
              {/* Priority Selection */}
              <div className="flex items-center gap-1.5">
                <span className="text-slate-400 font-medium">Priority:</span>
                {(['low', 'medium', 'high'] as Priority[]).map((p) => (
                  <button
                    key={p}
                    type="button"
                    onClick={() => setPriority(p)}
                    className={`px-2 py-1 rounded-md capitalize transition-colors min-h-[30px] ${
                      priority === p
                        ? p === 'high'
                          ? 'bg-rose-500/20 text-rose-300 font-semibold border border-rose-500/30'
                          : p === 'medium'
                          ? 'bg-amber-500/20 text-amber-300 font-semibold border border-amber-500/30'
                          : 'bg-blue-500/20 text-blue-300 font-semibold border border-blue-500/30'
                        : 'text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    {p}
                  </button>
                ))}
              </div>

              {/* Estimate Selection */}
              <div className="flex items-center gap-1.5">
                <span className="text-slate-400 font-medium">Target Sessions:</span>
                <div className="flex items-center gap-1">
                  {[1, 2, 3, 4, 5].map((num) => (
                    <button
                      key={num}
                      type="button"
                      onClick={() => setEstimate(num)}
                      className={`w-6 h-6 rounded-md font-mono text-xs flex items-center justify-center transition-colors ${
                        estimate === num
                          ? 'bg-purple-600 text-white font-bold'
                          : 'text-slate-400 bg-slate-800/60 hover:text-white'
                      }`}
                    >
                      {num}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}
        </form>
      </div>

      {/* Task List */}
      <div className="space-y-2.5">
        {filteredTasks.length === 0 ? (
          <div className="text-center py-12 px-4 rounded-2xl border border-dashed border-slate-800 bg-slate-900/20">
            <CheckCircle2 className="w-10 h-10 text-slate-700 mx-auto mb-3" />
            <h3 className="text-sm font-semibold text-slate-300">No tasks found</h3>
            <p className="text-xs text-slate-500 mt-1 max-w-xs mx-auto">
              {filter === 'completed'
                ? 'Finish a task to see it listed here.'
                : filter === 'active'
                ? 'All clear! Add a new task to start your next focus session.'
                : 'Add a task above to structure your focus sessions.'}
            </p>
          </div>
        ) : (
          filteredTasks.map((task) => {
            const isPinned = activeTaskId === task.id;
            return (
              <div
                key={task.id}
                className={`group flex items-center justify-between p-3.5 rounded-2xl border transition-all ${
                  isPinned
                    ? 'bg-slate-900/90 border-indigo-500/50 shadow-md shadow-indigo-500/10'
                    : task.completed
                    ? 'bg-slate-900/30 border-slate-800/50 opacity-60'
                    : 'bg-slate-900/60 border-slate-800 hover:border-slate-700/80'
                }`}
              >
                {/* Left: Checkbox + Title */}
                <div className="flex items-center gap-3 min-w-0 pr-3">
                  <button
                    onClick={() => {
                      playButtonTapSound(soundEnabled);
                      onToggleTask(task.id);
                    }}
                    className="flex-shrink-0 min-h-[44px] min-w-[44px] -ml-2 -my-2 flex items-center justify-center text-slate-400 hover:text-emerald-400 transition-colors"
                    aria-label={task.completed ? 'Mark task active' : 'Mark task completed'}
                  >
                    <div
                      className={`w-5 h-5 rounded-lg border flex items-center justify-center transition-all ${
                        task.completed
                          ? 'bg-emerald-500 border-emerald-500 text-slate-950'
                          : 'border-slate-600 group-hover:border-slate-500 bg-slate-950/50'
                      }`}
                    >
                      {task.completed && <Check className="w-3.5 h-3.5 stroke-[3]" />}
                    </div>
                  </button>

                  <div className="min-w-0">
                    <span
                      className={`text-sm block truncate transition-all ${
                        task.completed
                          ? 'line-through text-slate-500'
                          : 'text-slate-100 font-medium'
                      }`}
                    >
                      {task.title}
                    </span>

                    {/* Metadata line without pills */}
                    <div className="flex items-center gap-2 text-[11px] text-slate-400 mt-0.5">
                      <span
                        className={
                          task.priority === 'high'
                            ? 'text-rose-400 font-medium'
                            : task.priority === 'medium'
                            ? 'text-amber-400 font-medium'
                            : 'text-blue-400 font-medium'
                        }
                      >
                        {task.priority.toUpperCase()}
                      </span>
                      <span aria-hidden="true" className="text-slate-600">·</span>
                      <span className="font-mono tabular-nums">
                        {task.completedPomodoros}/{task.estimatedPomodoros} focus
                      </span>
                      {isPinned && (
                        <>
                          <span aria-hidden="true" className="text-slate-600">·</span>
                          <span className="text-indigo-400 font-semibold flex items-center gap-1">
                            <Sparkles className="w-3 h-3" /> Active Focus
                          </span>
                        </>
                      )}
                    </div>
                  </div>
                </div>

                {/* Right: Actions */}
                <div className="flex items-center gap-1 shrink-0">
                  {/* Pin as Focus Task */}
                  {!task.completed && (
                    <button
                      onClick={() => {
                        playButtonTapSound(soundEnabled);
                        onSetActiveTask(isPinned ? null : task.id);
                        if (!isPinned && onSwitchToTimer) {
                          onSwitchToTimer();
                        }
                      }}
                      className={`min-h-[40px] min-w-[40px] flex items-center justify-center rounded-xl transition-all ${
                        isPinned
                          ? 'text-indigo-400 bg-indigo-500/10 hover:bg-indigo-500/20'
                          : 'text-slate-500 hover:text-slate-200 hover:bg-slate-800'
                      }`}
                      title={isPinned ? 'Remove as active focus' : 'Focus this task in timer'}
                      aria-label="Toggle active focus"
                    >
                      <Pin className={`w-4 h-4 ${isPinned ? 'fill-current' : ''}`} />
                    </button>
                  )}

                  {/* Delete Task */}
                  <button
                    onClick={() => {
                      playButtonTapSound(soundEnabled);
                      onDeleteTask(task.id);
                    }}
                    className="min-h-[40px] min-w-[40px] flex items-center justify-center rounded-xl text-slate-500 hover:text-rose-400 hover:bg-rose-500/10 transition-colors"
                    title="Delete task"
                    aria-label="Delete task"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Footer Actions: Clear completed */}
      {completedCount > 0 && (
        <div className="mt-6 pt-4 border-t border-slate-800/80 flex items-center justify-between text-xs text-slate-400">
          <span>{completedCount} completed tasks</span>
          <button
            onClick={() => {
              playButtonTapSound(soundEnabled);
              onClearCompleted();
            }}
            className="hover:text-rose-400 transition-colors py-1 px-2 rounded-lg hover:bg-rose-500/10"
          >
            Clear completed
          </button>
        </div>
      )}
    </div>
  );
};
