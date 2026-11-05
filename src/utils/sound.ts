/**
 * Web Audio API synthesizer for crisp, soothing chimes and haptic feedback.
 * Works offline, zero external file dependencies, no CORS/codec issues.
 */

let audioCtx: AudioContext | null = null;

function getAudioContext(): AudioContext | null {
  if (typeof window === 'undefined') return null;
  if (!audioCtx) {
    const AudioContextClass = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    if (AudioContextClass) {
      audioCtx = new AudioContextClass();
    }
  }
  if (audioCtx && audioCtx.state === 'suspended') {
    audioCtx.resume();
  }
  return audioCtx;
}

export function playSessionCompleteSound(enabled: boolean = true) {
  if (!enabled) return;
  const ctx = getAudioContext();
  if (!ctx) return;

  const now = ctx.currentTime;
  // A warm, rich Zen bell chord: 528Hz (Root), 792Hz (Fifth), 1056Hz (Octave)
  const freqs = [528, 792, 1056];

  freqs.forEach((freq, idx) => {
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(freq, now + idx * 0.08);

    gain.gain.setValueAtTime(0.001, now);
    gain.gain.exponentialRampToValueAtTime(0.18 / (idx + 1), now + idx * 0.08 + 0.02);
    gain.gain.exponentialRampToValueAtTime(0.0001, now + 1.8 + idx * 0.2);

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.start(now + idx * 0.08);
    osc.stop(now + 2.2);
  });

  triggerVibrate([100, 50, 100]);
}

export function playBreakCompleteSound(enabled: boolean = true) {
  if (!enabled) return;
  const ctx = getAudioContext();
  if (!ctx) return;

  const now = ctx.currentTime;
  // Upbeat, energized ascending chime
  const notes = [440, 554.37, 659.25, 880]; // A4, C#5, E5, A5

  notes.forEach((freq, idx) => {
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = 'triangle';
    osc.frequency.setValueAtTime(freq, now + idx * 0.12);

    gain.gain.setValueAtTime(0.001, now + idx * 0.12);
    gain.gain.exponentialRampToValueAtTime(0.15, now + idx * 0.12 + 0.02);
    gain.gain.exponentialRampToValueAtTime(0.0001, now + idx * 0.12 + 0.8);

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.start(now + idx * 0.12);
    osc.stop(now + idx * 0.12 + 0.85);
  });

  triggerVibrate([80, 40, 80]);
}

export function playButtonTapSound(enabled: boolean = true) {
  if (!enabled) return;
  const ctx = getAudioContext();
  if (!ctx) return;

  const now = ctx.currentTime;
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();

  osc.type = 'sine';
  osc.frequency.setValueAtTime(600, now);
  osc.frequency.exponentialRampToValueAtTime(200, now + 0.04);

  gain.gain.setValueAtTime(0.04, now);
  gain.gain.exponentialRampToValueAtTime(0.001, now + 0.04);

  osc.connect(gain);
  gain.connect(ctx.destination);

  osc.start(now);
  osc.stop(now + 0.05);
}

export function triggerVibrate(pattern: number | number[] = 50) {
  if (typeof window !== 'undefined' && 'navigator' in window && 'vibrate' in navigator) {
    try {
      navigator.vibrate(pattern);
    } catch {
      // ignore
    }
  }
}
