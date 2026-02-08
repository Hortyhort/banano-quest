import { describe, it, expect, beforeEach, vi } from 'vitest';
import { StorageService } from '../../src/services/StorageService.ts';

// Reset localStorage before each test
beforeEach(() => {
  localStorage.clear();
  // Force re-instantiate by clearing stored data
  StorageService.resetAll();
});

describe('StorageService', () => {
  describe('getHighScore / setHighScore', () => {
    it('returns 0 when no high score is set', () => {
      expect(StorageService.getHighScore()).toBe(0);
    });

    it('saves and retrieves a high score', () => {
      const isNew = StorageService.setHighScore(100);
      expect(isNew).toBe(true);
      expect(StorageService.getHighScore()).toBe(100);
    });

    it('only saves if score is higher than current', () => {
      StorageService.setHighScore(100);
      const isNew = StorageService.setHighScore(50);
      expect(isNew).toBe(false);
      expect(StorageService.getHighScore()).toBe(100);
    });

    it('updates when new score is higher', () => {
      StorageService.setHighScore(100);
      const isNew = StorageService.setHighScore(200);
      expect(isNew).toBe(true);
      expect(StorageService.getHighScore()).toBe(200);
    });
  });

  describe('getTotalCoins / addCoins', () => {
    it('returns 0 when no coins collected', () => {
      expect(StorageService.getTotalCoins()).toBe(0);
    });

    it('adds coins and returns new total', () => {
      const total = StorageService.addCoins(5);
      expect(total).toBe(5);
      expect(StorageService.getTotalCoins()).toBe(5);
    });

    it('accumulates coins across multiple calls', () => {
      StorageService.addCoins(3);
      StorageService.addCoins(7);
      expect(StorageService.getTotalCoins()).toBe(10);
    });
  });

  describe('getUnlockedLevels / unlockLevel', () => {
    it('returns 1 by default', () => {
      expect(StorageService.getUnlockedLevels()).toBe(1);
    });

    it('unlocks a higher level', () => {
      StorageService.unlockLevel(3);
      expect(StorageService.getUnlockedLevels()).toBe(3);
    });

    it('does not downgrade unlocked levels', () => {
      StorageService.unlockLevel(5);
      StorageService.unlockLevel(2);
      expect(StorageService.getUnlockedLevels()).toBe(5);
    });
  });

  describe('getSettings / updateSettings', () => {
    it('returns default settings', () => {
      const settings = StorageService.getSettings();
      expect(settings).toEqual({
        soundEnabled: true,
        musicEnabled: true,
      });
    });

    it('updates individual settings', () => {
      const updated = StorageService.updateSettings({ soundEnabled: false });
      expect(updated.soundEnabled).toBe(false);
      expect(updated.musicEnabled).toBe(true);
    });

    it('persists settings across reads', () => {
      StorageService.updateSettings({ musicEnabled: false });
      const settings = StorageService.getSettings();
      expect(settings.musicEnabled).toBe(false);
    });
  });

  describe('star rating', () => {
    it('returns 0 stars for unplayed level', () => {
      expect(StorageService.getLevelStars(0, 0)).toBe(0);
    });

    it('saves and retrieves level stars', () => {
      StorageService.setLevelStars(0, 0, 2);
      expect(StorageService.getLevelStars(0, 0)).toBe(2);
    });

    it('only saves if new stars are higher', () => {
      StorageService.setLevelStars(0, 0, 3);
      StorageService.setLevelStars(0, 0, 1);
      expect(StorageService.getLevelStars(0, 0)).toBe(3);
    });

    it('clamps stars to 0-3 range', () => {
      StorageService.setLevelStars(0, 0, 5);
      expect(StorageService.getLevelStars(0, 0)).toBe(3);
    });

    it('getWorldStars sums stars for a world', () => {
      StorageService.setLevelStars(0, 0, 2);
      StorageService.setLevelStars(0, 1, 3);
      expect(StorageService.getWorldStars(0)).toBe(5);
    });

    it('getTotalStars sums all stars across worlds', () => {
      StorageService.setLevelStars(0, 0, 2);
      StorageService.setLevelStars(1, 0, 3);
      StorageService.setLevelStars(2, 1, 1);
      expect(StorageService.getTotalStars()).toBe(6);
    });

    it('different worlds have independent stars', () => {
      StorageService.setLevelStars(0, 0, 3);
      StorageService.setLevelStars(1, 0, 1);
      expect(StorageService.getWorldStars(0)).toBe(3);
      expect(StorageService.getWorldStars(1)).toBe(1);
    });
  });

  describe('resetAll', () => {
    it('clears all stored data including stars', () => {
      StorageService.setHighScore(999);
      StorageService.addCoins(50);
      StorageService.unlockLevel(5);
      StorageService.updateSettings({ soundEnabled: false });
      StorageService.setLevelStars(0, 0, 3);

      StorageService.resetAll();

      expect(StorageService.getHighScore()).toBe(0);
      expect(StorageService.getTotalCoins()).toBe(0);
      expect(StorageService.getUnlockedLevels()).toBe(1);
      expect(StorageService.getSettings()).toEqual({
        soundEnabled: true,
        musicEnabled: true,
      });
      expect(StorageService.getLevelStars(0, 0)).toBe(0);
      expect(StorageService.getTotalStars()).toBe(0);
    });
  });

  describe('getStats', () => {
    it('returns aggregated stats', () => {
      StorageService.setHighScore(500);
      StorageService.addCoins(25);
      StorageService.unlockLevel(3);

      const stats = StorageService.getStats();
      expect(stats).toEqual({
        highScore: 500,
        totalCoins: 25,
        unlockedLevels: 3,
      });
    });
  });
});
