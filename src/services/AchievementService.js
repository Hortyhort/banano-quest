import { StorageService } from './StorageService.js';

const ACHIEVEMENT_DEFS = [
  { id: 'first_coin', name: 'First Taste', desc: 'Collect your first coin', check: s => s.totalCoins >= 1 },
  { id: 'coins_50', name: 'Coin Collector', desc: 'Collect 50 coins total', check: s => s.totalCoins >= 50 },
  { id: 'coins_200', name: 'Banana Hoarder', desc: 'Collect 200 coins total', check: s => s.totalCoins >= 200 },
  { id: 'coins_500', name: 'Golden Monkey', desc: 'Collect 500 coins total', check: s => s.totalCoins >= 500 },
  { id: 'level_2', name: 'Moving On', desc: 'Unlock Level 2', check: s => s.unlockedLevels >= 2 },
  { id: 'level_5', name: 'Jungle Master', desc: 'Complete the Jungle world', check: s => s.unlockedLevels >= 6 },
  { id: 'level_8', name: 'Cave Explorer', desc: 'Complete the Cave world', check: s => s.unlockedLevels >= 9 },
  { id: 'level_12', name: 'Sky Champion', desc: 'Complete all levels', check: s => s.unlockedLevels >= 13 },
  { id: 'score_100', name: 'Getting Started', desc: 'Score 100+ in a single level', check: (s, ctx) => ctx.score >= 100 },
  { id: 'score_300', name: 'High Roller', desc: 'Score 300+ in a single level', check: (s, ctx) => ctx.score >= 300 },
  { id: 'combo_3', name: 'Combo Starter', desc: 'Get a 3x combo', check: (s, ctx) => ctx.combo >= 3 },
  { id: 'combo_5', name: 'Combo Master', desc: 'Get a 5x combo', check: (s, ctx) => ctx.combo >= 5 },
  { id: 'combo_8', name: 'Combo Legend', desc: 'Get an 8x combo', check: (s, ctx) => ctx.combo >= 8 },
  { id: 'no_death', name: 'Untouchable', desc: 'Complete a level without dying', check: (s, ctx) => ctx.levelComplete && ctx.deaths === 0 },
  { id: 'stomp_enemy', name: 'Pest Control', desc: 'Stomp your first enemy', check: (s, ctx) => ctx.stomps >= 1 },
];

const STORAGE_KEY = 'bananoquest_achievements';

class AchievementServiceClass {
  constructor() {
    this.unlocked = this.load();
    this.pendingNotifications = [];
  }

  load() {
    try {
      const data = localStorage.getItem(STORAGE_KEY);
      return data ? JSON.parse(data) : [];
    } catch {
      return [];
    }
  }

  save() {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(this.unlocked));
    } catch { /* ignore */ }
  }

  check(context = {}) {
    const stats = StorageService.getStats();
    const newlyUnlocked = [];

    ACHIEVEMENT_DEFS.forEach(def => {
      if (this.unlocked.includes(def.id)) return;
      try {
        if (def.check(stats, context)) {
          this.unlocked.push(def.id);
          newlyUnlocked.push(def);
        }
      } catch { /* ignore check errors */ }
    });

    if (newlyUnlocked.length > 0) {
      this.save();
      this.pendingNotifications.push(...newlyUnlocked);
    }

    return newlyUnlocked;
  }

  getPending() {
    const pending = [...this.pendingNotifications];
    this.pendingNotifications = [];
    return pending;
  }

  getAll() {
    return ACHIEVEMENT_DEFS.map(def => ({
      ...def,
      unlocked: this.unlocked.includes(def.id)
    }));
  }

  getUnlockedCount() {
    return this.unlocked.length;
  }

  getTotalCount() {
    return ACHIEVEMENT_DEFS.length;
  }
}

export const AchievementService = new AchievementServiceClass();
