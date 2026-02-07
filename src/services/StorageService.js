/**
 * StorageService - Handles localStorage for game data persistence
 */

const STORAGE_KEYS = {
  HIGH_SCORE: 'bananoquest_highscore',
  SETTINGS: 'bananoquest_settings',
  UNLOCKED_LEVELS: 'bananoquest_levels',
  TOTAL_COINS: 'bananoquest_totalcoins',
  LEVEL_STARS: 'bananoquest_levelstars',
  ACHIEVEMENTS: 'bananoquest_achievements',
  STATS: 'bananoquest_stats',
  SELECTED_SKIN: 'bananoquest_skin',
  UNLOCKED_SKINS: 'bananoquest_skins'
};

const DEFAULT_SETTINGS = {
  soundEnabled: true,
  musicEnabled: true,
  hapticsEnabled: true
};

class StorageServiceClass {
  constructor() {
    this.isAvailable = this.checkAvailability();
  }

  _safeParseJSON(raw, fallback) {
    if (!raw) return fallback;
    try {
      return JSON.parse(raw);
    } catch (e) {
      console.warn('Corrupted storage data:', e);
      return fallback;
    }
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

  // Per-level star ratings
  getLevelStars(level) {
    if (!this.isAvailable) return 0;
    const data = localStorage.getItem(STORAGE_KEYS.LEVEL_STARS);
    const stars = this._safeParseJSON(data, {});
    return stars[level] || 0;
  }

  setLevelStars(level, starCount) {
    if (!this.isAvailable) return;
    const data = localStorage.getItem(STORAGE_KEYS.LEVEL_STARS);
    const stars = this._safeParseJSON(data, {});
    if (starCount > (stars[level] || 0)) {
      stars[level] = starCount;
      localStorage.setItem(STORAGE_KEYS.LEVEL_STARS, JSON.stringify(stars));
      return true; // new best
    }
    return false;
  }

  getAllStars() {
    if (!this.isAvailable) return {};
    const data = localStorage.getItem(STORAGE_KEYS.LEVEL_STARS);
    return this._safeParseJSON(data, {});
  }

  // Settings
  getSettings() {
    if (!this.isAvailable) return { ...DEFAULT_SETTINGS };
    const settings = localStorage.getItem(STORAGE_KEYS.SETTINGS);
    return this._safeParseJSON(settings, { ...DEFAULT_SETTINGS });
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

  // ── Achievements ──
  getAchievements() {
    if (!this.isAvailable) return [];
    const data = localStorage.getItem(STORAGE_KEYS.ACHIEVEMENTS);
    return this._safeParseJSON(data, []);
  }

  unlockAchievement(id) {
    if (!this.isAvailable) return;
    const current = this.getAchievements();
    if (!current.includes(id)) {
      current.push(id);
      localStorage.setItem(STORAGE_KEYS.ACHIEVEMENTS, JSON.stringify(current));
    }
  }

  // ── Detailed Stats ──
  getStats() {
    const defaults = {
      highScore: this.getHighScore(),
      totalCoins: this.getTotalCoins(),
      unlockedLevels: this.getUnlockedLevels(),
      totalDeaths: 0,
      totalEnemiesStomped: 0,
      totalPowerUps: 0,
      totalPlayTime: 0,
      levelBestTimes: {}
    };
    if (!this.isAvailable) return defaults;
    const data = localStorage.getItem(STORAGE_KEYS.STATS);
    const stored = this._safeParseJSON(data, {});
    return {
      ...defaults,
      ...stored,
      // Always pull live values for these
      highScore: this.getHighScore(),
      totalCoins: this.getTotalCoins(),
      unlockedLevels: this.getUnlockedLevels()
    };
  }

  updateStats(partial) {
    if (!this.isAvailable) return;
    const current = this.getStats();
    const updated = { ...current, ...partial };
    // Don't store the live values
    delete updated.highScore;
    delete updated.totalCoins;
    delete updated.unlockedLevels;
    localStorage.setItem(STORAGE_KEYS.STATS, JSON.stringify(updated));
  }

  addDeath() {
    const stats = this.getStats();
    this.updateStats({ totalDeaths: stats.totalDeaths + 1 });
  }

  addEnemyStomp() {
    const stats = this.getStats();
    this.updateStats({ totalEnemiesStomped: stats.totalEnemiesStomped + 1 });
  }

  addPowerUp() {
    const stats = this.getStats();
    this.updateStats({ totalPowerUps: stats.totalPowerUps + 1 });
  }

  addPlayTime(seconds) {
    const stats = this.getStats();
    this.updateStats({ totalPlayTime: stats.totalPlayTime + seconds });
  }

  setLevelBestTime(level, time) {
    const stats = this.getStats();
    const best = stats.levelBestTimes[level];
    if (!best || time < best) {
      stats.levelBestTimes[level] = time;
      this.updateStats({ levelBestTimes: stats.levelBestTimes });
      return true;
    }
    return false;
  }

  // ── Skins ──
  getSelectedSkin() {
    if (!this.isAvailable) return 'default';
    return localStorage.getItem(STORAGE_KEYS.SELECTED_SKIN) || 'default';
  }

  setSelectedSkin(skinId) {
    if (!this.isAvailable) return;
    localStorage.setItem(STORAGE_KEYS.SELECTED_SKIN, skinId);
  }

  getUnlockedSkins() {
    if (!this.isAvailable) return ['default'];
    const data = localStorage.getItem(STORAGE_KEYS.UNLOCKED_SKINS);
    const skins = this._safeParseJSON(data, ['default']);
    if (!skins.includes('default')) skins.unshift('default');
    return skins;
  }

  unlockSkin(skinId) {
    if (!this.isAvailable) return;
    const current = this.getUnlockedSkins();
    if (!current.includes(skinId)) {
      current.push(skinId);
      localStorage.setItem(STORAGE_KEYS.UNLOCKED_SKINS, JSON.stringify(current));
    }
  }
}

export const StorageService = new StorageServiceClass();
