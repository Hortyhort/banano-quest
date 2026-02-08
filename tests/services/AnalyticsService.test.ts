import { describe, it, expect, beforeEach } from 'vitest';
import { AnalyticsService } from '../../src/services/AnalyticsService.ts';

beforeEach(() => {
  localStorage.clear();
  AnalyticsService.resetAll();
});

describe('AnalyticsService', () => {
  it('getData returns initial data structure', () => {
    const data = AnalyticsService.getData();
    expect(data.totalSessions).toBeGreaterThanOrEqual(0);
    expect(data.levelsStarted).toBe(0);
    expect(data.levelsCompleted).toBe(0);
    expect(data.totalDeaths).toBe(0);
    expect(data.totalCoinsCollected).toBe(0);
    expect(data.totalStomps).toBe(0);
    expect(Array.isArray(data.events)).toBe(true);
  });

  it('trackLevelStart increments levelsStarted', () => {
    AnalyticsService.trackLevelStart(0, 0);
    AnalyticsService.trackLevelStart(0, 1);
    expect(AnalyticsService.getData().levelsStarted).toBe(2);
  });

  it('trackLevelComplete increments levelsCompleted', () => {
    AnalyticsService.trackLevelComplete(0, 0, 100, 2);
    expect(AnalyticsService.getData().levelsCompleted).toBe(1);
  });

  it('trackDeath increments totalDeaths', () => {
    AnalyticsService.trackDeath(0, 0);
    AnalyticsService.trackDeath(0, 0);
    expect(AnalyticsService.getData().totalDeaths).toBe(2);
  });

  it('trackCoinCollect accumulates coins', () => {
    AnalyticsService.trackCoinCollect(5);
    AnalyticsService.trackCoinCollect(3);
    expect(AnalyticsService.getData().totalCoinsCollected).toBe(8);
  });

  it('trackStomp increments totalStomps', () => {
    AnalyticsService.trackStomp();
    AnalyticsService.trackStomp();
    AnalyticsService.trackStomp();
    expect(AnalyticsService.getData().totalStomps).toBe(3);
  });

  it('trackEvent stores events', () => {
    AnalyticsService.trackEvent('test_event', { key: 'value' });
    const data = AnalyticsService.getData();
    const testEvents = data.events.filter((e) => e.type === 'test_event');
    expect(testEvents.length).toBe(1);
    expect(testEvents[0].data).toEqual({ key: 'value' });
  });

  it('getCompletionRate calculates correctly', () => {
    expect(AnalyticsService.getCompletionRate()).toBe(0);
    AnalyticsService.trackLevelStart(0, 0);
    AnalyticsService.trackLevelStart(0, 1);
    AnalyticsService.trackLevelComplete(0, 0, 100, 2);
    expect(AnalyticsService.getCompletionRate()).toBe(50);
  });

  it('getPlaytimeFormatted returns formatted string', () => {
    const result = AnalyticsService.getPlaytimeFormatted();
    expect(typeof result).toBe('string');
    expect(result).toMatch(/\d+m/);
  });

  it('resetAll clears all data', () => {
    AnalyticsService.trackLevelStart(0, 0);
    AnalyticsService.trackDeath(0, 0);
    AnalyticsService.resetAll();
    const data = AnalyticsService.getData();
    expect(data.levelsStarted).toBe(0);
    expect(data.totalDeaths).toBe(0);
  });
});
