import { useState, useEffect, useRef, useCallback } from 'react';
import { TimerMode, UserSettings } from '../types';
import { playSessionCompleteSound, playBreakCompleteSound } from '../utils/sound';

interface UseTimerProps {
  settings: UserSettings;
  onPomodoroComplete: (durationMinutes: number) => void;
}

export function useTimer({ settings, onPomodoroComplete }: UseTimerProps) {
  const [mode, setModeState] = useState<TimerMode>('focus');
  const [isRunning, setIsRunning] = useState<boolean>(false);
  const [cycleCount, setCycleCount] = useState<number>(0);

  // Helper to get total seconds for a given mode
  const getDurationForMode = useCallback(
    (m: TimerMode): number => {
      switch (m) {
        case 'focus':
          return settings.focusDuration * 60;
        case 'shortBreak':
          return settings.shortBreakDuration * 60;
        case 'longBreak':
          return settings.longBreakDuration * 60;
      }
    },
    [settings]
  );

  const [totalTime, setTotalTime] = useState<number>(() => getDurationForMode('focus'));
  const [timeLeft, setTimeLeft] = useState<number>(() => getDurationForMode('focus'));

  // Sync with settings updates if timer is paused
  useEffect(() => {
    if (!isRunning) {
      const newDuration = getDurationForMode(mode);
      setTotalTime(newDuration);
      setTimeLeft(newDuration);
    }
  }, [settings, mode, isRunning, getDurationForMode]);

  const targetEndTimeRef = useRef<number | null>(null);

  // Switch mode manually
  const switchMode = useCallback(
    (newMode: TimerMode) => {
      setIsRunning(false);
      setModeState(newMode);
      const dur = getDurationForMode(newMode);
      setTotalTime(dur);
      setTimeLeft(dur);
      targetEndTimeRef.current = null;
    },
    [getDurationForMode]
  );

  // Timer Tick implementation using timestamp delta for background tab / sleep tolerance
  useEffect(() => {
    if (!isRunning) {
      targetEndTimeRef.current = null;
      return;
    }

    if (!targetEndTimeRef.current) {
      targetEndTimeRef.current = Date.now() + timeLeft * 1000;
    }

    const interval = setInterval(() => {
      if (!targetEndTimeRef.current) return;
      const remainingMs = targetEndTimeRef.current - Date.now();
      const nextSeconds = Math.max(0, Math.ceil(remainingMs / 1000));

      if (nextSeconds <= 0) {
        // Timer completed!
        clearInterval(interval);
        targetEndTimeRef.current = null;

        if (mode === 'focus') {
          playSessionCompleteSound(settings.soundEnabled);
          const nextCycle = cycleCount + 1;
          setCycleCount(nextCycle);
          onPomodoroComplete(settings.focusDuration);

          const isLongBreak = nextCycle % settings.longBreakInterval === 0;
          const nextMode: TimerMode = isLongBreak ? 'longBreak' : 'shortBreak';
          setModeState(nextMode);
          const nextDur = getDurationForMode(nextMode);
          setTotalTime(nextDur);
          setTimeLeft(nextDur);

          if (settings.autoStartBreaks) {
            targetEndTimeRef.current = Date.now() + nextDur * 1000;
            setIsRunning(true);
          } else {
            setIsRunning(false);
          }
        } else {
          // Break finished
          playBreakCompleteSound(settings.soundEnabled);
          setModeState('focus');
          const nextDur = getDurationForMode('focus');
          setTotalTime(nextDur);
          setTimeLeft(nextDur);

          if (settings.autoStartFocus) {
            targetEndTimeRef.current = Date.now() + nextDur * 1000;
            setIsRunning(true);
          } else {
            setIsRunning(false);
          }
        }
      } else {
        setTimeLeft(nextSeconds);
      }
    }, 250);

    return () => clearInterval(interval);
  }, [
    isRunning,
    timeLeft,
    mode,
    cycleCount,
    settings,
    getDurationForMode,
    onPomodoroComplete,
  ]);

  const start = useCallback(() => {
    targetEndTimeRef.current = Date.now() + timeLeft * 1000;
    setIsRunning(true);
  }, [timeLeft]);

  const pause = useCallback(() => {
    targetEndTimeRef.current = null;
    setIsRunning(false);
  }, []);

  const reset = useCallback(() => {
    targetEndTimeRef.current = null;
    setIsRunning(false);
    const dur = getDurationForMode(mode);
    setTotalTime(dur);
    setTimeLeft(dur);
  }, [mode, getDurationForMode]);

  const skip = useCallback(() => {
    targetEndTimeRef.current = null;
    setIsRunning(false);

    if (mode === 'focus') {
      const isLongBreak = (cycleCount + 1) % settings.longBreakInterval === 0;
      const nextMode: TimerMode = isLongBreak ? 'longBreak' : 'shortBreak';
      setModeState(nextMode);
      const nextDur = getDurationForMode(nextMode);
      setTotalTime(nextDur);
      setTimeLeft(nextDur);
    } else {
      setModeState('focus');
      const nextDur = getDurationForMode('focus');
      setTotalTime(nextDur);
      setTimeLeft(nextDur);
    }
  }, [mode, cycleCount, settings.longBreakInterval, getDurationForMode]);

  const adjustTime = useCallback((deltaSeconds: number) => {
    setTimeLeft((prev) => {
      const updated = Math.max(10, prev + deltaSeconds);
      if (targetEndTimeRef.current) {
        targetEndTimeRef.current = Date.now() + updated * 1000;
      }
      return updated;
    });
  }, []);

  return {
    mode,
    isRunning,
    timeLeft,
    totalTime,
    cycleCount,
    start,
    pause,
    reset,
    skip,
    switchMode,
    adjustTime,
  };
}
