// SoundManager - Handles all audio for Vibrant Mode using Web Audio API
// Creates synthesized sounds without external audio files

export class SoundManager {
  private audioContext: AudioContext | null = null;
  private masterGain: GainNode | null = null;
  private ambientOscillator: OscillatorNode | null = null;
  private isEnabled: boolean = true;

  constructor() {
    try {
      this.audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
      this.masterGain = this.audioContext.createGain();
      this.masterGain.gain.value = 0.3; // Master volume
      this.masterGain.connect(this.audioContext.destination);
    } catch (e) {
      console.warn('Web Audio API not supported', e);
      this.isEnabled = false;
    }
  }

  // Play ambient background drone
  playAmbient() {
    if (!this.isEnabled || !this.audioContext || !this.masterGain) return;

    // Create a soft ambient drone with multiple oscillators
    const drone1 = this.audioContext.createOscillator();
    const drone2 = this.audioContext.createOscillator();
    const droneGain = this.audioContext.createGain();

    drone1.type = 'sine';
    drone1.frequency.value = 110; // A2
    drone2.type = 'sine';
    drone2.frequency.value = 165; // E3

    droneGain.gain.value = 0.05; // Very subtle

    drone1.connect(droneGain);
    drone2.connect(droneGain);
    droneGain.connect(this.masterGain);

    drone1.start();
    drone2.start();

    this.ambientOscillator = drone1;
  }

  // Click/Button sound
  playClick() {
    if (!this.isEnabled || !this.audioContext || !this.masterGain) return;

    const osc = this.audioContext.createOscillator();
    const gain = this.audioContext.createGain();

    osc.type = 'sine';
    osc.frequency.value = 800;

    gain.gain.setValueAtTime(0.2, this.audioContext.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.01, this.audioContext.currentTime + 0.1);

    osc.connect(gain);
    gain.connect(this.masterGain);

    osc.start();
    osc.stop(this.audioContext.currentTime + 0.1);
  }

  // Hover sound
  playHover() {
    if (!this.isEnabled || !this.audioContext || !this.masterGain) return;

    const osc = this.audioContext.createOscillator();
    const gain = this.audioContext.createGain();

    osc.type = 'sine';
    osc.frequency.value = 600;

    gain.gain.setValueAtTime(0.1, this.audioContext.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.01, this.audioContext.currentTime + 0.05);

    osc.connect(gain);
    gain.connect(this.masterGain);

    osc.start();
    osc.stop(this.audioContext.currentTime + 0.05);
  }

  // Start competition sound
  playStart() {
    if (!this.isEnabled || !this.audioContext || !this.masterGain) return;

    const now = this.audioContext.currentTime;

    // Ascending arpeggio
    [0, 0.1, 0.2].forEach((time, i) => {
      const osc = this.audioContext!.createOscillator();
      const gain = this.audioContext!.createGain();

      osc.type = 'square';
      osc.frequency.value = 440 * Math.pow(2, i * 4 / 12); // Major third intervals

      gain.gain.setValueAtTime(0.3, now + time);
      gain.gain.exponentialRampToValueAtTime(0.01, now + time + 0.2);

      osc.connect(gain);
      gain.connect(this.masterGain!);

      osc.start(now + time);
      osc.stop(now + time + 0.2);
    });
  }

  // Variant complete sound
  playVariantComplete() {
    if (!this.isEnabled || !this.audioContext || !this.masterGain) return;

    const osc = this.audioContext.createOscillator();
    const gain = this.audioContext.createGain();

    osc.type = 'triangle';
    osc.frequency.setValueAtTime(880, this.audioContext.currentTime);
    osc.frequency.exponentialRampToValueAtTime(440, this.audioContext.currentTime + 0.2);

    gain.gain.setValueAtTime(0.2, this.audioContext.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.01, this.audioContext.currentTime + 0.2);

    osc.connect(gain);
    gain.connect(this.masterGain);

    osc.start();
    osc.stop(this.audioContext.currentTime + 0.2);
  }

  // Score received sound
  playScore() {
    if (!this.isEnabled || !this.audioContext || !this.masterGain) return;

    const now = this.audioContext.currentTime;
    const osc = this.audioContext.createOscillator();
    const gain = this.audioContext.createGain();

    osc.type = 'sawtooth';
    osc.frequency.value = 1320; // E6

    gain.gain.setValueAtTime(0.15, now);
    gain.gain.exponentialRampToValueAtTime(0.01, now + 0.15);

    osc.connect(gain);
    gain.connect(this.masterGain);

    osc.start();
    osc.stop(now + 0.15);
  }

  // Victory fanfare
  playVictory() {
    if (!this.isEnabled || !this.audioContext || !this.masterGain) return;

    const now = this.audioContext.currentTime;

    // Victory melody: C-E-G-C ascending
    const melody = [
      { freq: 523, time: 0 },     // C5
      { freq: 659, time: 0.15 },  // E5
      { freq: 784, time: 0.3 },   // G5
      { freq: 1047, time: 0.45 }  // C6
    ];

    melody.forEach(({ freq, time }) => {
      const osc = this.audioContext!.createOscillator();
      const gain = this.audioContext!.createGain();

      osc.type = 'square';
      osc.frequency.value = freq;

      gain.gain.setValueAtTime(0.25, now + time);
      gain.gain.exponentialRampToValueAtTime(0.01, now + time + 0.3);

      osc.connect(gain);
      gain.connect(this.masterGain!);

      osc.start(now + time);
      osc.stop(now + time + 0.3);
    });
  }

  // Error sound
  playError() {
    if (!this.isEnabled || !this.audioContext || !this.masterGain) return;

    const now = this.audioContext.currentTime;
    const osc = this.audioContext.createOscillator();
    const gain = this.audioContext.createGain();

    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(200, now);
    osc.frequency.exponentialRampToValueAtTime(100, now + 0.2);

    gain.gain.setValueAtTime(0.2, now);
    gain.gain.exponentialRampToValueAtTime(0.01, now + 0.2);

    osc.connect(gain);
    gain.connect(this.masterGain);

    osc.start();
    osc.stop(now + 0.2);
  }

  // Cleanup
  cleanup() {
    if (this.ambientOscillator) {
      this.ambientOscillator.stop();
      this.ambientOscillator = null;
    }
    if (this.audioContext) {
      this.audioContext.close();
      this.audioContext = null;
    }
  }

  // Toggle sound on/off
  toggleSound() {
    this.isEnabled = !this.isEnabled;
    return this.isEnabled;
  }
}
