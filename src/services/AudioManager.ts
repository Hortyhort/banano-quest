/**
 * AudioManager — Procedural SFX and chiptune BGM via Web Audio API.
 * No external audio files needed. Everything is synthesized at runtime.
 */

type SfxName =
  | 'jump'
  | 'land'
  | 'coinCollect'
  | 'stomp'
  | 'death'
  | 'spike'
  | 'levelComplete'
  | 'gameOver'
  | 'menuSelect';

let ctx: AudioContext | null = null;
let masterGain: GainNode | null = null;
let bgmGain: GainNode | null = null;
let sfxGain: GainNode | null = null;
let muted = false;
let bgmPlaying = false;
let bgmNodes: OscillatorNode[] = [];
let bgmTimeout: ReturnType<typeof setTimeout> | null = null;
let coinCombo = 0;
let coinComboTimer: ReturnType<typeof setTimeout> | null = null;

function ensureContext(): AudioContext | null {
  if (!ctx) {
    if (typeof AudioContext === 'undefined') return null;
    ctx = new AudioContext();
    masterGain = ctx.createGain();
    masterGain.gain.value = 0.5;
    masterGain.connect(ctx.destination);

    bgmGain = ctx.createGain();
    bgmGain.gain.value = 0.25;
    bgmGain.connect(masterGain);

    sfxGain = ctx.createGain();
    sfxGain.gain.value = 0.6;
    sfxGain.connect(masterGain);
  }
  if (ctx.state === 'suspended') {
    ctx.resume();
  }
  return ctx;
}

function playTone(
  freq: number,
  duration: number,
  type: OscillatorType = 'square',
  gainValue = 0.3,
  delay = 0
) {
  const c = ensureContext();
  if (!c) return;
  const osc = c.createOscillator();
  const gain = c.createGain();

  osc.type = type;
  osc.frequency.value = freq;

  gain.gain.setValueAtTime(0, c.currentTime + delay);
  gain.gain.linearRampToValueAtTime(gainValue, c.currentTime + delay + 0.01);
  gain.gain.linearRampToValueAtTime(0, c.currentTime + delay + duration);

  osc.connect(gain);
  gain.connect(sfxGain!);
  osc.start(c.currentTime + delay);
  osc.stop(c.currentTime + delay + duration + 0.05);
}

function playNoise(duration: number, gainValue = 0.15, delay = 0) {
  const c = ensureContext();
  if (!c) return;
  const bufferSize = c.sampleRate * duration;
  const buffer = c.createBuffer(1, bufferSize, c.sampleRate);
  const data = buffer.getChannelData(0);
  for (let i = 0; i < bufferSize; i++) {
    data[i] = Math.random() * 2 - 1;
  }

  const source = c.createBufferSource();
  source.buffer = buffer;

  const gain = c.createGain();
  gain.gain.setValueAtTime(gainValue, c.currentTime + delay);
  gain.gain.linearRampToValueAtTime(0, c.currentTime + delay + duration);

  const filter = c.createBiquadFilter();
  filter.type = 'highpass';
  filter.frequency.value = 2000;

  source.connect(filter);
  filter.connect(gain);
  gain.connect(sfxGain!);
  source.start(c.currentTime + delay);
}

