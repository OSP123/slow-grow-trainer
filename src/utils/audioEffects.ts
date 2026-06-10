/**
 * audioEffects.ts — Web Audio API synthesized sound effects
 * Grimdark bunker terminal aesthetic sounds for the Warhammer 40k campaign tracker.
 * All sounds are generated via OscillatorNode — no external audio files needed.
 */

let audioCtx: AudioContext | null = null;

function getAudioContext(): AudioContext {
  if (!audioCtx) {
    audioCtx = new AudioContext();
  }
  return audioCtx;
}

// Ensure the AudioContext is resumed upon the first user interaction
function initAudio() {
  const ctx = getAudioContext();
  if (ctx.state === 'suspended') {
    ctx.resume();
  }
  document.removeEventListener('click', initAudio);
  document.removeEventListener('keydown', initAudio);
}

if (typeof window !== 'undefined') {
  document.addEventListener('click', initAudio);
  document.addEventListener('keydown', initAudio);
}

const SOUND_STORAGE_KEY = 'soundEnabled';

export function setSoundEnabled(enabled: boolean): void {
  localStorage.setItem(SOUND_STORAGE_KEY, JSON.stringify(enabled));
}

export function isSoundEnabled(): boolean {
  const stored = localStorage.getItem(SOUND_STORAGE_KEY);
  if (stored === null) return true; // default: enabled
  try {
    return JSON.parse(stored) === true;
  } catch {
    return true;
  }
}

/**
 * A short, crisp mechanical click — heavy industrial relay switch.
 * ~40ms oscillator with frequency sweep from ~800Hz down to ~200Hz, gain 0.10.
 */
export function playClickSound(): void {
  if (!isSoundEnabled()) return;
  try {
    const ctx = getAudioContext();
    const now = ctx.currentTime;

    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = 'square';
    osc.frequency.setValueAtTime(800, now);
    osc.frequency.exponentialRampToValueAtTime(200, now + 0.04);

    gain.gain.setValueAtTime(0.10, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.04);

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.start(now);
    osc.stop(now + 0.05);
  } catch {
    // Silently fail if audio isn't available
  }
}

/**
 * An extremely subtle, quiet tick for hover events.
 * ~15ms burst at ~600Hz, gain 0.04.
 */
export function playHoverSound(): void {
  if (!isSoundEnabled()) return;
  try {
    const ctx = getAudioContext();
    const now = ctx.currentTime;

    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(600, now);

    gain.gain.setValueAtTime(0.04, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.015);

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.start(now);
    osc.stop(now + 0.02);
  } catch {
    // Silently fail
  }
}

/**
 * A two-tone ascending beep for successful actions.
 * Two quick oscillator tones (~400Hz then ~600Hz), each ~60ms, gain 0.08.
 */
export function playSuccessSound(): void {
  if (!isSoundEnabled()) return;
  try {
    const ctx = getAudioContext();
    const now = ctx.currentTime;

    // First tone: 400Hz
    const osc1 = ctx.createOscillator();
    const gain1 = ctx.createGain();
    osc1.type = 'sine';
    osc1.frequency.setValueAtTime(400, now);
    gain1.gain.setValueAtTime(0.08, now);
    gain1.gain.exponentialRampToValueAtTime(0.001, now + 0.06);
    osc1.connect(gain1);
    gain1.connect(ctx.destination);
    osc1.start(now);
    osc1.stop(now + 0.07);

    // Second tone: 600Hz (starts after first)
    const osc2 = ctx.createOscillator();
    const gain2 = ctx.createGain();
    osc2.type = 'sine';
    osc2.frequency.setValueAtTime(600, now + 0.08);
    gain2.gain.setValueAtTime(0.001, now);
    gain2.gain.setValueAtTime(0.08, now + 0.08);
    gain2.gain.exponentialRampToValueAtTime(0.001, now + 0.14);
    osc2.connect(gain2);
    gain2.connect(ctx.destination);
    osc2.start(now + 0.08);
    osc2.stop(now + 0.15);
  } catch {
    // Silently fail
  }
}

/**
 * A low descending buzz for errors.
 * ~100ms tone sweeping from ~400Hz to ~200Hz, gain 0.10.
 */
export function playErrorSound(): void {
  if (!isSoundEnabled()) return;
  try {
    const ctx = getAudioContext();
    const now = ctx.currentTime;

    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(400, now);
    osc.frequency.exponentialRampToValueAtTime(200, now + 0.1);

    gain.gain.setValueAtTime(0.10, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.1);

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.start(now);
    osc.stop(now + 0.12);
  } catch {
    // Silently fail
  }
}
