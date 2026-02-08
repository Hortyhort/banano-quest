const STORAGE_KEYS = {
  HIGH_SCORE: 'bananoquest_highscore',
  SETTINGS: 'bananoquest_settings',
  UNLOCKED_LEVELS: 'bananoquest_levels',
  TOTAL_COINS: 'bananoquest_totalcoins',
  STARS: 'bananoquest_stars',
} as const;

export interface GameSettings {
  soundEnabled: boolean;
  musicEnabled: boolean;
}

export interface GameStats {
  highScore: number;
  totalCoins: number;
  unlockedLevels: number;
}

const DEFAULT_SETTINGS: GameSettings = {
  soundEnabled: true,
  musicEnabled: true,
};

class StorageServiceClass {
  private isAvailable: boolean;

  constructor() {
    this.isAvailable = this.checkAvailability();
  }

  private checkAvailability(): boolean {
    try {
      const test = '__storage_test__';
      localStorage.setItem(test, test);
      localStorage.removeItem(test);
      return true;
    } catch {
      console.warn('localStorage not available');
      return false;
    }
  }

  getHighScore(): number {
    if (!this.isAvailable) return 0;
    const score = localStorage.getItem(STORAGE_KEYS.HIGH_SCORE);
    return score ? parseInt(score, 10) : 0;
  }

  setHighScore(score: number): boolean {
    if (!this.isAvailable) return false;
    const currentHigh = this.getHighScore();
    if (score > currentHigh) {
      localStorage.setItem(STORAGE_KEYS.HIGH_SCORE, score.toString());
      return true;
    }
    return false;
  }

  getTotalCoins(): number {
    if (!this.isAvailable) return 0;
    const coins = localStorage.getItem(STORAGE_KEYS.TOTAL_COINS);
    return coins ? parseInt(coins, 10) : 0;
  }

  addCoins(amount: number): number {
    if (!this.isAvailable) return 0;
    const total = this.getTotalCoins() + amount;
    localStorage.setItem(STORAGE_KEYS.TOTAL_COINS, total.toString());
    return total;
  }

  getUnlockedLevels(): number {
    if (!this.isAvailable) return 1;
    const levels = localStorage.getItem(STORAGE_KEYS.UNLOCKED_LEVELS);
    return levels ? parseInt(levels, 10) : 1;
  }

  unlockLevel(level: number): void {
    if (!this.isAvailable) return;
    const current = this.getUnlockedLevels();
    if (level > current) {
      localStorage.setItem(STORAGE_KEYS.UNLOCKED_LEVELS, level.toString());
    }
  }

  getSettings(): GameSettings {
    if (!this.isAvailable) return { ...DEFAULT_SETTINGS };
    const settings = localStorage.getItem(STORAGE_KEYS.SETTINGS);
    return settings ? (JSON.parse(settings) as GameSettings) : { ...DEFAULT_SETTINGS };
  }

  updateSettings(newSettings: Partial<GameSettings>): GameSettings {
    const current = this.getSettings();
    const updated = { ...current, ...newSettings };
    if (this.isAvailable) {
      localStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(updated));
    }
    return updated;
  }

  private getStarsMap(): Record<string, number> {
    if (!this.isAvailable) return {};
    const raw = localStorage.getItem(STORAGE_KEYS.STARS);
    return raw ? (JSON.parse(raw) as Record<string, number>) : {};
  }

  private saveStarsMap(map: Record<string, number>): void {
    if (!this.isAvailable) return;
    localStorage.setItem(STORAGE_KEYS.STARS, JSON.stringify(map));
  }

  getLevelStars(worldIndex: number, levelIndex: number): number {
    const map = this.getStarsMap();
    const key = `${worldIndex}-${levelIndex}`;
    return map[key] ?? 0;
  }

  setLevelStars(worldIndex: number, levelIndex: number, stars: number): void {
    const clamped = Math.max(0, Math.min(3, stars));
    const map = this.getStarsMap();
    const key = `${worldIndex}-${levelIndex}`;
    const current = map[key] ?? 0;
    if (clamped > current) {
      map[key] = clamped;
      this.saveStarsMap(map);
    }
  }

  getWorldStars(worldIndex: number): number {
    const map = this.getStarsMap();
    const prefix = `${worldIndex}-`;
    let total = 0;
    for (const key in map) {
      if (key.startsWith(prefix)) {
        total += map[key];
      }
    }
    return total;
  }

  getTotalStars(): number {
    const map = this.getStarsMap();
    let total = 0;
    for (const key in map) {
      total += map[key];
    }
    return total;
  }

  resetAll(): void {
    if (!this.isAvailable) return;
    Object.values(STORAGE_KEYS).forEach((key) => {
      localStorage.removeItem(key);
    });
  }

  getStats(): GameStats {
    return {
      highScore: this.getHighScore(),
      totalCoins: this.getTotalCoins(),
      unlockedLevels: this.getUnlockedLevels(),
    };
  }
}

export const StorageService = new StorageServiceClass();