export const AudioManager = {
  init() {
    ensureContext();
  },

  isMuted(): boolean {
    return muted;
  },

  toggleMute(): boolean {
    muted = !muted;
    if (masterGain) {
      masterGain.gain.value = muted ? 0 : 0.5;
    }
    return muted;
  },

  setMuted(val: boolean) {
    muted = val;
    if (masterGain) {
      masterGain.gain.value = muted ? 0 : 0.5;
    }
  },

  playSfx(name: SfxName) {
    if (!ensureContext()) return;
    switch (name) {
      case 'jump':
        // Quick rising chirp
        playTone(200, 0.08, 'square', 0.2);
        playTone(400, 0.06, 'square', 0.15, 0.04);
        break;

      case 'land':
        // Soft thud
        playTone(80, 0.1, 'triangle', 0.15);
        playNoise(0.05, 0.08);
        break;

      case 'coinCollect': {
        // Pitch rises with combo
        coinCombo++;
        if (coinComboTimer) clearTimeout(coinComboTimer);
        coinComboTimer = setTimeout(() => {
          coinCombo = 0;
        }, 1500);

        const basePitch = 800 + coinCombo * 60;
        const clampedPitch = Math.min(basePitch, 1600);
        playTone(clampedPitch, 0.08, 'square', 0.2);
        playTone(clampedPitch * 1.5, 0.1, 'square', 0.15, 0.07);
        break;
      }

      case 'stomp':
        // Satisfying pop + rising tone
        playTone(150, 0.06, 'square', 0.25);
        playTone(300, 0.08, 'triangle', 0.2, 0.04);
        playTone(500, 0.06, 'square', 0.15, 0.08);
        break;

      case 'death':
        // Descending sad notes
        playTone(400, 0.15, 'square', 0.2);
        playTone(300, 0.15, 'square', 0.2, 0.15);
        playTone(200, 0.25, 'square', 0.2, 0.3);
        playTone(150, 0.3, 'sawtooth', 0.15, 0.5);
        break;

      case 'spike':
        // Sharp hit + noise
        playTone(100, 0.15, 'sawtooth', 0.3);
        playNoise(0.1, 0.2);
        playTone(80, 0.2, 'square', 0.2, 0.05);
        break;

      case 'levelComplete':
        // Victory fanfare — ascending arpeggiated
        playTone(523, 0.12, 'square', 0.2);
        playTone(659, 0.12, 'square', 0.2, 0.12);
        playTone(784, 0.12, 'square', 0.2, 0.24);
        playTone(1047, 0.3, 'square', 0.25, 0.36);
        playTone(784, 0.1, 'triangle', 0.15, 0.36);
        playTone(1047, 0.3, 'triangle', 0.15, 0.36);
        break;

      case 'gameOver':
        // Slow descending
        playTone(392, 0.2, 'square', 0.2);
        playTone(349, 0.2, 'square', 0.2, 0.22);
        playTone(330, 0.2, 'square', 0.2, 0.44);
        playTone(262, 0.5, 'sawtooth', 0.2, 0.66);
        break;

      case 'menuSelect':
        playTone(600, 0.06, 'square', 0.2);
        playTone(800, 0.08, 'square', 0.15, 0.05);
        break;
    }
  },

  // Simple chiptune BGM loop using a melody pattern
  startBgm(track: 'menu' | 'gameplay') {
    this.stopBgm();
    if (!ensureContext()) return;
    bgmPlaying = true;

    const melodies: Record<'menu' | 'gameplay', { notes: number[]; tempo: number }> = {
      menu: {
        notes: [
          523, 0, 659, 0, 784, 0, 659, 0, 523, 0, 392, 0, 440, 0, 523, 0, 440, 0, 392, 0, 349, 0,
          392, 0, 440, 0, 523, 0, 659, 0, 523, 0,
        ],
        tempo: 200,
      },
      gameplay: {
        notes: [
          392, 392, 0, 523, 0, 494, 440, 0, 392, 0, 349, 392, 0, 523, 587, 0, 523, 0, 494, 440, 0,
          523, 0, 659, 587, 0, 523, 0, 440, 392, 0, 0,
        ],
        tempo: 140,
      },
    };

    const { notes, tempo } = melodies[track];
    let noteIndex = 0;

    const bassNotes: Record<'menu' | 'gameplay', number[]> = {
      menu: [262, 0, 0, 0, 330, 0, 0, 0, 349, 0, 0, 0, 262, 0, 0, 0],
      gameplay: [196, 0, 0, 0, 262, 0, 0, 0, 175, 0, 0, 0, 220, 0, 0, 0],
    };
    const bass = bassNotes[track];
    let bassIndex = 0;

    const playNext = () => {
      if (!bgmPlaying) return;

      const c = ensureContext();
      if (!c) return;
      const note = notes[noteIndex % notes.length];

      if (note > 0) {
        const osc = c.createOscillator();
        const gain = c.createGain();
        osc.type = 'square';
        osc.frequency.value = note;
        gain.gain.setValueAtTime(0.12, c.currentTime);
        gain.gain.linearRampToValueAtTime(0, c.currentTime + tempo / 1000 - 0.02);
        osc.connect(gain);
        gain.connect(bgmGain!);
        osc.start(c.currentTime);
        osc.stop(c.currentTime + tempo / 1000);
        bgmNodes.push(osc);
      }

      // Bass line (plays every 2 melody notes)
      if (noteIndex % 2 === 0) {
        const bassNote = bass[bassIndex % bass.length];
        if (bassNote > 0) {
          const bassOsc = c.createOscillator();
          const bassGainNode = c.createGain();
          bassOsc.type = 'triangle';
          bassOsc.frequency.value = bassNote;
          bassGainNode.gain.setValueAtTime(0.1, c.currentTime);
          bassGainNode.gain.linearRampToValueAtTime(0, c.currentTime + (tempo * 2) / 1000 - 0.02);
          bassOsc.connect(bassGainNode);
          bassGainNode.connect(bgmGain!);
          bassOsc.start(c.currentTime);
          bassOsc.stop(c.currentTime + (tempo * 2) / 1000);
          bgmNodes.push(bassOsc);
        }
        bassIndex++;
      }

      noteIndex++;
      bgmTimeout = setTimeout(playNext, tempo);
    };

    playNext();
  },

  stopBgm() {
    bgmPlaying = false;
    if (bgmTimeout) {
      clearTimeout(bgmTimeout);
      bgmTimeout = null;
    }
    bgmNodes.forEach((osc) => {
      try {
        osc.stop();
      } catch {
        // already stopped
      }
    });
    bgmNodes = [];
  },

  resetCoinCombo() {
    coinCombo = 0;
  },
};
