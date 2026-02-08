const STORAGE_KEY = 'bananoquest_analytics';

export interface AnalyticsData {
  totalSessions: number;
  totalPlaytimeMs: number;
  levelsStarted: number;
  levelsCompleted: number;
  totalDeaths: number;
  totalCoinsCollected: number;
  totalStomps: number;
  firstPlayDate: string;
  lastPlayDate: string;
  events: AnalyticsEvent[];
}

export interface AnalyticsEvent {
  type: string;
  timestamp: number;
  data?: Record<string, unknown>;
}

const MAX_EVENTS = 100;

class AnalyticsServiceClass {
  private data: AnalyticsData;
  private sessionStart: number;

  constructor() {
    this.sessionStart = Date.now();
    this.data = this.load();
    this.data.totalSessions++;
    this.data.lastPlayDate = new Date().toISOString().slice(0, 10);
    if (!this.data.firstPlayDate) {
      this.data.firstPlayDate = this.data.lastPlayDate;
    }
    this.save();
  }

  private load(): AnalyticsData {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) return JSON.parse(raw) as AnalyticsData;
    } catch {
      // ignore
    }
    return {
      totalSessions: 0,
      totalPlaytimeMs: 0,
      levelsStarted: 0,
      levelsCompleted: 0,
      totalDeaths: 0,
      totalCoinsCollected: 0,
      totalStomps: 0,
      firstPlayDate: '',
      lastPlayDate: '',
      events: [],
    };
  }

  private save(): void {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(this.data));
    } catch {
      // Storage full or unavailable
    }
  }

  trackEvent(type: string, data?: Record<string, unknown>): void {
    this.data.events.push({ type, timestamp: Date.now(), data });
    if (this.data.events.length > MAX_EVENTS) {
      this.data.events = this.data.events.slice(-MAX_EVENTS);
    }
    this.save();
  }

  trackLevelStart(worldIndex: number, levelIndex: number): void {
    this.data.levelsStarted++;
    this.trackEvent('level_start', { worldIndex, levelIndex });
  }

  trackLevelComplete(worldIndex: number, levelIndex: number, score: number, stars: number): void {
    this.data.levelsCompleted++;
    this.trackEvent('level_complete', { worldIndex, levelIndex, score, stars });
  }

  trackDeath(worldIndex: number, levelIndex: number): void {
    this.data.totalDeaths++;
    this.trackEvent('death', { worldIndex, levelIndex });
  }

  trackCoinCollect(count: number): void {
    this.data.totalCoinsCollected += count;
    this.save();
  }

  trackStomp(): void {
    this.data.totalStomps++;
    this.save();
  }

  updatePlaytime(): void {
    const now = Date.now();
    this.data.totalPlaytimeMs += now - this.sessionStart;
    this.sessionStart = now;
    this.save();
  }

  getData(): AnalyticsData {
    return { ...this.data };
  }

  getPlaytimeFormatted(): string {
    const totalMs = this.data.totalPlaytimeMs + (Date.now() - this.sessionStart);
    const hours = Math.floor(totalMs / 3600000);
    const minutes = Math.floor((totalMs % 3600000) / 60000);
    if (hours > 0) return `${hours}h ${minutes}m`;
    return `${minutes}m`;
  }

  getCompletionRate(): number {
    if (this.data.levelsStarted === 0) return 0;
    return Math.round((this.data.levelsCompleted / this.data.levelsStarted) * 100);
  }

  resetAll(): void {
    this.data = {
      totalSessions: 0,
      totalPlaytimeMs: 0,
      levelsStarted: 0,
      levelsCompleted: 0,
      totalDeaths: 0,
      totalCoinsCollected: 0,
      totalStomps: 0,
      firstPlayDate: '',
      lastPlayDate: '',
      events: [],
    };
    this.sessionStart = Date.now();
    localStorage.removeItem(STORAGE_KEY);
  }
}

export const AnalyticsService = new AnalyticsServiceClass();
