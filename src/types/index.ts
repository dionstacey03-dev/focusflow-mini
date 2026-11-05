export type TimerMode = 'focus' | 'shortBreak' | 'longBreak';

export type Priority = 'low' | 'medium' | 'high';

export interface Task {
  id: string;
  title: string;
  completed: boolean;
  priority: Priority;
  estimatedPomodoros: number;
  completedPomodoros: number;
  createdAt: string;
  completedAt?: string;
}

export interface DailyLog {
  date: string; // YYYY-MM-DD
  completedPomodoros: number;
  focusMinutes: number;
  completedTaskIds: string[];
}

export interface UserSettings {
  focusDuration: number; // in minutes (default 25)
  shortBreakDuration: number; // in minutes (default 5)
  longBreakDuration: number; // in minutes (default 15)
  longBreakInterval: number; // every 4 pomodoros
  dailyGoalPomodoros: number; // default 8 (approx 3.3 hours of deep work)
  soundEnabled: boolean;
  autoStartBreaks: boolean;
  autoStartFocus: boolean;
}

export type ActiveTab = 'timer' | 'tasks' | 'progress' | 'settings';
