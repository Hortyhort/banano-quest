import { describe, it, expect, beforeEach } from 'vitest';
import { StreakService } from '../../src/services/StreakService.ts';

beforeEach(() => {
  localStorage.clear();
  StreakService.resetAll();
});

describe('StreakService', () => {
  it('getCurrentStreak returns 0 initially', () => {
    expect(StreakService.getCurrentStreak()).toBe(0);
  });

  it('recordPlay starts a streak of 1', () => {
    const result = StreakService.recordPlay();
    expect(result).toBe(1);
    expect(StreakService.getCurrentStreak()).toBe(1);
  });

  it('recordPlay same day returns same streak', () => {
    StreakService.recordPlay();
    const result = StreakService.recordPlay();
    expect(result).toBe(1);
  });

  it('getLongestStreak tracks max', () => {
    StreakService.recordPlay();
    expect(StreakService.getLongestStreak()).toBe(1);
  });

  it('getCoinMultiplier returns 1 for streak < 3', () => {
    expect(StreakService.getCoinMultiplier()).toBe(1);
    StreakService.recordPlay();
    expect(StreakService.getCoinMultiplier()).toBe(1);
  });

  it('getData returns streak data object', () => {
    const data = StreakService.getData();
    expect(data).toBeDefined();
    expect(typeof data.currentStreak).toBe('number');
    expect(typeof data.lastPlayDate).toBe('string');
    expect(typeof data.longestStreak).toBe('number');
  });

  it('resetAll clears streak data', () => {
    StreakService.recordPlay();
    StreakService.resetAll();
    expect(StreakService.getCurrentStreak()).toBe(0);
    expect(StreakService.getLongestStreak()).toBe(0);
  });
});
