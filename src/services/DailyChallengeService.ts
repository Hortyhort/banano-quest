/**
 * DailyChallengeService — Generates a daily challenge with date-seeded modifiers.
 * Each day picks a random level and applies one or more gameplay modifiers.
 */

const STORAGE_KEY = 'bananoquest_daily';

export type ChallengeModifier = 'low_gravity' | 'speed_run' | 'double_coins' | 'fragile';

export interface DailyChallenge {
  date: string; // YYYY-MM-DD
  worldIndex: number;
  levelIndex: number;
  modifiers: ChallengeModifier[];
  bonusCoins: number;
  completed: boolean;
}

const MODIFIER_DEFS: Record<ChallengeModifier, { name: string; description: string }> = {
  low_gravity: { name: 'Low Gravity', description: 'Gravity reduced by 40%' },
  speed_run: { name: 'Speed Run', description: 'Par time halved!' },
  double_coins: { name: 'Double Coins', description: 'All coins worth 2x' },
  fragile: { name: 'Fragile', description: 'One life only!' },
};

/** Simple seedable PRNG (mulberry32) */
function seededRandom(seed: number): () => number {
  return () => {
    seed |= 0;
    seed = (seed + 0x6d2b79f5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function dateToSeed(dateStr: string): number {
  let hash = 0;
  for (let i = 0; i < dateStr.length; i++) {
    const char = dateStr.charCodeAt(i);
    hash = ((hash << 5) - hash + char) | 0;
  }
  return hash;
}

function getTodayString(): string {
  const now = new Date();
  const y = now.getFullYear();
  const m = String(now.getMonth() + 1).padStart(2, '0');
  const d = String(now.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

const ALL_MODIFIERS: ChallengeModifier[] = ['low_gravity', 'speed_run', 'double_coins', 'fragile'];

// 3 worlds x 2 levels = 6 total levels
const TOTAL_WORLDS = 3;
const LEVELS_PER_WORLD = 2;

function generateChallenge(dateStr: string): DailyChallenge {
  const rng = seededRandom(dateToSeed(dateStr));

  const worldIndex = Math.floor(rng() * TOTAL_WORLDS);
  const levelIndex = Math.floor(rng() * LEVELS_PER_WORLD);

  // Pick 1-2 modifiers
  const modCount = rng() > 0.5 ? 2 : 1;
  const shuffled = [...ALL_MODIFIERS].sort(() => rng() - 0.5);
  const modifiers = shuffled.slice(0, modCount);

  const bonusCoins = 10 + modCount * 5;

  return {
    date: dateStr,
    worldIndex,
    levelIndex,
    modifiers,
    bonusCoins,
    completed: false,
  };
}

interface StoredDaily {
  date: string;
  completed: boolean;
}

function loadStored(): StoredDaily | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? (JSON.parse(raw) as StoredDaily) : null;
  } catch {
    return null;
  }
}

function saveStored(data: StoredDaily): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  } catch {
    // ignore
  }
}

export const DailyChallengeService = {
  /** Get today's challenge */
  getToday(): DailyChallenge {
    const today = getTodayString();
    const stored = loadStored();
    const challenge = generateChallenge(today);

    if (stored && stored.date === today) {
      challenge.completed = stored.completed;
    }

    return challenge;
  },

  /** Mark today's challenge as completed */
  complete(): void {
    const today = getTodayString();
    saveStored({ date: today, completed: true });
  },

  /** Check if today's challenge is done */
  isCompletedToday(): boolean {
    const today = getTodayString();
    const stored = loadStored();
    return stored !== null && stored.date === today && stored.completed;
  },

  /** Get modifier display info */
  getModifierInfo(mod: ChallengeModifier): { name: string; description: string } {
    return MODIFIER_DEFS[mod];
  },

  /** Get all modifier info for a challenge */
  getModifierInfoList(challenge: DailyChallenge): Array<{ name: string; description: string }> {
    return challenge.modifiers.map((m) => MODIFIER_DEFS[m]);
  },

  /** Reset stored data */
  resetAll(): void {
    try {
      localStorage.removeItem(STORAGE_KEY);
    } catch {
      // ignore
    }
  },
};
