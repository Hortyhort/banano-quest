import { describe, it, expect, beforeEach } from 'vitest';
import { AudioManager } from '../../src/services/AudioManager.ts';

describe('AudioManager', () => {
  beforeEach(() => {
    AudioManager.setMuted(false);
    AudioManager.stopBgm();
    AudioManager.resetCoinCombo();
  });

  describe('mute controls', () => {
    it('starts unmuted', () => {
      expect(AudioManager.isMuted()).toBe(false);
    });

    it('toggles mute on', () => {
      const result = AudioManager.toggleMute();
      expect(result).toBe(true);
      expect(AudioManager.isMuted()).toBe(true);
    });

    it('toggles mute off after toggling on', () => {
      AudioManager.toggleMute();
      const result = AudioManager.toggleMute();
      expect(result).toBe(false);
      expect(AudioManager.isMuted()).toBe(false);
    });

    it('setMuted sets mute state directly', () => {
      AudioManager.setMuted(true);
      expect(AudioManager.isMuted()).toBe(true);
      AudioManager.setMuted(false);
      expect(AudioManager.isMuted()).toBe(false);
    });
  });

  describe('SFX names', () => {
    it('does not throw for valid SFX names', () => {
      // These will fail to produce sound (no AudioContext in test env)
      // but should not throw
      const sfxNames = [
        'jump',
        'land',
        'coinCollect',
        'stomp',
        'death',
        'spike',
        'levelComplete',
        'gameOver',
        'menuSelect',
      ] as const;

      sfxNames.forEach((name) => {
        expect(() => AudioManager.playSfx(name)).not.toThrow();
      });
    });
  });

  describe('BGM controls', () => {
    it('stopBgm does not throw when nothing is playing', () => {
      expect(() => AudioManager.stopBgm()).not.toThrow();
    });

    it('resetCoinCombo does not throw', () => {
      expect(() => AudioManager.resetCoinCombo()).not.toThrow();
    });
  });
});
