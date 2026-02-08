const STORAGE_KEY = 'bananoquest_leaderboard';

export interface LeaderboardEntry {
  name: string;
  score: number;
  worldIndex: number;
  levelIndex: number;
  stars: number;
  timestamp: number;
}

interface LeaderboardData {
  global: LeaderboardEntry[];
  levels: Record<string, LeaderboardEntry[]>; // "0-1" -> entries
}

const MAX_ENTRIES = 10;
const DEFAULT_NAME = 'Player';

class LeaderboardServiceClass {
  private data: LeaderboardData = { global: [], levels: {} };

  constructor() {
    this.load();
  }

  private load(): void {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) {
        this.data = JSON.parse(raw) as LeaderboardData;
      }
    } catch {
      this.data = { global: [], levels: {} };
    }
  }

  private save(): void {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(this.data));
    } catch {
      // Storage full or unavailable
    }
  }

  private insertSorted(list: LeaderboardEntry[], entry: LeaderboardEntry): LeaderboardEntry[] {
    const updated = [...list, entry].sort((a, b) => b.score - a.score);
    return updated.slice(0, MAX_ENTRIES);
  }

  submit(
    score: number,
    worldIndex: number,
    levelIndex: number,
    stars: number,
    name?: string
  ): { globalRank: number; levelRank: number } {
    const entry: LeaderboardEntry = {
      name: name || DEFAULT_NAME,
      score,
      worldIndex,
      levelIndex,
      stars,
      timestamp: Date.now(),
    };

    // Global leaderboard
    this.data.global = this.insertSorted(this.data.global, entry);
    const globalRank = this.data.global.findIndex(
      (e) => e.timestamp === entry.timestamp && e.score === entry.score
    );

    // Level leaderboard
    const key = `${worldIndex}-${levelIndex}`;
    if (!this.data.levels[key]) {
      this.data.levels[key] = [];
    }
    this.data.levels[key] = this.insertSorted(this.data.levels[key], entry);
    const levelRank = this.data.levels[key].findIndex(
      (e) => e.timestamp === entry.timestamp && e.score === entry.score
    );

    this.save();

    return {
      globalRank: globalRank >= 0 ? globalRank + 1 : -1,
      levelRank: levelRank >= 0 ? levelRank + 1 : -1,
    };
  }

  getGlobal(): LeaderboardEntry[] {
    return [...this.data.global];
  }

  getLevel(worldIndex: number, levelIndex: number): LeaderboardEntry[] {
    const key = `${worldIndex}-${levelIndex}`;
    return [...(this.data.levels[key] ?? [])];
  }

  getGlobalBest(): number {
    return this.data.global.length > 0 ? this.data.global[0].score : 0;
  }

  getLevelBest(worldIndex: number, levelIndex: number): number {
    const entries = this.getLevel(worldIndex, levelIndex);
    return entries.length > 0 ? entries[0].score : 0;
  }

  resetAll(): void {
    this.data = { global: [], levels: {} };
    localStorage.removeItem(STORAGE_KEY);
  }
}

export const LeaderboardService = new LeaderboardServiceClass();
