import { useState, useEffect, useMemo } from 'react';
import { ActiveTab, Priority, Task, UserSettings } from './types';
import {
  loadTasks,
  saveTasks,
  loadDailyLogs,
  saveDailyLogs,
  recordCompletedPomodoro,
  recordCompletedTaskInDailyLog,
  recordUncompletedTaskInDailyLog,
  loadSettings,
  saveSettings,
  loadActiveTaskId,
  saveActiveTaskId,
  getTodayDateString,
  DEFAULT_SETTINGS,
} from './utils/storage';
import { useTimer } from './hooks/useTimer';
import { Header } from './components/Header';
import { TimerView } from './components/TimerView';
import { TasksView } from './components/TasksView';
import { ProgressView } from './components/ProgressView';
import { SettingsModal } from './components/SettingsModal';
import { BottomNav } from './components/BottomNav';

export default function App() {
  const [tasks, setTasks] = useState<Task[]>(() => loadTasks());
  const [dailyLogs, setDailyLogs] = useState(() => loadDailyLogs());
  const [settings, setSettingsState] = useState<UserSettings>(() => loadSettings());
  const [activeTaskId, setActiveTaskIdState] = useState<string | null>(() => loadActiveTaskId());
  const [activeTab, setActiveTab] = useState<ActiveTab>('timer');
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);

  // Sync tasks to localStorage
  const updateTasks = (newTasks: Task[]) => {
    setTasks(newTasks);
    saveTasks(newTasks);
  };

  // Sync settings
  const updateSettings = (newSettings: UserSettings) => {
    setSettingsState(newSettings);
    saveSettings(newSettings);
  };

  // Sync active task id
  const setActiveTaskId = (id: string | null) => {
    setActiveTaskIdState(id);
    saveActiveTaskId(id);
  };

  // Calculate today's pomodoro count
  const todayStr = getTodayDateString();
  const todayPomodoros = dailyLogs[todayStr]?.completedPomodoros || 0;

  // Active task object
  const activeTask = useMemo(() => {
    if (!activeTaskId) return null;
    return tasks.find((t) => t.id === activeTaskId) || null;
  }, [tasks, activeTaskId]);

  // Pomodoro Completion Handler
  const handlePomodoroComplete = (durationMinutes: number) => {
    // 1. Record pomodoro in daily logs
    const { logs } = recordCompletedPomodoro(durationMinutes, activeTaskId);
    setDailyLogs(logs);

    // 2. Increment pomodoros count on active task if pinned
    if (activeTaskId) {
      const updated = tasks.map((t) => {
        if (t.id === activeTaskId) {
          return {
            ...t,
            completedPomodoros: t.completedPomodoros + 1,
          };
        }
        return t;
      });
      updateTasks(updated);
    }
  };

  // Timer hook
  const timer = useTimer({
    settings,
    onPomodoroComplete: handlePomodoroComplete,
  });

  // Task actions
  const handleAddTask = (title: string, priority: Priority, estimatedPomodoros: number) => {
    const newTask: Task = {
      id: `task-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
      title,
      completed: false,
      priority,
      estimatedPomodoros,
      completedPomodoros: 0,
      createdAt: new Date().toISOString(),
    };
    const updated = [newTask, ...tasks];
    updateTasks(updated);

    // Automatically set as active task if none is set
    if (!activeTaskId) {
      setActiveTaskId(newTask.id);
    }
  };

  const handleToggleTask = (taskId: string) => {
    const updated = tasks.map((t) => {
      if (t.id === taskId) {
        const nextCompleted = !t.completed;
        if (nextCompleted) {
          recordCompletedTaskInDailyLog(taskId);
        } else {
          recordUncompletedTaskInDailyLog(taskId);
        }
        return {
          ...t,
          completed: nextCompleted,
          completedAt: nextCompleted ? new Date().toISOString() : undefined,
        };
      }
      return t;
    });
    updateTasks(updated);
    setDailyLogs(loadDailyLogs());
  };

  const handleDeleteTask = (taskId: string) => {
    const updated = tasks.filter((t) => t.id !== taskId);
    updateTasks(updated);
    if (activeTaskId === taskId) {
      setActiveTaskId(null);
    }
    recordUncompletedTaskInDailyLog(taskId);
    setDailyLogs(loadDailyLogs());
  };

  const handleClearCompleted = () => {
    const updated = tasks.filter((t) => !t.completed);
    updateTasks(updated);
  };

  const handleResetTodayProgress = () => {
    const logs = loadDailyLogs();
    logs[todayStr] = {
      date: todayStr,
      completedPomodoros: 0,
      focusMinutes: 0,
      completedTaskIds: [],
    };
    saveDailyLogs(logs);
    setDailyLogs({ ...logs });
  };

  const handleClearAllData = () => {
    localStorage.clear();
    setTasks([]);
    setDailyLogs({});
    setSettingsState(DEFAULT_SETTINGS);
    setActiveTaskId(null);
  };

  // Keyboard shortcuts (Space to toggle play/pause, R to reset, Escape to close modal)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) {
        return;
      }
      if (e.code === 'Space') {
        e.preventDefault();
        if (timer.isRunning) {
          timer.pause();
        } else {
          timer.start();
        }
      } else if (e.key === 'r' || e.key === 'R') {
        timer.reset();
      } else if (e.key === 'Escape' && isSettingsOpen) {
        setIsSettingsOpen(false);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [timer, isSettingsOpen]);

  const activeTaskCount = tasks.filter((t) => !t.completed).length;

  return (
    <div className="min-h-screen bg-[#0B0F19] text-slate-100 flex flex-col relative selection:bg-purple-600/30 selection:text-purple-200">
      {/* Background ambient radial aura */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
        <div className="absolute -top-40 left-1/2 -translate-x-1/2 w-[600px] h-[500px] bg-gradient-to-b from-purple-900/15 via-indigo-900/10 to-transparent blur-[120px] rounded-full" />
        <div className="absolute top-1/2 -left-40 w-[400px] h-[400px] bg-blue-900/10 blur-[100px] rounded-full" />
        <div className="absolute bottom-0 right-0 w-[400px] h-[400px] bg-purple-950/15 blur-[120px] rounded-full" />
      </div>

      {/* Top Header */}
      <Header
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        settings={settings}
        onToggleSound={() => updateSettings({ ...settings, soundEnabled: !settings.soundEnabled })}
        onOpenSettings={() => setIsSettingsOpen(true)}
        todayPomodoros={todayPomodoros}
      />

      {/* Main Content Body */}
      <main className="flex-1 w-full max-w-5xl mx-auto px-4 py-4 sm:py-6 pb-24 md:pb-10 relative z-10">
        {/* On Desktop: When on Timer tab, show side-by-side workspace with Task list for high productivity */}
        <div className="block md:hidden">
          {/* Mobile Single Tab View */}
          {activeTab === 'timer' && (
            <TimerView
              mode={timer.mode}
              isRunning={timer.isRunning}
              timeLeft={timer.timeLeft}
              totalTime={timer.totalTime}
              cycleCount={timer.cycleCount}
              settings={settings}
              activeTask={activeTask}
              onStart={timer.start}
              onPause={timer.pause}
              onReset={timer.reset}
              onSkip={timer.skip}
              onSwitchMode={timer.switchMode}
              onAdjustTime={timer.adjustTime}
              onCompleteTask={handleToggleTask}
              onSelectTaskTab={() => setActiveTab('tasks')}
              todayPomodoros={todayPomodoros}
            />
          )}

          {activeTab === 'tasks' && (
            <TasksView
              tasks={tasks}
              activeTaskId={activeTaskId}
              onAddTask={handleAddTask}
              onToggleTask={handleToggleTask}
              onDeleteTask={handleDeleteTask}
              onSetActiveTask={setActiveTaskId}
              onClearCompleted={handleClearCompleted}
              soundEnabled={settings.soundEnabled}
              onSwitchToTimer={() => setActiveTab('timer')}
            />
          )}

          {activeTab === 'progress' && (
            <ProgressView
              tasks={tasks}
              dailyLogs={dailyLogs}
              settings={settings}
              onResetTodayProgress={handleResetTodayProgress}
              soundEnabled={settings.soundEnabled}
            />
          )}
        </div>

        {/* Desktop Responsive Layout (>= 768px) */}
        <div className="hidden md:block">
          {activeTab === 'timer' ? (
            <div className="grid grid-cols-12 gap-8 items-start">
              {/* Left Column: Timer */}
              <div className="col-span-6 bg-slate-900/40 border border-slate-800/80 rounded-3xl p-6 shadow-xl backdrop-blur-md">
                <TimerView
                  mode={timer.mode}
                  isRunning={timer.isRunning}
                  timeLeft={timer.timeLeft}
                  totalTime={timer.totalTime}
                  cycleCount={timer.cycleCount}
                  settings={settings}
                  activeTask={activeTask}
                  onStart={timer.start}
                  onPause={timer.pause}
                  onReset={timer.reset}
                  onSkip={timer.skip}
                  onSwitchMode={timer.switchMode}
                  onAdjustTime={timer.adjustTime}
                  onCompleteTask={handleToggleTask}
                  onSelectTaskTab={() => setActiveTab('tasks')}
                  todayPomodoros={todayPomodoros}
                />
              </div>

              {/* Right Column: Task Manager */}
              <div className="col-span-6 bg-slate-900/40 border border-slate-800/80 rounded-3xl p-6 shadow-xl backdrop-blur-md">
                <TasksView
                  tasks={tasks}
                  activeTaskId={activeTaskId}
                  onAddTask={handleAddTask}
                  onToggleTask={handleToggleTask}
                  onDeleteTask={handleDeleteTask}
                  onSetActiveTask={setActiveTaskId}
                  onClearCompleted={handleClearCompleted}
                  soundEnabled={settings.soundEnabled}
                />
              </div>
            </div>
          ) : activeTab === 'tasks' ? (
            <div className="max-w-2xl mx-auto bg-slate-900/40 border border-slate-800/80 rounded-3xl p-6 shadow-xl backdrop-blur-md">
              <TasksView
                tasks={tasks}
                activeTaskId={activeTaskId}
                onAddTask={handleAddTask}
                onToggleTask={handleToggleTask}
                onDeleteTask={handleDeleteTask}
                onSetActiveTask={setActiveTaskId}
                onClearCompleted={handleClearCompleted}
                soundEnabled={settings.soundEnabled}
                onSwitchToTimer={() => setActiveTab('timer')}
              />
            </div>
          ) : (
            <div className="max-w-2xl mx-auto bg-slate-900/40 border border-slate-800/80 rounded-3xl p-6 shadow-xl backdrop-blur-md">
              <ProgressView
                tasks={tasks}
                dailyLogs={dailyLogs}
                settings={settings}
                onResetTodayProgress={handleResetTodayProgress}
                soundEnabled={settings.soundEnabled}
              />
            </div>
          )}
        </div>
      </main>

      {/* Mobile Fixed Bottom Navigation */}
      <BottomNav
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        activeTaskCount={activeTaskCount}
        soundEnabled={settings.soundEnabled}
        onOpenSettings={() => setIsSettingsOpen(true)}
      />

      {/* Settings Modal */}
      <SettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        settings={settings}
        onSaveSettings={updateSettings}
        onClearAllData={handleClearAllData}
      />
    </div>
  );
}
