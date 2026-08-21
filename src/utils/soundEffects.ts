/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

// Web Audio API synthesized sound effects
// Reliable, zero-dependency, works in all modern browsers and iframe environments

let audioCtx: AudioContext | null = null;

function getAudioContext(): AudioContext | null {
  if (typeof window === 'undefined') return null;
  try {
    const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
    if (!audioCtx && AudioContextClass) {
      audioCtx = new AudioContextClass();
    }
    if (audioCtx && audioCtx.state === 'suspended') {
      audioCtx.resume();
    }
    return audioCtx;
  } catch (err) {
    console.warn('AudioContext not supported or blocked:', err);
    return null;
  }
}

/**
 * Play a pleasant acoustic chime for new appointments
 */
export function playAppointmentScheduledSound() {
  try {
    const ctx = getAudioContext();
    if (!ctx) return;

    const now = ctx.currentTime;
    
    // Notes: C5 (523.25Hz) -> E5 (659.25Hz) -> G5 (783.99Hz) -> C6 (1046.50Hz)
    const freqs = [523.25, 659.25, 783.99, 1046.50];
    freqs.forEach((freq, idx) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, now + idx * 0.08);

      gain.gain.setValueAtTime(0.001, now + idx * 0.08);
      gain.gain.exponentialRampToValueAtTime(0.18, now + idx * 0.08 + 0.02);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + idx * 0.08 + 0.35);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start(now + idx * 0.08);
      osc.stop(now + idx * 0.08 + 0.4);
    });
  } catch (e) {
    console.error('Audio error:', e);
  }
}

/**
 * Play a swift dispatch sound when comanda is sent from barber chair to cashier
 */
export function playComandaDispatchedSound() {
  try {
    const ctx = getAudioContext();
    if (!ctx) return;

    const now = ctx.currentTime;

    // Two tone ascending chime (D5 -> A5)
    const freqs = [587.33, 880.00];
    freqs.forEach((freq, idx) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'triangle';
      osc.frequency.setValueAtTime(freq, now + idx * 0.1);

      gain.gain.setValueAtTime(0.001, now + idx * 0.1);
      gain.gain.exponentialRampToValueAtTime(0.15, now + idx * 0.1 + 0.02);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + idx * 0.1 + 0.3);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start(now + idx * 0.1);
      osc.stop(now + idx * 0.1 + 0.35);
    });
  } catch (e) {
    console.error('Audio error:', e);
  }
}

/**
 * Play a successful register / payment checkout sound when comanda is finalized
 */
export function playComandaPaidSound() {
  try {
    const ctx = getAudioContext();
    if (!ctx) return;

    const now = ctx.currentTime;

    // Cash register bell harmonics (E5 -> G#5 -> B5 -> E6)
    const freqs = [659.25, 830.61, 987.77, 1318.51];
    freqs.forEach((freq, idx) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, now + idx * 0.07);

      gain.gain.setValueAtTime(0.001, now + idx * 0.07);
      gain.gain.exponentialRampToValueAtTime(0.2, now + idx * 0.07 + 0.015);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + idx * 0.07 + 0.5);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start(now + idx * 0.07);
      osc.stop(now + idx * 0.07 + 0.55);
    });
  } catch (e) {
    console.error('Audio error:', e);
  }
}

/**
 * Play celebratory fanfare when a VIP subscription is activated
 */
export function playSubscriptionActivatedSound() {
  try {
    const ctx = getAudioContext();
    if (!ctx) return;

    const now = ctx.currentTime;

    const notes = [
      { freq: 523.25, time: 0, dur: 0.15 },    // C5
      { freq: 659.25, time: 0.12, dur: 0.15 }, // E5
      { freq: 783.99, time: 0.24, dur: 0.18 }, // G5
      { freq: 1046.50, time: 0.40, dur: 0.45 } // C6 (long finish)
    ];

    notes.forEach(({ freq, time, dur }) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, now + time);

      gain.gain.setValueAtTime(0.001, now + time);
      gain.gain.exponentialRampToValueAtTime(0.22, now + time + 0.02);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + time + dur);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start(now + time);
      osc.stop(now + time + dur + 0.05);
    });
  } catch (e) {
    console.error('Audio error:', e);
  }
}
