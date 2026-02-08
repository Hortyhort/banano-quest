import { describe, it, expect, beforeEach } from 'vitest';
import { AchievementService, ACHIEVEMENTS } from '../../src/services/AchievementService.ts';

beforeEach(() => {
  localStorage.clear();
  AchievementService.resetAll();
});

describe('AchievementService', () => {
  it('has 15 achievements defined', () => {
    expect(ACHIEVEMENTS.length).toBe(15);
  });

  it('each achievement has required fields', () => {
    ACHIEVEMENTS.forEach((a) => {
      expect(a.id).toBeTruthy();
      expect(a.name).toBeTruthy();
      expect(a.description).toBeTruthy();
      expect(['collection', 'skill', 'discovery']).toContain(a.category);
      expect(a.target).toBeGreaterThan(0);
      expect(a.reward).toBeGreaterThan(0);
    });
  });

  it('returns 0 progress for new achievement', () => {
    const prog = AchievementService.getProgress('coin_10');
    expect(prog.current).toBe(0);
    expect(prog.unlocked).toBe(false);
  });

  it('setProgress updates current value', () => {
    AchievementService.setProgress('coin_10', 5);
    const prog = AchievementService.getProgress('coin_10');
    expect(prog.current).toBe(5);
    expect(prog.unlocked).toBe(false);
  });

  it('unlocks achievement when target reached', () => {
    const result = AchievementService.setProgress('coin_10', 10);
    expect(result).not.toBeNull();
    expect(result!.id).toBe('coin_10');
    const prog = AchievementService.getProgress('coin_10');
    expect(prog.unlocked).toBe(true);
  });

  it('returns null if already unlocked', () => {
    AchievementService.setProgress('coin_10', 10);
    const result = AchievementService.setProgress('coin_10', 20);
    expect(result).toBeNull();
  });

  it('increment adds delta', () => {
    AchievementService.increment('stomp_1');
    const prog = AchievementService.getProgress('stomp_1');
    expect(prog.current).toBe(1);
    expect(prog.unlocked).toBe(true);
  });

  it('getAll returns all achievements with progress', () => {
    const all = AchievementService.getAll();
    expect(all.length).toBe(15);
    all.forEach((entry) => {
      expect(entry.def).toBeDefined();
      expect(entry.progress).toBeDefined();
    });
  });

  it('getUnlockedCount counts unlocked', () => {
    expect(AchievementService.getUnlockedCount()).toBe(0);
    AchievementService.setProgress('coin_10', 10);
    expect(AchievementService.getUnlockedCount()).toBe(1);
    AchievementService.setProgress('stomp_1', 1);
    expect(AchievementService.getUnlockedCount()).toBe(2);
  });

  it('resetAll clears progress', () => {
    AchievementService.setProgress('coin_10', 10);
    AchievementService.resetAll();
    expect(AchievementService.getUnlockedCount()).toBe(0);
    expect(AchievementService.getProgress('coin_10').current).toBe(0);
  });
});
