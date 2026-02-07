/**
 * AudioManager — Procedural audio via Web Audio API
 *
 * Handles all SFX and music. Generates sounds programmatically
 * so no external audio assets are needed.
 */

import { StorageService } from './StorageService.js';

class AudioManagerClass {
  constructor() {
    this.ctx = null;
    this.unlocked = false;
    this.musicGain = null;
    this.sfxGain = null;
    this.currentMusic = null; // { stop() }
    this._settings = null;
  }

  /**
   * Must be called from a user gesture (pointerdown / keydown)
   * to satisfy browser autoplay policy.
   */
  unlock() {
    if (this.unlocked) return;
    try {
      this.ctx = new (window.AudioContext || window.webkitAudioContext)();
      this.sfxGain = this.ctx.createGain();
      this.sfxGain.connect(this.ctx.destination);
      this.musicGain = this.ctx.createGain();
      this.musicGain.connect(this.ctx.destination);
      this._applySettings();
      this.unlocked = true;
    } catch (e) {
      console.warn('Web Audio not available:', e);
    }
  }

  _applySettings() {
    const s = this.getSettings();
    if (this.sfxGain) this.sfxGain.gain.value = s.soundEnabled ? 1 : 0;
    if (this.musicGain) this.musicGain.gain.value = s.musicEnabled ? 0.35 : 0;
  }

  getSettings() {
    if (!this._settings) this._settings = StorageService.getSettings();
    return this._settings;
  }

  setSoundEnabled(enabled) {
    this._settings = StorageService.updateSettings({ soundEnabled: enabled });
    this._applySettings();
  }

  setMusicEnabled(enabled) {
    this._settings = StorageService.updateSettings({ musicEnabled: enabled });
    this._applySettings();
    if (!enabled) this.stopMusic();
  }

  // ════════════════════════════════════════════
  // LOW-LEVEL HELPERS
  // ════════════════════════════════════════════

  _osc(type, freq, startTime, duration, gain = 0.3) {
    if (!this.ctx) return null;
    const o = this.ctx.createOscillator();
    const g = this.ctx.createGain();
    o.type = type;
    o.frequency.value = freq;
    g.gain.setValueAtTime(gain, startTime);
    g.gain.exponentialRampToValueAtTime(0.001, startTime + duration);
    o.connect(g);
    g.connect(this.sfxGain);
    o.start(startTime);
    o.stop(startTime + duration);
    return o;
  }

