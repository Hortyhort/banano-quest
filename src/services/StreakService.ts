/**
 * StreakService — Tracks consecutive play days and awards bonus multipliers.
 */

const STORAGE_KEY = 'bananoquest_streak';

interface StreakData {
  currentStreak: number;
  lastPlayDate: string; // YYYY-MM-DD
  longestStreak: number;
}

const DEFAULT_DATA: StreakData = {
  currentStreak: 0,
  lastPlayDate: '',
  longestStreak: 0,
};

function getTodayString(): string {
  const now = new Date();
  const y = now.getFullYear();
  const m = String(now.getMonth() + 1).padStart(2, '0');
  const d = String(now.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

function getYesterdayString(): string {
  const d = new Date();
  d.setDate(d.getDate() - 1);
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

function loadData(): StreakData {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? (JSON.parse(raw) as StreakData) : { ...DEFAULT_DATA };
  } catch {
    return { ...DEFAULT_DATA };
  }
}

function saveData(data: StreakData): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  } catch {
    // ignore
  }
}

export const StreakService = {
  /**
   * Record that the player played today.
   * Updates streak count based on whether they played yesterday.
   * Returns the new streak count.
   */
  recordPlay(): number {
    const today = getTodayString();
    const yesterday = getYesterdayString();
    const data = loadData();

    if (data.lastPlayDate === today) {
      // Already recorded today
      return data.currentStreak;
    }

    if (data.lastPlayDate === yesterday) {
      // Consecutive day!
      data.currentStreak++;
    } else {
      // Streak broken (or first play)
      data.currentStreak = 1;
    }

    data.lastPlayDate = today;
    data.longestStreak = Math.max(data.longestStreak, data.currentStreak);
    saveData(data);
    return data.currentStreak;
  },

  /** Get current streak without modifying it */
  getCurrentStreak(): number {
    const data = loadData();
    const today = getTodayString();
    const yesterday = getYesterdayString();

    // If last play was today or yesterday, streak is alive
    if (data.lastPlayDate === today || data.lastPlayDate === yesterday) {
      return data.currentStreak;
    }
    // Streak is broken
    return 0;
  },

  /** Get longest streak ever */
  getLongestStreak(): number {
    return loadData().longestStreak;
  },

  /**
   * Get coin multiplier based on current streak.
   * 1-2 days: 1x, 3-4 days: 1.5x, 5-6 days: 2x, 7+: 3x
   */
  getCoinMultiplier(): number {
    const streak = this.getCurrentStreak();
    if (streak >= 7) return 3;
    if (streak >= 5) return 2;
    if (streak >= 3) return 1.5;
    return 1;
  },

  /** Get all streak data for display */
  getData(): StreakData {
    return loadData();
  },

  /** Reset streak data */
  resetAll(): void {
    try {
      localStorage.removeItem(STORAGE_KEY);
    } catch {
      // ignore
    }
  },
};
