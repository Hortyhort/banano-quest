// Game dimensions
export const GAME_WIDTH = 1280;
export const GAME_HEIGHT = 720;

// World dimensions (scrolling)
export const WORLD_WIDTH = 3840;
export const WORLD_HEIGHT = 720;

// Physics settings
export const GRAVITY = 800;
export const PLAYER_SPEED = 300;
export const PLAYER_JUMP_VELOCITY = -450;

// Player feel constants
export const COYOTE_TIME_MS = 80;
export const JUMP_BUFFER_MS = 100;
export const JUMP_CUT_MULTIPLIER = 0.4;

// Color palette
export const COLORS = {
  SKY_BLUE: 0x87ceeb,
  GRASS_GREEN: 0x4caf50,
  BANANO_YELLOW: 0xffeb3b,
  MONKEY_ORANGE: 0xff9800,
  MONKEY_BROWN: 0x795548,
  PLATFORM_DARK: 0x388e3c,
  SPIKE_RED: 0xff1744,
  ENEMY_PURPLE: 0x9c27b0,
  ENEMY_BLUE: 0x2196f3,
  ENEMY_ORANGE: 0xff5722,
  UI_TEXT: '#FFFFFF',
  UI_SHADOW: '#000000',
} as const;

// Player settings
export const PLAYER = {
  WIDTH: 48,
  HEIGHT: 64,
  START_X: 100,
  START_Y: 500,
} as const;

// Coin settings
export const COIN = {
  RADIUS: 20,
  SCORE_VALUE: 10,
} as const;

// Level data types
export interface PlatformData {
  x: number;
  y: number;
  width: number;
  height: number;
}

export interface CoinData {
  x: number;
  y: number;
}

export interface EnemyData {
  x: number;
  y: number;
  type: 'walker' | 'jumper' | 'flyer';
  patrolWidth?: number;
}

export interface SpikeData {
  x: number;
  y: number;
  width: number;
}

export interface LevelData {
  platforms: PlatformData[];
  coins: CoinData[];
  enemies: EnemyData[];
  spikes: SpikeData[];
  worldWidth: number;
  startX: number;
  startY: number;
}

// Level 1 — Tutorial: gentle platforming, walkers only
export const LEVEL_1: LevelData = {
  worldWidth: 3840,
  startX: 100,
  startY: 500,
  platforms: [
    // Ground segments with gaps (pits!)
    { x: 400, y: 690, width: 800, height: 60 },
    { x: 1200, y: 690, width: 400, height: 60 },
    { x: 1750, y: 690, width: 500, height: 60 },
    { x: 2400, y: 690, width: 600, height: 60 },
    { x: 3100, y: 690, width: 400, height: 60 },
    { x: 3600, y: 690, width: 400, height: 60 },
    // Floating platforms
    { x: 300, y: 550, width: 200, height: 32 },
    { x: 600, y: 480, width: 150, height: 32 },
    { x: 900, y: 420, width: 180, height: 32 },
    { x: 1150, y: 500, width: 200, height: 32 },
    { x: 1400, y: 420, width: 150, height: 32 },
    { x: 1650, y: 350, width: 200, height: 32 },
    { x: 1950, y: 500, width: 150, height: 32 },
    { x: 2150, y: 420, width: 180, height: 32 },
    { x: 2400, y: 350, width: 150, height: 32 },
    { x: 2650, y: 450, width: 200, height: 32 },
    { x: 2900, y: 380, width: 150, height: 32 },
    { x: 3150, y: 300, width: 200, height: 32 },
    { x: 3400, y: 400, width: 180, height: 32 },
    { x: 3650, y: 500, width: 200, height: 32 },
  ],
  coins: [
    { x: 200, y: 640 },
    { x: 400, y: 640 },
    { x: 600, y: 430 },
    { x: 950, y: 600 },
    { x: 1150, y: 450 },
    { x: 1400, y: 370 },
    { x: 1650, y: 300 },
    { x: 1950, y: 450 },
    { x: 2150, y: 370 },
    { x: 2400, y: 300 },
    { x: 2650, y: 400 },
    { x: 2900, y: 330 },
    { x: 3150, y: 250 },
    { x: 3400, y: 350 },
    { x: 3650, y: 450 },
  ],
  enemies: [
    { x: 400, y: 650, type: 'walker', patrolWidth: 300 },
    { x: 1200, y: 650, type: 'walker', patrolWidth: 200 },
    { x: 1650, y: 316, type: 'walker', patrolWidth: 150 },
    { x: 2400, y: 650, type: 'walker', patrolWidth: 250 },
    { x: 2650, y: 416, type: 'jumper' },
    { x: 3100, y: 650, type: 'walker', patrolWidth: 200 },
  ],
  spikes: [
    { x: 1050, y: 670, width: 64 },
    { x: 2050, y: 670, width: 64 },
    { x: 2800, y: 670, width: 128 },
  ],
};

