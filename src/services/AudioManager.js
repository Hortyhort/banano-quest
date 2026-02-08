/**
 * AudioManager - Procedural sound effects using Web Audio API
 * No external audio files needed — everything is synthesized.
 */
export class AudioManager {
  constructor() {
    this.ctx = null;
    this.enabled = true;
    this.musicEnabled = true;
    this.masterVolume = 0.3;
    this.initialized = false;
  }

  init() {
    try {
      this.ctx = new (window.AudioContext || window.webkitAudioContext)();
      this.initialized = true;
    } catch (e) {
      this.initialized = false;
    }
  }

  resume() {
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
  }

  _play(fn) {
    if (!this.initialized || !this.enabled) return;
    this.resume();
    try { fn(); } catch (e) { /* swallow audio errors */ }
  }

  _osc(type, freq, duration, volume = 0.2, detune = 0) {
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = type;
    osc.frequency.value = freq;
    osc.detune.value = detune;
    gain.gain.setValueAtTime(volume * this.masterVolume, this.ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + duration);
    osc.connect(gain);
    gain.connect(this.ctx.destination);
    osc.start();
    osc.stop(this.ctx.currentTime + duration);
  }

  _noise(duration, volume = 0.1) {
    const bufferSize = this.ctx.sampleRate * duration;
    const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      data[i] = Math.random() * 2 - 1;
    }
    const source = this.ctx.createBufferSource();
    source.buffer = buffer;
    const gain = this.ctx.createGain();
    gain.gain.setValueAtTime(volume * this.masterVolume, this.ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + duration);
    source.connect(gain);
    gain.connect(this.ctx.destination);
    source.start();
  }

  playJump() {
    this._play(() => {
      this._osc('sine', 300, 0.15, 0.2);
      this._osc('sine', 500, 0.1, 0.1);
      // Quick ascending sweep
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(250, this.ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(600, this.ctx.currentTime + 0.12);
      gain.gain.setValueAtTime(0.15 * this.masterVolume, this.ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 0.15);
      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start();
      osc.stop(this.ctx.currentTime + 0.15);
    });
  }

  playLand() {
    this._play(() => {
      this._noise(0.08, 0.15);
      this._osc('sine', 80, 0.1, 0.15);
    });
  }

  playCoinCollect(combo = 1) {
    this._play(() => {
      // Pitch rises with combo
      const baseFreq = 800 + Math.min(combo, 10) * 80;
      this._osc('sine', baseFreq, 0.12, 0.2);
      this._osc('sine', baseFreq * 1.5, 0.08, 0.1);
      // Sparkle
      setTimeout(() => {
        if (this.ctx.state === 'running') {
          this._osc('sine', baseFreq * 2, 0.06, 0.08);
        }
      }, 50);
    });
  }

  playEnemyStomp() {
    this._play(() => {
      this._osc('square', 200, 0.15, 0.15);
      this._osc('sine', 400, 0.1, 0.1);
      this._noise(0.05, 0.1);
    });
  }

  playDeath() {
    this._play(() => {
      // Descending sad tone
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(400, this.ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(80, this.ctx.currentTime + 0.5);
      gain.gain.setValueAtTime(0.15 * this.masterVolume, this.ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 0.5);
      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start();
      osc.stop(this.ctx.currentTime + 0.5);

      this._noise(0.2, 0.08);
    });
  }

  playPowerUp() {
    this._play(() => {
      // Ascending arpeggio
      const notes = [523, 659, 784, 1047]; // C5, E5, G5, C6
      notes.forEach((freq, i) => {
        setTimeout(() => {
          if (this.ctx.state === 'running') {
            this._osc('sine', freq, 0.2, 0.15);
          }
        }, i * 60);
      });
    });
  }

  playLevelComplete() {
    this._play(() => {
      // Victory fanfare
      const notes = [523, 659, 784, 1047, 784, 1047]; // C E G C G C
      const durations = [0.15, 0.15, 0.15, 0.3, 0.15, 0.4];
      let offset = 0;
      notes.forEach((freq, i) => {
        setTimeout(() => {
          if (this.ctx.state === 'running') {
            this._osc('sine', freq, durations[i] + 0.1, 0.2);
            this._osc('triangle', freq * 0.5, durations[i] + 0.1, 0.08);
          }
        }, offset * 1000);
        offset += durations[i];
      });
    });
  }

  playButtonClick() {
    this._play(() => {
      this._osc('sine', 600, 0.06, 0.15);
      this._osc('sine', 800, 0.04, 0.1);
    });
  }

  playComboMilestone(comboLevel) {
    this._play(() => {
      const baseFreq = 600 + comboLevel * 100;
      this._osc('sine', baseFreq, 0.2, 0.2);
      this._osc('sine', baseFreq * 1.25, 0.15, 0.15);
      this._osc('sine', baseFreq * 1.5, 0.1, 0.12);
    });
  }

  // --- Background Music ---

  startMusic(world = 'jungle') {
    if (!this.initialized || !this.musicEnabled) return;
    this.stopMusic();
    this.resume();

    this.musicPlaying = true;
    this.musicWorld = world;
    this._scheduleNextBar(0);
  }

  _scheduleNextBar(barIndex) {
    if (!this.musicPlaying || !this.musicEnabled) return;

    const bpm = 120;
    const beatDuration = 60 / bpm;
    const barDuration = beatDuration * 4;
    const now = this.ctx.currentTime;

    const patterns = this._getMusicPattern(this.musicWorld);
    const pattern = patterns[barIndex % patterns.length];

    pattern.forEach(note => {
      const noteTime = now + note.beat * beatDuration;
      this._scheduleMusicNote(note.freq, noteTime, note.dur * beatDuration, note.vol || 0.06, note.type || 'sine');
    });

    this.musicTimer = setTimeout(() => {
      this._scheduleNextBar(barIndex + 1);
    }, barDuration * 1000);
  }

  _scheduleMusicNote(freq, time, duration, volume, type) {
    try {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = type;
      osc.frequency.value = freq;
      gain.gain.setValueAtTime(volume * this.masterVolume, time);
      gain.gain.setValueAtTime(volume * this.masterVolume, time + duration * 0.7);
      gain.gain.exponentialRampToValueAtTime(0.001, time + duration);
      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start(time);
      osc.stop(time + duration);
    } catch { /* ignore */ }
  }

  _getMusicPattern(world) {
    // Simple 4-beat bar patterns — pentatonic melodies
    if (world === 'cave') {
      return [
        [
          { beat: 0, freq: 220, dur: 0.8, type: 'triangle' },
          { beat: 1, freq: 261, dur: 0.5, type: 'triangle' },
          { beat: 2, freq: 196, dur: 0.8, type: 'triangle' },
          { beat: 3, freq: 233, dur: 0.5, type: 'triangle' },
        ],
        [
          { beat: 0, freq: 196, dur: 0.8, type: 'triangle' },
          { beat: 1.5, freq: 261, dur: 0.5, type: 'triangle' },
          { beat: 2.5, freq: 293, dur: 0.8, type: 'triangle' },
        ],
      ];
    } else if (world === 'sky') {
      return [
        [
          { beat: 0, freq: 523, dur: 0.8, type: 'sine', vol: 0.05 },
          { beat: 1, freq: 659, dur: 0.5, type: 'sine', vol: 0.04 },
          { beat: 2, freq: 784, dur: 0.8, type: 'sine', vol: 0.05 },
          { beat: 3, freq: 659, dur: 0.5, type: 'sine', vol: 0.04 },
        ],
        [
          { beat: 0, freq: 784, dur: 0.8, type: 'sine', vol: 0.05 },
          { beat: 1.5, freq: 523, dur: 0.5, type: 'sine', vol: 0.04 },
          { beat: 2.5, freq: 659, dur: 1, type: 'sine', vol: 0.05 },
        ],
      ];
    }
    // Jungle default - cheerful pentatonic
    return [
      [
        { beat: 0, freq: 392, dur: 0.5, type: 'sine' },
        { beat: 0.5, freq: 440, dur: 0.5, type: 'sine' },
        { beat: 1, freq: 523, dur: 0.8, type: 'sine' },
        { beat: 2, freq: 440, dur: 0.5, type: 'sine' },
        { beat: 2.5, freq: 392, dur: 0.5, type: 'sine' },
        { beat: 3, freq: 330, dur: 0.8, type: 'sine' },
      ],
      [
        { beat: 0, freq: 330, dur: 0.5, type: 'sine' },
        { beat: 0.5, freq: 392, dur: 0.5, type: 'sine' },
        { beat: 1, freq: 440, dur: 0.8, type: 'sine' },
        { beat: 2.5, freq: 523, dur: 0.5, type: 'sine' },
        { beat: 3, freq: 392, dur: 0.8, type: 'sine' },
      ],
    ];
  }

  stopMusic() {
    this.musicPlaying = false;
    if (this.musicTimer) {
      clearTimeout(this.musicTimer);
      this.musicTimer = null;
    }
  }

  setEnabled(enabled) {
    this.enabled = enabled;
  }

  setMusicEnabled(enabled) {
    this.musicEnabled = enabled;
    if (!enabled) this.stopMusic();
  }
}
