import { describe, it, expect, beforeEach } from 'vitest';
import { LeaderboardService } from '../../src/services/LeaderboardService.ts';

beforeEach(() => {
  localStorage.clear();
  LeaderboardService.resetAll();
});

describe('LeaderboardService', () => {
  it('getGlobal returns empty initially', () => {
    expect(LeaderboardService.getGlobal()).toEqual([]);
  });

  it('getGlobalBest returns 0 initially', () => {
    expect(LeaderboardService.getGlobalBest()).toBe(0);
  });

  it('submit adds entry and returns ranks', () => {
    const result = LeaderboardService.submit(100, 0, 0, 2);
    expect(result.globalRank).toBe(1);
    expect(result.levelRank).toBe(1);
  });

  it('getGlobal returns entries sorted by score', () => {
    LeaderboardService.submit(100, 0, 0, 1);
    LeaderboardService.submit(300, 0, 1, 3);
    LeaderboardService.submit(200, 1, 0, 2);

    const global = LeaderboardService.getGlobal();
    expect(global.length).toBe(3);
    expect(global[0].score).toBe(300);
    expect(global[1].score).toBe(200);
    expect(global[2].score).toBe(100);
  });

  it('getLevel returns only entries for that level', () => {
    LeaderboardService.submit(100, 0, 0, 1);
    LeaderboardService.submit(200, 0, 1, 2);
    LeaderboardService.submit(150, 0, 0, 2);

    const level00 = LeaderboardService.getLevel(0, 0);
    expect(level00.length).toBe(2);
    expect(level00[0].score).toBe(150);

    const level01 = LeaderboardService.getLevel(0, 1);
    expect(level01.length).toBe(1);
  });

  it('getLevelBest returns highest score for level', () => {
    LeaderboardService.submit(100, 0, 0, 1);
    LeaderboardService.submit(250, 0, 0, 3);
    expect(LeaderboardService.getLevelBest(0, 0)).toBe(250);
  });

  it('getLevelBest returns 0 for unplayed level', () => {
    expect(LeaderboardService.getLevelBest(2, 1)).toBe(0);
  });

  it('limits to 10 entries per leaderboard', () => {
    for (let i = 0; i < 15; i++) {
      LeaderboardService.submit(i * 10, 0, 0, 1);
    }
    const global = LeaderboardService.getGlobal();
    expect(global.length).toBe(10);
    // Lowest should be 50 (scores 50..140 kept, 0..40 evicted)
    expect(global[9].score).toBe(50);
  });

  it('submit with name stores the name', () => {
    LeaderboardService.submit(100, 0, 0, 1, 'TestPlayer');
    const entries = LeaderboardService.getGlobal();
    expect(entries[0].name).toBe('TestPlayer');
  });

  it('submit without name uses default', () => {
    LeaderboardService.submit(100, 0, 0, 1);
    const entries = LeaderboardService.getGlobal();
    expect(entries[0].name).toBe('Player');
  });

  it('resetAll clears all data', () => {
    LeaderboardService.submit(100, 0, 0, 1);
    LeaderboardService.resetAll();
    expect(LeaderboardService.getGlobal()).toEqual([]);
    expect(LeaderboardService.getLevel(0, 0)).toEqual([]);
  });
});
