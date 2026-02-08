/**
 * AchievementService — Tracks and persists player achievements.
 * 15 achievements across collection, skill, and discovery categories.
 */

const STORAGE_KEY = 'bananoquest_achievements';

export interface AchievementDef {
  id: string;
  name: string;
  description: string;
  category: 'collection' | 'skill' | 'discovery';
  target: number;
  reward: number; // bonus coins
}

export interface AchievementProgress {
  current: number;
  unlocked: boolean;
  claimedAt?: number; // timestamp
}

export const ACHIEVEMENTS: AchievementDef[] = [
  // ─── Collection ───
  {
    id: 'coin_10',
    name: 'Pocket Change',
    description: 'Collect 10 coins total',
    category: 'collection',
    target: 10,
    reward: 5,
  },
  {
    id: 'coin_100',
    name: 'Coin Hoarder',
    description: 'Collect 100 coins total',
    category: 'collection',
    target: 100,
    reward: 20,
  },
  {
    id: 'coin_500',
    name: 'Banano Baron',
    description: 'Collect 500 coins total',
    category: 'collection',
    target: 500,
    reward: 50,
  },
  {
    id: 'stars_6',
    name: 'Star Seeker',
    description: 'Earn 6 stars',
    category: 'collection',
    target: 6,
    reward: 10,
  },
  {
    id: 'stars_12',
    name: 'Star Master',
    description: 'Earn 12 stars',
    category: 'collection',
    target: 12,
    reward: 30,
  },
  {
    id: 'stars_18',
    name: 'Perfect Run',
    description: 'Earn all 18 stars',
    category: 'collection',
    target: 18,
    reward: 100,
  },

  // ─── Skill ───
  {
    id: 'stomp_1',
    name: 'First Squish',
    description: 'Stomp your first enemy',
    category: 'skill',
    target: 1,
    reward: 5,
  },
  {
    id: 'stomp_25',
    name: 'Stomper',
    description: 'Stomp 25 enemies',
    category: 'skill',
    target: 25,
    reward: 15,
  },
  {
    id: 'stomp_100',
    name: 'Exterminator',
    description: 'Stomp 100 enemies',
    category: 'skill',
    target: 100,
    reward: 50,
  },
  {
    id: 'nodeath_level',
    name: 'Untouchable',
    description: 'Complete a level without dying',
    category: 'skill',
    target: 1,
    reward: 15,
  },
  {
    id: 'speed_3star',
    name: 'Speed Demon',
    description: 'Get 3 stars on any level',
    category: 'skill',
    target: 1,
    reward: 20,
  },
  {
    id: 'all_worlds',
    name: 'World Traveler',
    description: 'Complete all 3 worlds',
    category: 'skill',
    target: 3,
    reward: 50,
  },

  // ─── Discovery ───
  {
    id: 'play_5',
    name: 'Getting Started',
    description: 'Play 5 levels',
    category: 'discovery',
    target: 5,
    reward: 5,
  },
  {
    id: 'play_25',
    name: 'Dedicated',
    description: 'Play 25 levels',
    category: 'discovery',
    target: 25,
    reward: 20,
  },
  {
    id: 'streak_3',
    name: 'On a Roll',
    description: 'Play 3 days in a row',
    category: 'discovery',
    target: 3,
    reward: 25,
  },
];

type ProgressMap = Record<string, AchievementProgress>;

function loadProgress(): ProgressMap {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? (JSON.parse(raw) as ProgressMap) : {};
  } catch {
    return {};
  }
}

function saveProgress(map: ProgressMap): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(map));
  } catch {
    // storage full or unavailable
  }
}

function getOrCreate(map: ProgressMap, id: string): AchievementProgress {
  if (!map[id]) {
    map[id] = { current: 0, unlocked: false };
  }
  return map[id];
}

export const AchievementService = {
  /**
   * Set the absolute progress for an achievement.
   * Returns the achievement def if it was just unlocked, null otherwise.
   */
  setProgress(id: string, value: number): AchievementDef | null {
    const def = ACHIEVEMENTS.find((a) => a.id === id);
    if (!def) return null;

    const map = loadProgress();
    const prog = getOrCreate(map, id);

    if (prog.unlocked) {
      saveProgress(map);
      return null;
    }

    prog.current = Math.max(prog.current, value);

    if (prog.current >= def.target && !prog.unlocked) {
      prog.unlocked = true;
      prog.claimedAt = Date.now();
      saveProgress(map);
      return def;
    }

    saveProgress(map);
    return null;
  },

  /**
   * Increment progress by a delta amount.
   * Returns the achievement def if it was just unlocked.
   */
  increment(id: string, delta: number = 1): AchievementDef | null {
    const map = loadProgress();
    const prog = getOrCreate(map, id);
    return this.setProgress(id, prog.current + delta);
  },

  /** Get progress for a single achievement */
  getProgress(id: string): AchievementProgress {
    const map = loadProgress();
    return map[id] ?? { current: 0, unlocked: false };
  },

  /** Get all achievements with their progress */
  getAll(): Array<{ def: AchievementDef; progress: AchievementProgress }> {
    const map = loadProgress();
    return ACHIEVEMENTS.map((def) => ({
      def,
      progress: map[def.id] ?? { current: 0, unlocked: false },
    }));
  },

  /** Count of unlocked achievements */
  getUnlockedCount(): number {
    const map = loadProgress();
    return Object.values(map).filter((p) => p.unlocked).length;
  },

  /** Reset all achievement progress */
  resetAll(): void {
    try {
      localStorage.removeItem(STORAGE_KEY);
    } catch {
      // ignore
    }
  },
};
