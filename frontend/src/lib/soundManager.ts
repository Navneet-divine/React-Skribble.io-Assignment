import { useSoundStore } from '../store/soundStore';

/**
 * High-performance Web Audio API Sound Engine for DoodleSync.
 * Zero external audio assets required — pure mathematical synthesis with zero latency.
 */
class SoundEngine {
  private ctx: AudioContext | null = null;
  private lastTickedSecond = -1;

  private getAudioContext(): AudioContext | null {
    if (typeof window === 'undefined') return null;

    if (!this.ctx) {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      if (AudioCtx) {
        this.ctx = new AudioCtx();
      }
    }

    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume().catch(() => {});
    }

    return this.ctx;
  }

  private isMuted(): boolean {
    return useSoundStore.getState().isMuted;
  }

  /**
   * Game / Match Start Fanfare Chime
   * Ascending bright arpeggio (C5 -> E5 -> G5 -> C6)
   */
  public playGameStart() {
    if (this.isMuted()) return;
    const ctx = this.getAudioContext();
    if (!ctx) return;

    const notes = [523.25, 659.25, 783.99, 1046.5]; // C5, E5, G5, C6
    const startTime = ctx.currentTime + 0.05;

    notes.forEach((freq, i) => {
      const noteTime = startTime + i * 0.1;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'triangle';
      osc.frequency.setValueAtTime(freq, noteTime);

      // Volume envelope
      gain.gain.setValueAtTime(0, noteTime);
      gain.gain.linearRampToValueAtTime(0.2, noteTime + 0.02);
      gain.gain.exponentialRampToValueAtTime(0.001, noteTime + 0.25);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start(noteTime);
      osc.stop(noteTime + 0.26);
    });
  }

  /**
   * Watch Timer Urgency Tick (Final 10 seconds of turn)
   * Crisp mechanical clock tick-tock with increased pitch & urgency on final 3 seconds.
   */
  public playTimerTick(secondsLeft: number) {
    if (this.isMuted()) return;
    if (secondsLeft <= 0 || secondsLeft > 10) return;

    // Guard against multi-tick calls within the same second
    if (this.lastTickedSecond === secondsLeft) return;
    this.lastTickedSecond = secondsLeft;

    const ctx = this.getAudioContext();
    if (!ctx) return;

    const now = ctx.currentTime;
    const isUrgent = secondsLeft <= 3;

    // Primary tick transient oscillator
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    // Alternate frequency slightly to produce realistic tick-tock rhythm
    const baseFreq = secondsLeft % 2 === 0 ? 1200 : 900;
    const tickFreq = isUrgent ? baseFreq * 1.35 : baseFreq;

    osc.type = 'sine';
    osc.frequency.setValueAtTime(tickFreq, now);
    osc.frequency.exponentialRampToValueAtTime(150, now + 0.045);

    // Snappy percussive envelope
    gain.gain.setValueAtTime(0, now);
    gain.gain.linearRampToValueAtTime(isUrgent ? 0.28 : 0.18, now + 0.003);
    gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.05);

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.start(now);
    osc.stop(now + 0.055);

    // If final 3 seconds, add urgent double click
    if (isUrgent) {
      const osc2 = ctx.createOscillator();
      const gain2 = ctx.createGain();
      const delay = 0.08;

      osc2.type = 'triangle';
      osc2.frequency.setValueAtTime(tickFreq * 1.2, now + delay);
      osc2.frequency.exponentialRampToValueAtTime(300, now + delay + 0.035);

      gain2.gain.setValueAtTime(0, now + delay);
      gain2.gain.linearRampToValueAtTime(0.2, now + delay + 0.003);
      gain2.gain.exponentialRampToValueAtTime(0.0001, now + delay + 0.04);

      osc2.connect(gain2);
      gain2.connect(ctx.destination);

      osc2.start(now + delay);
      osc2.stop(now + delay + 0.045);
    }
  }

  /**
   * Reset the timer tick memory when turn restarts
   */
  public resetTimerTick() {
    this.lastTickedSecond = -1;
  }

  /**
   * Correct Guess Sparkle Chime
   * Cheerful high ascending sparkle arpeggio (G5, B5, D6, G6)
   */
  public playCorrectGuess() {
    if (this.isMuted()) return;
    const ctx = this.getAudioContext();
    if (!ctx) return;

    const notes = [783.99, 987.77, 1174.66, 1567.98]; // G5, B5, D6, G6
    const now = ctx.currentTime;

    notes.forEach((freq, idx) => {
      const noteTime = now + idx * 0.07;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, noteTime);

      gain.gain.setValueAtTime(0, noteTime);
      gain.gain.linearRampToValueAtTime(0.22, noteTime + 0.015);
      gain.gain.exponentialRampToValueAtTime(0.001, noteTime + 0.32);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start(noteTime);
      osc.stop(noteTime + 0.33);
    });
  }

  /**
   * "Your Turn to Draw!" Notification Bell
   * Friendly two-tone bell chime
   */
  public playYourTurn() {
    if (this.isMuted()) return;
    const ctx = this.getAudioContext();
    if (!ctx) return;

    const now = ctx.currentTime;
    const notes = [698.46, 880.0]; // F5, A5

    notes.forEach((freq, idx) => {
      const noteTime = now + idx * 0.12;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'triangle';
      osc.frequency.setValueAtTime(freq, noteTime);

      gain.gain.setValueAtTime(0, noteTime);
      gain.gain.linearRampToValueAtTime(0.25, noteTime + 0.02);
      gain.gain.exponentialRampToValueAtTime(0.001, noteTime + 0.4);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start(noteTime);
      osc.stop(noteTime + 0.42);
    });
  }

  /**
   * Round / Turn Concluded Chime
   */
  public playTurnEnd() {
    if (this.isMuted()) return;
    const ctx = this.getAudioContext();
    if (!ctx) return;

    const now = ctx.currentTime;
    const notes = [783.99, 659.25, 523.25]; // G5, E5, C5 descending

    notes.forEach((freq, idx) => {
      const noteTime = now + idx * 0.09;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, noteTime);

      gain.gain.setValueAtTime(0, noteTime);
      gain.gain.linearRampToValueAtTime(0.18, noteTime + 0.02);
      gain.gain.exponentialRampToValueAtTime(0.001, noteTime + 0.28);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start(noteTime);
      osc.stop(noteTime + 0.3);
    });
  }

  /**
   * Player Departure Notification Sound
   * Subtle descending two-tone pop (E4 -> C4)
   */
  public playPlayerLeave() {
    if (this.isMuted()) return;
    const ctx = this.getAudioContext();
    if (!ctx) return;

    const now = ctx.currentTime;
    const notes = [329.63, 261.63]; // E4 -> C4

    notes.forEach((freq, idx) => {
      const noteTime = now + idx * 0.08;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, noteTime);

      gain.gain.setValueAtTime(0, noteTime);
      gain.gain.linearRampToValueAtTime(0.18, noteTime + 0.015);
      gain.gain.exponentialRampToValueAtTime(0.001, noteTime + 0.2);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start(noteTime);
      osc.stop(noteTime + 0.22);
    });
  }

  /**
   * Player Arrival / Join Notification Sound
   * Friendly, cheerful ascending pop (G4 -> C5)
   */
  public playPlayerJoin() {
    if (this.isMuted()) return;
    const ctx = this.getAudioContext();
    if (!ctx) return;

    const now = ctx.currentTime;
    const notes = [392.0, 523.25]; // G4 -> C5

    notes.forEach((freq, idx) => {
      const noteTime = now + idx * 0.07;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, noteTime);

      gain.gain.setValueAtTime(0, noteTime);
      gain.gain.linearRampToValueAtTime(0.18, noteTime + 0.015);
      gain.gain.exponentialRampToValueAtTime(0.001, noteTime + 0.18);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start(noteTime);
      osc.stop(noteTime + 0.2);
    });
  }
}

export const soundManager = new SoundEngine();
