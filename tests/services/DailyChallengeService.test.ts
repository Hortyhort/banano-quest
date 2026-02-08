import { describe, it, expect, beforeEach } from 'vitest';
import { DailyChallengeService } from '../../src/services/DailyChallengeService.ts';

beforeEach(() => {
  localStorage.clear();
  DailyChallengeService.resetAll();
});

describe('DailyChallengeService', () => {
  it('getToday returns a challenge object', () => {
    const challenge = DailyChallengeService.getToday();
    expect(challenge.date).toBeTruthy();
    expect(challenge.worldIndex).toBeGreaterThanOrEqual(0);
    expect(challenge.worldIndex).toBeLessThan(3);
    expect(challenge.levelIndex).toBeGreaterThanOrEqual(0);
    expect(challenge.levelIndex).toBeLessThan(2);
    expect(challenge.modifiers.length).toBeGreaterThan(0);
    expect(challenge.bonusCoins).toBeGreaterThan(0);
    expect(challenge.completed).toBe(false);
  });

  it('returns same challenge on repeated calls', () => {
    const a = DailyChallengeService.getToday();
    const b = DailyChallengeService.getToday();
    expect(a.worldIndex).toBe(b.worldIndex);
    expect(a.levelIndex).toBe(b.levelIndex);
    expect(a.modifiers).toEqual(b.modifiers);
  });

  it('isCompletedToday returns false initially', () => {
    expect(DailyChallengeService.isCompletedToday()).toBe(false);
  });

  it('complete marks today as done', () => {
    DailyChallengeService.complete();
    expect(DailyChallengeService.isCompletedToday()).toBe(true);
  });

  it('getToday reflects completed state', () => {
    DailyChallengeService.complete();
    const challenge = DailyChallengeService.getToday();
    expect(challenge.completed).toBe(true);
  });

  it('getModifierInfo returns name and description', () => {
    const info = DailyChallengeService.getModifierInfo('low_gravity');
    expect(info.name).toBe('Low Gravity');
    expect(info.description).toBeTruthy();
  });

  it('modifiers are valid', () => {
    const validMods = ['low_gravity', 'speed_run', 'double_coins', 'fragile'];
    const challenge = DailyChallengeService.getToday();
    challenge.modifiers.forEach((m) => {
      expect(validMods).toContain(m);
    });
  });
});
