import { describe, it, expect } from 'vitest';
import {
  GAME_WIDTH,
  GAME_HEIGHT,
  GRAVITY,
  PLAYER_SPEED,
  PLAYER_JUMP_VELOCITY,
  COLORS,
  PLAYER,
  COIN,
  LEVEL_1_PLATFORMS,
  LEVEL_1_COINS,
} from '../../src/config/gameConfig.ts';
import type { PlatformData, CoinData } from '../../src/config/gameConfig.ts';

describe('gameConfig', () => {
  describe('dimensions', () => {
    it('has standard 16:9 resolution', () => {
      expect(GAME_WIDTH).toBe(1280);
      expect(GAME_HEIGHT).toBe(720);
      expect(GAME_WIDTH / GAME_HEIGHT).toBeCloseTo(16 / 9, 1);
    });
  });

  describe('physics', () => {
    it('has reasonable gravity', () => {
      expect(GRAVITY).toBeGreaterThan(0);
      expect(GRAVITY).toBeLessThan(2000);
    });

    it('has positive player speed', () => {
      expect(PLAYER_SPEED).toBeGreaterThan(0);
    });

    it('has negative jump velocity (upward)', () => {
      expect(PLAYER_JUMP_VELOCITY).toBeLessThan(0);
    });
  });

  describe('COLORS', () => {
    it('has all required color keys', () => {
      expect(COLORS.SKY_BLUE).toBeDefined();
      expect(COLORS.GRASS_GREEN).toBeDefined();
      expect(COLORS.BANANO_YELLOW).toBeDefined();
      expect(COLORS.MONKEY_ORANGE).toBeDefined();
      expect(COLORS.MONKEY_BROWN).toBeDefined();
      expect(COLORS.PLATFORM_DARK).toBeDefined();
      expect(COLORS.UI_TEXT).toBe('#FFFFFF');
      expect(COLORS.UI_SHADOW).toBe('#000000');
    });
  });

  describe('PLAYER', () => {
    it('has positive dimensions', () => {
      expect(PLAYER.WIDTH).toBeGreaterThan(0);
      expect(PLAYER.HEIGHT).toBeGreaterThan(0);
    });

    it('has start position within game bounds', () => {
      expect(PLAYER.START_X).toBeGreaterThanOrEqual(0);
      expect(PLAYER.START_X).toBeLessThanOrEqual(GAME_WIDTH);
      expect(PLAYER.START_Y).toBeGreaterThanOrEqual(0);
      expect(PLAYER.START_Y).toBeLessThanOrEqual(GAME_HEIGHT);
    });
  });

  describe('COIN', () => {
    it('has positive radius', () => {
      expect(COIN.RADIUS).toBeGreaterThan(0);
    });

    it('has positive score value', () => {
      expect(COIN.SCORE_VALUE).toBeGreaterThan(0);
    });
  });

  describe('LEVEL_1_PLATFORMS', () => {
    it('has at least one platform (ground)', () => {
      expect(LEVEL_1_PLATFORMS.length).toBeGreaterThan(0);
    });

    it('has a ground platform spanning full width', () => {
      const ground = LEVEL_1_PLATFORMS.find((p: PlatformData) => p.height > 32);
      expect(ground).toBeDefined();
      expect(ground!.width).toBe(GAME_WIDTH);
    });

    it('all platforms are within game bounds', () => {
      LEVEL_1_PLATFORMS.forEach((p: PlatformData) => {
        expect(p.x).toBeGreaterThanOrEqual(0);
        expect(p.x).toBeLessThanOrEqual(GAME_WIDTH);
        expect(p.y).toBeGreaterThanOrEqual(0);
        expect(p.y).toBeLessThanOrEqual(GAME_HEIGHT);
      });
    });

    it('all platforms have positive dimensions', () => {
      LEVEL_1_PLATFORMS.forEach((p: PlatformData) => {
        expect(p.width).toBeGreaterThan(0);
        expect(p.height).toBeGreaterThan(0);
      });
    });
  });

  describe('LEVEL_1_COINS', () => {
    it('has coins to collect', () => {
      expect(LEVEL_1_COINS.length).toBeGreaterThan(0);
    });

    it('has 12 coins', () => {
      expect(LEVEL_1_COINS.length).toBe(12);
    });

    it('all coins are within game bounds', () => {
      LEVEL_1_COINS.forEach((c: CoinData) => {
        expect(c.x).toBeGreaterThanOrEqual(0);
        expect(c.x).toBeLessThanOrEqual(GAME_WIDTH);
        expect(c.y).toBeGreaterThanOrEqual(0);
        expect(c.y).toBeLessThanOrEqual(GAME_HEIGHT);
      });
    });
  });
});