  _noise(startTime, duration, gain = 0.15) {
    if (!this.ctx) return null;
    const bufferSize = this.ctx.sampleRate * duration;
    const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      data[i] = Math.random() * 2 - 1;
    }
    const src = this.ctx.createBufferSource();
    src.buffer = buffer;
    const g = this.ctx.createGain();
    g.gain.setValueAtTime(gain, startTime);
    g.gain.exponentialRampToValueAtTime(0.001, startTime + duration);
    src.connect(g);
    g.connect(this.sfxGain);
    src.start(startTime);
    src.stop(startTime + duration);
    return src;
  }

  // ════════════════════════════════════════════
  // SOUND EFFECTS
  // ════════════════════════════════════════════

  playSound(key) {
    if (!this.unlocked || !this.ctx) return;
    const fn = this._sounds[key];
    if (fn) fn.call(this);
  }

  get _sounds() {
    return {
      jump: this._sfxJump,
      land: this._sfxLand,
      coin_collect: this._sfxCoinCollect,
      enemy_stomp: this._sfxEnemyStomp,
      player_death: this._sfxPlayerDeath,
      level_complete: this._sfxLevelComplete,
      game_over: this._sfxGameOver,
      menu_click: this._sfxMenuClick,
      star_reveal: this._sfxStarReveal
    };
  }

  // Short upward whoosh
  _sfxJump() {
    const t = this.ctx.currentTime;
    const o = this.ctx.createOscillator();
    const g = this.ctx.createGain();
    o.type = 'sine';
    o.frequency.setValueAtTime(300, t);
    o.frequency.exponentialRampToValueAtTime(600, t + 0.12);
    g.gain.setValueAtTime(0.2, t);
    g.gain.exponentialRampToValueAtTime(0.001, t + 0.15);
    o.connect(g);
    g.connect(this.sfxGain);
    o.start(t);
    o.stop(t + 0.15);
  }

  // Soft thud
  _sfxLand() {
    const t = this.ctx.currentTime;
    this._noise(t, 0.08, 0.1);
    const o = this.ctx.createOscillator();
    const g = this.ctx.createGain();
    o.type = 'sine';
    o.frequency.setValueAtTime(100, t);
    o.frequency.exponentialRampToValueAtTime(40, t + 0.08);
    g.gain.setValueAtTime(0.15, t);
    g.gain.exponentialRampToValueAtTime(0.001, t + 0.1);
    o.connect(g);
    g.connect(this.sfxGain);
    o.start(t);
    o.stop(t + 0.1);
  }

  // Bright chime / ding
  _sfxCoinCollect() {
    const t = this.ctx.currentTime;
    this._osc('sine', 880, t, 0.1, 0.25);
    this._osc('sine', 1320, t + 0.05, 0.12, 0.2);
    this._osc('sine', 1760, t + 0.1, 0.15, 0.15);
  }

  // Satisfying squish
  _sfxEnemyStomp() {
    const t = this.ctx.currentTime;
    this._noise(t, 0.12, 0.2);
    const o = this.ctx.createOscillator();
    const g = this.ctx.createGain();
    o.type = 'sine';
    o.frequency.setValueAtTime(200, t);
    o.frequency.exponentialRampToValueAtTime(60, t + 0.15);
    g.gain.setValueAtTime(0.25, t);
    g.gain.exponentialRampToValueAtTime(0.001, t + 0.18);
    o.connect(g);
    g.connect(this.sfxGain);
    o.start(t);
    o.stop(t + 0.18);
  }

  // Descending tone
  _sfxPlayerDeath() {
    const t = this.ctx.currentTime;
    const o = this.ctx.createOscillator();
    const g = this.ctx.createGain();
    o.type = 'square';
    o.frequency.setValueAtTime(440, t);
    o.frequency.exponentialRampToValueAtTime(110, t + 0.5);
    g.gain.setValueAtTime(0.2, t);
    g.gain.exponentialRampToValueAtTime(0.001, t + 0.6);
    o.connect(g);
    g.connect(this.sfxGain);
    o.start(t);
    o.stop(t + 0.6);
  }

  // Victory fanfare (3-note ascending)
  _sfxLevelComplete() {
    const t = this.ctx.currentTime;
    this._osc('sine', 523, t, 0.2, 0.25);        // C5
    this._osc('sine', 659, t + 0.2, 0.2, 0.25);  // E5
    this._osc('sine', 784, t + 0.4, 0.4, 0.3);   // G5
    this._osc('triangle', 523, t, 0.2, 0.1);
    this._osc('triangle', 659, t + 0.2, 0.2, 0.1);
    this._osc('triangle', 784, t + 0.4, 0.4, 0.15);
  }

  // Sad descending tone
  _sfxGameOver() {
    const t = this.ctx.currentTime;
    this._osc('triangle', 392, t, 0.3, 0.2);       // G4
    this._osc('triangle', 330, t + 0.3, 0.3, 0.2);  // E4
    this._osc('triangle', 262, t + 0.6, 0.3, 0.2);  // C4
    this._osc('triangle', 196, t + 0.9, 0.6, 0.2);  // G3
  }

  // UI click
  _sfxMenuClick() {
    const t = this.ctx.currentTime;
    this._osc('sine', 660, t, 0.06, 0.2);
    this._osc('sine', 880, t + 0.03, 0.06, 0.15);
  }

  // Sparkle sound (for star reveal)
  _sfxStarReveal() {
    const t = this.ctx.currentTime;
    this._osc('sine', 1200, t, 0.08, 0.15);
    this._osc('sine', 1600, t + 0.06, 0.08, 0.12);
    this._osc('sine', 2000, t + 0.12, 0.12, 0.1);
  }

  // ════════════════════════════════════════════
  // MUSIC
  // ════════════════════════════════════════════

  stopMusic() {
    if (this.currentMusic) {
      this.currentMusic.stop();
      this.currentMusic = null;
    }
  }

  playMusic(key) {
    this.stopMusic();
    if (!this.unlocked || !this.ctx) return;
    if (!this.getSettings().musicEnabled) return;

    const fn = this._musicTracks[key];
    if (fn) this.currentMusic = fn.call(this);
  }

  get _musicTracks() {
    return {
      menu: this._musicMenu,
      gameplay: this._musicGameplay
    };
  }

  /**
   * Menu music — cheerful looping melody in C major
   */
  _musicMenu() {
    const ctx = this.ctx;
    const gain = this.musicGain;

    // Melody: simple happy loop
    const melody = [
      523, 587, 659, 784, 659, 587, 523, 0,   // C D E G E D C rest
      659, 784, 880, 784, 659, 587, 523, 0,    // E G A G E D C rest
      523, 659, 784, 1047, 784, 659, 523, 0,   // C E G C5 G E C rest
      784, 659, 587, 523, 587, 659, 523, 0     // G E D C D E C rest
    ];
    const noteLen = 0.22;
    const loopLen = melody.length * noteLen;

    let running = true;
    let timeout = null;

    const playLoop = () => {
      if (!running) return;
      const now = ctx.currentTime + 0.05;

      melody.forEach((freq, i) => {
        if (freq === 0) return;
        const t = now + i * noteLen;
        const o = ctx.createOscillator();
        const g = ctx.createGain();
        o.type = 'sine';
        o.frequency.value = freq;
        g.gain.setValueAtTime(0.12, t);
        g.gain.exponentialRampToValueAtTime(0.001, t + noteLen * 0.9);
        o.connect(g);
        g.connect(gain);
        o.start(t);
        o.stop(t + noteLen);

        // Soft harmony an octave below
        const o2 = ctx.createOscillator();
        const g2 = ctx.createGain();
        o2.type = 'triangle';
        o2.frequency.value = freq / 2;
        g2.gain.setValueAtTime(0.06, t);
        g2.gain.exponentialRampToValueAtTime(0.001, t + noteLen * 0.9);
        o2.connect(g2);
        g2.connect(gain);
        o2.start(t);
        o2.stop(t + noteLen);
      });

      timeout = setTimeout(playLoop, loopLen * 1000);
    };

    playLoop();

    return {
      stop() {
        running = false;
        if (timeout) clearTimeout(timeout);
      }
    };
  }

  /**
   * Gameplay music — upbeat bouncy loop
   */
  _musicGameplay() {
    const ctx = this.ctx;
    const gain = this.musicGain;

    // Faster, bouncier melody
    const melody = [
      659, 784, 880, 784, 659, 0, 523, 587,   // E G A G E . C D
      659, 523, 587, 659, 784, 0, 880, 784,    // E C D E G . A G
      1047, 880, 784, 659, 784, 880, 659, 0,   // C5 A G E G A E .
      587, 659, 523, 0, 587, 659, 784, 0       // D E C . D E G .
    ];
    const noteLen = 0.16;
    const loopLen = melody.length * noteLen;

    let running = true;
    let timeout = null;

    const playLoop = () => {
      if (!running) return;
      const now = ctx.currentTime + 0.05;

      melody.forEach((freq, i) => {
        if (freq === 0) return;
        const t = now + i * noteLen;
        const o = ctx.createOscillator();
        const g = ctx.createGain();
        o.type = 'square';
        o.frequency.value = freq;
        g.gain.setValueAtTime(0.07, t);
        g.gain.exponentialRampToValueAtTime(0.001, t + noteLen * 0.85);
        o.connect(g);
        g.connect(gain);
        o.start(t);
        o.stop(t + noteLen);

        // Bass line — root note
        if (i % 4 === 0) {
          const ob = ctx.createOscillator();
          const gb = ctx.createGain();
          ob.type = 'triangle';
          ob.frequency.value = freq / 4;
          gb.gain.setValueAtTime(0.1, t);
          gb.gain.exponentialRampToValueAtTime(0.001, t + noteLen * 3);
          ob.connect(gb);
          gb.connect(gain);
          ob.start(t);
          ob.stop(t + noteLen * 3);
        }
      });

      timeout = setTimeout(playLoop, loopLen * 1000);
    };

    playLoop();

    return {
      stop() {
        running = false;
        if (timeout) clearTimeout(timeout);
      }
    };
  }

  // ════════════════════════════════════════════
  // HAPTICS
  // ════════════════════════════════════════════

  vibrate(pattern) {
    const s = this.getSettings();
    if (!s.hapticsEnabled) return;
    if (navigator.vibrate) {
      navigator.vibrate(pattern);
    }
  }
}

export const AudioManager = new AudioManagerClass();
