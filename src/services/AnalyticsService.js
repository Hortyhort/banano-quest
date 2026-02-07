import { StorageService } from './StorageService.js';

/**
 * AnalyticsService — Lightweight local analytics for tracking player behavior.
 * Stores events in localStorage for analysis. No external services needed.
 * Events are batched and can be exported as JSON for review.
 */

const ANALYTICS_KEY = 'bananoquest_analytics';
const SESSION_KEY = 'bananoquest_session';
const MAX_EVENTS = 500;

class AnalyticsServiceClass {
  constructor() {
    this.sessionId = this._generateSessionId();
    this.sessionStart = Date.now();
    this.eventBuffer = [];
    this._startSession();
  }

  _generateSessionId() {
    return `s_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 6)}`;
  }

  _startSession() {
    this._updateSessionData((data) => {
      data.totalSessions = (data.totalSessions || 0) + 1;
      data.lastSessionStart = this.sessionStart;
      return data;
    });
  }

  // ── Event tracking ──

  track(eventName, properties = {}) {
    const event = {
      event: eventName,
      ts: Date.now(),
      session: this.sessionId,
      ...properties
    };

    this.eventBuffer.push(event);

    // Flush buffer every 5 events
    if (this.eventBuffer.length >= 5) {
      this.flush();
    }
  }

  flush() {
    if (this.eventBuffer.length === 0) return;

    try {
      const data = localStorage.getItem(ANALYTICS_KEY);
      const events = data ? JSON.parse(data) : [];
      events.push(...this.eventBuffer);

      // Keep only recent events to prevent storage bloat
      const trimmed = events.slice(-MAX_EVENTS);
      localStorage.setItem(ANALYTICS_KEY, JSON.stringify(trimmed));
      this.eventBuffer = [];
    } catch (e) {
      // Storage full or unavailable — silently drop events
      this.eventBuffer = [];
    }
  }

  // ── Convenience methods for common game events ──

  trackLevelStart(level) {
    this.track('level_start', { level });
  }

  trackLevelComplete(level, time, stars, coins, totalCoins) {
    this.track('level_complete', { level, time: Math.round(time), stars, coins, totalCoins });
  }

  trackLevelFail(level, deaths) {
    this.track('level_fail', { level, deaths });
  }

  trackDeath(level, x, y, cause) {
    this.track('death', { level, x: Math.round(x), y: Math.round(y), cause });
  }

  trackAchievementUnlock(achievementId) {
    this.track('achievement_unlock', { id: achievementId });
  }

  trackPowerUpCollect(level, type) {
    this.track('powerup_collect', { level, type });
  }

  trackBossEncounter(level, result) {
    this.track('boss_encounter', { level, result });
  }

  trackSkinEquip(skinId) {
    this.track('skin_equip', { skin: skinId });
  }

  trackMenuAction(action) {
    this.track('menu_action', { action });
  }

  // ── Session data ──

  _updateSessionData(fn) {
    try {
      const raw = localStorage.getItem(SESSION_KEY);
      const data = raw ? JSON.parse(raw) : {};
      const updated = fn(data);
      localStorage.setItem(SESSION_KEY, JSON.stringify(updated));
    } catch (e) {
      // Ignore
    }
  }

  endSession() {
    const duration = Math.round((Date.now() - this.sessionStart) / 1000);
    this.track('session_end', { duration });
    this.flush();

    this._updateSessionData((data) => {
      data.totalPlayTime = (data.totalPlayTime || 0) + duration;
      data.lastSessionEnd = Date.now();
      return data;
    });
  }

  // ── Reporting ──

  getSessionSummary() {
    try {
      const raw = localStorage.getItem(SESSION_KEY);
      return raw ? JSON.parse(raw) : {};
    } catch (e) {
      return {};
    }
  }

  getEvents() {
    try {
      const data = localStorage.getItem(ANALYTICS_KEY);
      return data ? JSON.parse(data) : [];
    } catch (e) {
      return [];
    }
  }

  getDeathHeatmap() {
    const events = this.getEvents().filter(e => e.event === 'death');
    const map = {};
    events.forEach(e => {
      const key = `${e.level}_${Math.round(e.x / 40)}_${Math.round(e.y / 40)}`;
      map[key] = (map[key] || 0) + 1;
    });
    return map;
  }

  getLevelCompletionRates() {
    const events = this.getEvents();
    const starts = {};
    const completes = {};

    events.forEach(e => {
      if (e.event === 'level_start') {
        starts[e.level] = (starts[e.level] || 0) + 1;
      }
      if (e.event === 'level_complete') {
        completes[e.level] = (completes[e.level] || 0) + 1;
      }
    });

    const rates = {};
    for (const level of Object.keys(starts)) {
      rates[level] = {
        starts: starts[level],
        completes: completes[level] || 0,
        rate: starts[level] ? ((completes[level] || 0) / starts[level] * 100).toFixed(1) + '%' : '0%'
      };
    }
    return rates;
  }

  exportJSON() {
    return JSON.stringify({
      session: this.getSessionSummary(),
      events: this.getEvents(),
      deathHeatmap: this.getDeathHeatmap(),
      completionRates: this.getLevelCompletionRates()
    }, null, 2);
  }

  clearAll() {
    localStorage.removeItem(ANALYTICS_KEY);
    localStorage.removeItem(SESSION_KEY);
  }
}

export const AnalyticsService = new AnalyticsServiceClass();