// Level 2 — Ramp up: all enemy types, more pits
export const LEVEL_2: LevelData = {
  worldWidth: 4480,
  startX: 100,
  startY: 500,
  platforms: [
    { x: 350, y: 690, width: 700, height: 60 },
    { x: 1100, y: 690, width: 300, height: 60 },
    { x: 1700, y: 690, width: 400, height: 60 },
    { x: 2400, y: 690, width: 300, height: 60 },
    { x: 3000, y: 690, width: 400, height: 60 },
    { x: 3700, y: 690, width: 300, height: 60 },
    { x: 4200, y: 690, width: 400, height: 60 },
    { x: 500, y: 520, width: 150, height: 32 },
    { x: 800, y: 440, width: 130, height: 32 },
    { x: 1050, y: 380, width: 150, height: 32 },
    { x: 1300, y: 480, width: 130, height: 32 },
    { x: 1550, y: 400, width: 150, height: 32 },
    { x: 1800, y: 320, width: 180, height: 32 },
    { x: 2100, y: 450, width: 130, height: 32 },
    { x: 2350, y: 370, width: 150, height: 32 },
    { x: 2600, y: 500, width: 180, height: 32 },
    { x: 2850, y: 400, width: 130, height: 32 },
    { x: 3100, y: 320, width: 150, height: 32 },
    { x: 3400, y: 450, width: 180, height: 32 },
    { x: 3700, y: 380, width: 130, height: 32 },
    { x: 3950, y: 300, width: 150, height: 32 },
    { x: 4200, y: 450, width: 200, height: 32 },
  ],
  coins: [
    { x: 300, y: 640 },
    { x: 500, y: 470 },
    { x: 800, y: 390 },
    { x: 1050, y: 330 },
    { x: 1300, y: 430 },
    { x: 1550, y: 350 },
    { x: 1800, y: 270 },
    { x: 2100, y: 400 },
    { x: 2350, y: 320 },
    { x: 2600, y: 450 },
    { x: 2850, y: 350 },
    { x: 3100, y: 270 },
    { x: 3400, y: 400 },
    { x: 3700, y: 330 },
    { x: 3950, y: 250 },
    { x: 4200, y: 400 },
  ],
  enemies: [
    { x: 350, y: 650, type: 'walker', patrolWidth: 300 },
    { x: 1050, y: 346, type: 'jumper' },
    { x: 1500, y: 300, type: 'flyer' },
    { x: 1700, y: 650, type: 'walker', patrolWidth: 200 },
    { x: 2100, y: 416, type: 'jumper' },
    { x: 2500, y: 350, type: 'flyer' },
    { x: 3000, y: 650, type: 'walker', patrolWidth: 250 },
    { x: 3400, y: 416, type: 'jumper' },
    { x: 3800, y: 280, type: 'flyer' },
    { x: 4200, y: 650, type: 'walker', patrolWidth: 200 },
  ],
  spikes: [
    { x: 800, y: 670, width: 128 },
    { x: 1400, y: 670, width: 64 },
    { x: 2100, y: 670, width: 128 },
    { x: 2700, y: 670, width: 64 },
    { x: 3300, y: 670, width: 128 },
    { x: 4000, y: 670, width: 64 },
  ],
};

export const LEVELS: LevelData[] = [LEVEL_1, LEVEL_2];

// Backwards compat
export const LEVEL_1_PLATFORMS = LEVEL_1.platforms;
export const LEVEL_1_COINS = LEVEL_1.coins;
