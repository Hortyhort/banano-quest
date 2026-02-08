import { describe, it, expect } from 'vitest';
import {
  GAME_WIDTH,
  GAME_HEIGHT,
  GRAVITY,
  PLAYER_SPEED,
  PLAYER_JUMP_VELOCITY,
  COYOTE_TIME_MS,
  JUMP_BUFFER_MS,
  JUMP_CUT_MULTIPLIER,
  COLORS,
  PLAYER,
  COIN,
  LEVELS,
  LEVEL_1_PLATFORMS,
  LEVEL_1_COINS,
} from '../../src/config/gameConfig.ts';
import type { PlatformData, CoinData, LevelData } from '../../src/config/gameConfig.ts';

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

  describe('player feel constants', () => {
    it('has positive coyote time', () => {
      expect(COYOTE_TIME_MS).toBeGreaterThan(0);
      expect(COYOTE_TIME_MS).toBeLessThan(200);
    });

    it('has positive jump buffer', () => {
      expect(JUMP_BUFFER_MS).toBeGreaterThan(0);
      expect(JUMP_BUFFER_MS).toBeLessThan(200);
    });

    it('has jump cut multiplier between 0 and 1', () => {
      expect(JUMP_CUT_MULTIPLIER).toBeGreaterThan(0);
      expect(JUMP_CUT_MULTIPLIER).toBeLessThan(1);
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
      expect(COLORS.SPIKE_RED).toBeDefined();
      expect(COLORS.ENEMY_PURPLE).toBeDefined();
      expect(COLORS.ENEMY_BLUE).toBeDefined();
      expect(COLORS.ENEMY_ORANGE).toBeDefined();
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

  describe('LEVELS', () => {
    it('has at least 2 levels', () => {
      expect(LEVELS.length).toBeGreaterThanOrEqual(2);
    });

    LEVELS.forEach((level: LevelData, index: number) => {
      describe(`Level ${index + 1}`, () => {
        it('has platforms', () => {
          expect(level.platforms.length).toBeGreaterThan(0);
        });

        it('has coins', () => {
          expect(level.coins.length).toBeGreaterThan(0);
        });

        it('has enemies', () => {
          expect(level.enemies.length).toBeGreaterThan(0);
        });

        it('has a scrolling world wider than viewport', () => {
          expect(level.worldWidth).toBeGreaterThan(GAME_WIDTH);
        });

        it('has valid start position', () => {
          expect(level.startX).toBeGreaterThanOrEqual(0);
          expect(level.startX).toBeLessThanOrEqual(level.worldWidth);
          expect(level.startY).toBeGreaterThanOrEqual(0);
          expect(level.startY).toBeLessThanOrEqual(GAME_HEIGHT);
        });

        it('all platforms have positive dimensions', () => {
          level.platforms.forEach((p: PlatformData) => {
            expect(p.width).toBeGreaterThan(0);
            expect(p.height).toBeGreaterThan(0);
          });
        });

        it('all platforms are within world bounds', () => {
          level.platforms.forEach((p: PlatformData) => {
            expect(p.x).toBeGreaterThanOrEqual(0);
            expect(p.x).toBeLessThanOrEqual(level.worldWidth);
            expect(p.y).toBeGreaterThanOrEqual(0);
            expect(p.y).toBeLessThanOrEqual(GAME_HEIGHT);
          });
        });

        it('all coins are within world bounds', () => {
          level.coins.forEach((c: CoinData) => {
            expect(c.x).toBeGreaterThanOrEqual(0);
            expect(c.x).toBeLessThanOrEqual(level.worldWidth);
            expect(c.y).toBeGreaterThanOrEqual(0);
            expect(c.y).toBeLessThanOrEqual(GAME_HEIGHT);
          });
        });

        it('all enemies have valid types', () => {
          level.enemies.forEach((e) => {
            expect(['walker', 'jumper', 'flyer']).toContain(e.type);
          });
        });
      });
    });
  });

  describe('backwards compatibility exports', () => {
    it('LEVEL_1_PLATFORMS matches LEVELS[0].platforms', () => {
      expect(LEVEL_1_PLATFORMS).toBe(LEVELS[0].platforms);
    });

    it('LEVEL_1_COINS matches LEVELS[0].coins', () => {
      expect(LEVEL_1_COINS).toBe(LEVELS[0].coins);
    });
  });
});
