/**
 * StorageService - Handles localStorage for game data persistence
 */

const STORAGE_KEYS = {
  HIGH_SCORE: 'bananoquest_highscore',
  SETTINGS: 'bananoquest_settings',
  UNLOCKED_LEVELS: 'bananoquest_levels',
  TOTAL_COINS: 'bananoquest_totalcoins',
  LEVEL_STARS: 'bananoquest_levelstars'
};

const DEFAULT_SETTINGS = {
  soundEnabled: true,
  musicEnabled: true
};

class StorageServiceClass {
  constructor() {
    this.isAvailable = this.checkAvailability();
  }

  checkAvailability() {
    try {
      const test = '__storage_test__';
      localStorage.setItem(test, test);
      localStorage.removeItem(test);
      return true;
    } catch (e) {
      console.warn('localStorage not available:', e);
      return false;
    }
  }

  // High Score
  getHighScore() {
    if (!this.isAvailable) return 0;
    const score = localStorage.getItem(STORAGE_KEYS.HIGH_SCORE);
    return score ? parseInt(score, 10) : 0;
  }

  setHighScore(score) {
    if (!this.isAvailable) return false;
    const currentHigh = this.getHighScore();
    if (score > currentHigh) {
      localStorage.setItem(STORAGE_KEYS.HIGH_SCORE, score.toString());
      return true; // New high score!
    }
    return false;
  }

  // Total Coins Collected (lifetime stat)
  getTotalCoins() {
    if (!this.isAvailable) return 0;
    const coins = localStorage.getItem(STORAGE_KEYS.TOTAL_COINS);
    return coins ? parseInt(coins, 10) : 0;
  }

  addCoins(amount) {
    if (!this.isAvailable) return;
    const total = this.getTotalCoins() + amount;
    localStorage.setItem(STORAGE_KEYS.TOTAL_COINS, total.toString());
    return total;
  }

  // Unlocked Levels
  getUnlockedLevels() {
    if (!this.isAvailable) return 1;
    const levels = localStorage.getItem(STORAGE_KEYS.UNLOCKED_LEVELS);
    return levels ? parseInt(levels, 10) : 1;
  }

  unlockLevel(level) {
    if (!this.isAvailable) return;
    const current = this.getUnlockedLevels();
    if (level > current) {
      localStorage.setItem(STORAGE_KEYS.UNLOCKED_LEVELS, level.toString());
    }
  }

  // Level Stars
  getLevelStars(levelIndex) {
    if (!this.isAvailable) return 0;
    const data = localStorage.getItem(STORAGE_KEYS.LEVEL_STARS);
    if (!data) return 0;
    try {
      const stars = JSON.parse(data);
      return stars[levelIndex] || 0;
    } catch { return 0; }
  }

  setLevelStars(levelIndex, stars) {
    if (!this.isAvailable) return;
    let data = {};
    try {
      const existing = localStorage.getItem(STORAGE_KEYS.LEVEL_STARS);
      if (existing) data = JSON.parse(existing);
    } catch { /* ignore */ }
    if (!data[levelIndex] || stars > data[levelIndex]) {
      data[levelIndex] = stars;
      localStorage.setItem(STORAGE_KEYS.LEVEL_STARS, JSON.stringify(data));
    }
  }

  // Settings
  getSettings() {
    if (!this.isAvailable) return { ...DEFAULT_SETTINGS };
    const settings = localStorage.getItem(STORAGE_KEYS.SETTINGS);
    return settings ? JSON.parse(settings) : { ...DEFAULT_SETTINGS };
  }

  updateSettings(newSettings) {
    if (!this.isAvailable) return;
    const current = this.getSettings();
    const updated = { ...current, ...newSettings };
    localStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(updated));
    return updated;
  }

  // Reset all data
  resetAll() {
    if (!this.isAvailable) return;
    Object.values(STORAGE_KEYS).forEach(key => {
      localStorage.removeItem(key);
    });
  }

  // Get all stats for display
  getStats() {
    return {
      highScore: this.getHighScore(),
      totalCoins: this.getTotalCoins(),
      unlockedLevels: this.getUnlockedLevels()
    };
  }
}

export const StorageService = new StorageServiceClass();
