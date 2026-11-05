import { Task, DailyLog, UserSettings } from '../types';

const TASKS_KEY = 'focusflow_tasks';
const DAILY_LOGS_KEY = 'focusflow_daily_logs';
const SETTINGS_KEY = 'focusflow_settings';
const ACTIVE_TASK_KEY = 'focusflow_active_task_id';

export const DEFAULT_SETTINGS: UserSettings = {
  focusDuration: 25,
  shortBreakDuration: 5,
  longBreakDuration: 15,
  longBreakInterval: 4,
  dailyGoalPomodoros: 8,
  soundEnabled: true,
  autoStartBreaks: false,
  autoStartFocus: false,
};

export function getTodayDateString(): string {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

export function formatFriendlyDate(dateStr: string): string {
  const [year, month, day] = dateStr.split('-').map(Number);
  const date = new Date(year, month - 1, day);
  const today = new Date();
  
  if (
    date.getDate() === today.getDate() &&
    date.getMonth() === today.getMonth() &&
    date.getFullYear() === today.getFullYear()
  ) {
    return 'Today, ' + date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  }

  const yesterday = new Date();
  yesterday.setDate(today.getDate() - 1);
  if (
    date.getDate() === yesterday.getDate() &&
    date.getMonth() === yesterday.getMonth() &&
    date.getFullYear() === yesterday.getFullYear()
  ) {
    return 'Yesterday, ' + date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  }

  return date.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });
}

export function formatMinutes(totalMinutes: number): string {
  if (totalMinutes < 60) {
    return `${totalMinutes}m`;
  }
  const hours = Math.floor(totalMinutes / 60);
  const mins = totalMinutes % 60;
  return mins > 0 ? `${hours}h ${mins}m` : `${hours}h`;
}

const INITIAL_TASKS: Task[] = [
  {
    id: 'initial-task-1',
    title: 'Review weekly goals and priorities',
    completed: true,
    priority: 'high',
    estimatedPomodoros: 2,
    completedPomodoros: 2,
    createdAt: new Date(Date.now() - 3600000 * 3).toISOString(),
    completedAt: new Date(Date.now() - 3600000 * 2).toISOString(),
  },
  {
    id: 'initial-task-2',
    title: 'Execute deep work session on project deliverable',
    completed: false,
    priority: 'high',
    estimatedPomodoros: 3,
    completedPomodoros: 1,
    createdAt: new Date(Date.now() - 3600000 * 2).toISOString(),
  },
  {
    id: 'initial-task-3',
    title: 'Organize notes & clear inbox',
    completed: false,
    priority: 'medium',
    estimatedPomodoros: 1,
    completedPomodoros: 0,
    createdAt: new Date(Date.now() - 3600000 * 1).toISOString(),
  },
];

export function loadTasks(): Task[] {
  try {
    const raw = localStorage.getItem(TASKS_KEY);
    if (!raw) {
      saveTasks(INITIAL_TASKS);
      return INITIAL_TASKS;
    }
    return JSON.parse(raw);
  } catch (err) {
    console.error('Failed to load tasks from localStorage', err);
    return INITIAL_TASKS;
  }
}

export function saveTasks(tasks: Task[]): void {
  try {
    localStorage.setItem(TASKS_KEY, JSON.stringify(tasks));
  } catch (err) {
    console.error('Failed to save tasks to localStorage', err);
  }
}

export function loadDailyLogs(): Record<string, DailyLog> {
  try {
    const raw = localStorage.getItem(DAILY_LOGS_KEY);
    const today = getTodayDateString();
    let logs: Record<string, DailyLog> = raw ? JSON.parse(raw) : {};

    // Ensure today's log exists
    if (!logs[today]) {
      logs[today] = {
        date: today,
        completedPomodoros: 3, // seeded with baseline progress matching initial tasks
        focusMinutes: 75,
        completedTaskIds: ['initial-task-1'],
      };
      saveDailyLogs(logs);
    }
    return logs;
  } catch (err) {
    console.error('Failed to load daily logs from localStorage', err);
    return {};
  }
}

export function saveDailyLogs(logs: Record<string, DailyLog>): void {
  try {
    localStorage.setItem(DAILY_LOGS_KEY, JSON.stringify(logs));
  } catch (err) {
    console.error('Failed to save daily logs to localStorage', err);
  }
}

export function recordCompletedPomodoro(durationMinutes: number, activeTaskId?: string | null): {
  logs: Record<string, DailyLog>;
  todayLog: DailyLog;
} {
  const logs = loadDailyLogs();
  const today = getTodayDateString();

  if (!logs[today]) {
    logs[today] = {
      date: today,
      completedPomodoros: 0,
      focusMinutes: 0,
      completedTaskIds: [],
    };
  }

  logs[today].completedPomodoros += 1;
  logs[today].focusMinutes += durationMinutes;

  saveDailyLogs(logs);
  return { logs, todayLog: logs[today] };
}

export function recordCompletedTaskInDailyLog(taskId: string): void {
  const logs = loadDailyLogs();
  const today = getTodayDateString();

  if (!logs[today]) {
    logs[today] = {
      date: today,
      completedPomodoros: 0,
      focusMinutes: 0,
      completedTaskIds: [],
    };
  }

  if (!logs[today].completedTaskIds.includes(taskId)) {
    logs[today].completedTaskIds.push(taskId);
    saveDailyLogs(logs);
  }
}

export function recordUncompletedTaskInDailyLog(taskId: string): void {
  const logs = loadDailyLogs();
  const today = getTodayDateString();

  if (logs[today]) {
    logs[today].completedTaskIds = logs[today].completedTaskIds.filter((id) => id !== taskId);
    saveDailyLogs(logs);
  }
}

export function loadSettings(): UserSettings {
  try {
    const raw = localStorage.getItem(SETTINGS_KEY);
    if (!raw) return DEFAULT_SETTINGS;
    return { ...DEFAULT_SETTINGS, ...JSON.parse(raw) };
  } catch (err) {
    console.error('Failed to load settings from localStorage', err);
    return DEFAULT_SETTINGS;
  }
}

export function saveSettings(settings: UserSettings): void {
  try {
    localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));
  } catch (err) {
    console.error('Failed to save settings to localStorage', err);
  }
}

export function loadActiveTaskId(): string | null {
  try {
    return localStorage.getItem(ACTIVE_TASK_KEY);
  } catch {
    return null;
  }
}

export function saveActiveTaskId(id: string | null): void {
  try {
    if (id) {
      localStorage.setItem(ACTIVE_TASK_KEY, id);
    } else {
      localStorage.removeItem(ACTIVE_TASK_KEY);
    }
  } catch {
    // ignore
  }
}
