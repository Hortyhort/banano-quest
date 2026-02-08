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

// ─── Level & World Data Types ───

export interface PlatformData {
  x: number;
  y: number;
  width: number;
  height: number;
  crumbling?: boolean; // Sky world: falls after stepped on
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

export interface WindZoneData {
  x: number;
  y: number;
  width: number;
  height: number;
  forceX: number;
  forceY: number;
}

export interface LevelData {
  platforms: PlatformData[];
  coins: CoinData[];
  enemies: EnemyData[];
  spikes: SpikeData[];
  windZones?: WindZoneData[];
  worldWidth: number;
  startX: number;
  startY: number;
  parTime: number; // seconds — 3-star threshold
}

export type WorldId = 'jungle' | 'ice' | 'sky';

export interface WorldTheme {
  id: WorldId;
  name: string;
  skyGradientTop: number;
  skyGradientBottom: number;
  groundColor: number;
  groundAccent: number;
  platformColor: number;
  platformAccent: number;
  hillColorA: number;
  hillColorB: number;
  friction: number; // 1 = normal, 0.3 = slippery ice
  bgmTrack: 'gameplay' | 'menu';
}

export interface WorldData {
  theme: WorldTheme;
  levels: LevelData[];
}

// ─── World Themes ───

export const WORLD_THEMES: Record<WorldId, WorldTheme> = {
  jungle: {
    id: 'jungle',
    name: 'Jungle',
    skyGradientTop: 0x87ceeb,
    skyGradientBottom: 0xb3e5fc,
    groundColor: 0x4caf50,
    groundAccent: 0x388e3c,
    platformColor: 0x6d4c41,
    platformAccent: 0x4e342e,
    hillColorA: 0x81c784,
    hillColorB: 0x66bb6a,
    friction: 1,
    bgmTrack: 'gameplay',
  },
  ice: {
    id: 'ice',
    name: 'Ice Caves',
    skyGradientTop: 0x1a237e,
    skyGradientBottom: 0x4fc3f7,
    groundColor: 0x90caf9,
    groundAccent: 0x42a5f5,
    platformColor: 0xb3e5fc,
    platformAccent: 0x81d4fa,
    hillColorA: 0xbbdefb,
    hillColorB: 0xe3f2fd,
    friction: 0.3,
    bgmTrack: 'gameplay',
  },
  sky: {
    id: 'sky',
    name: 'Sky Temples',
    skyGradientTop: 0xff8a65,
    skyGradientBottom: 0xffccbc,
    groundColor: 0xbcaaa4,
    groundAccent: 0x8d6e63,
    platformColor: 0xd7ccc8,
    platformAccent: 0xa1887f,
    hillColorA: 0xffab91,
    hillColorB: 0xff8a65,
    friction: 1,
    bgmTrack: 'gameplay',
  },
};

// ─── Jungle Levels (World 1) ───

const JUNGLE_1: LevelData = {
  worldWidth: 3840,
  startX: 100,
  startY: 500,
  parTime: 60,
  platforms: [
    { x: 400, y: 690, width: 800, height: 60 },
    { x: 1200, y: 690, width: 400, height: 60 },
    { x: 1750, y: 690, width: 500, height: 60 },
    { x: 2400, y: 690, width: 600, height: 60 },
    { x: 3100, y: 690, width: 400, height: 60 },
    { x: 3600, y: 690, width: 400, height: 60 },
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

const JUNGLE_2: LevelData = {
  worldWidth: 4480,
  startX: 100,
  startY: 500,
  parTime: 75,
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

// ─── Ice Caves Levels (World 2) ───

const ICE_1: LevelData = {
  worldWidth: 4000,
  startX: 100,
  startY: 500,
  parTime: 70,
  platforms: [
    // Wider ground (slippery = need room to brake)
    { x: 500, y: 690, width: 1000, height: 60 },
    { x: 1700, y: 690, width: 600, height: 60 },
    { x: 2600, y: 690, width: 500, height: 60 },
    { x: 3500, y: 690, width: 700, height: 60 },
    // Floating ice platforms
    { x: 400, y: 520, width: 200, height: 32 },
    { x: 700, y: 440, width: 250, height: 32 },
    { x: 1100, y: 380, width: 200, height: 32 },
    { x: 1400, y: 500, width: 180, height: 32 },
    { x: 1700, y: 400, width: 220, height: 32 },
    { x: 2000, y: 320, width: 200, height: 32 },
    { x: 2300, y: 450, width: 250, height: 32 },
    { x: 2600, y: 370, width: 200, height: 32 },
    { x: 2900, y: 300, width: 180, height: 32 },
    { x: 3200, y: 420, width: 220, height: 32 },
    { x: 3500, y: 500, width: 250, height: 32 },
    { x: 3800, y: 380, width: 200, height: 32 },
  ],
  coins: [
    { x: 300, y: 640 },
    { x: 700, y: 390 },
    { x: 1100, y: 330 },
    { x: 1400, y: 450 },
    { x: 1700, y: 350 },
    { x: 2000, y: 270 },
    { x: 2300, y: 400 },
    { x: 2600, y: 320 },
    { x: 2900, y: 250 },
    { x: 3200, y: 370 },
    { x: 3500, y: 450 },
    { x: 3800, y: 330 },
  ],
  enemies: [
    { x: 500, y: 650, type: 'walker', patrolWidth: 400 },
    { x: 1100, y: 346, type: 'jumper' },
    { x: 1700, y: 650, type: 'walker', patrolWidth: 300 },
    { x: 2300, y: 416, type: 'jumper' },
    { x: 2600, y: 650, type: 'walker', patrolWidth: 250 },
    { x: 3200, y: 300, type: 'flyer' },
    { x: 3500, y: 650, type: 'walker', patrolWidth: 300 },
  ],
  spikes: [
    { x: 1250, y: 670, width: 128 },
    { x: 2150, y: 670, width: 64 },
    { x: 3050, y: 670, width: 128 },
  ],
};

const ICE_2: LevelData = {
  worldWidth: 4480,
  startX: 100,
  startY: 500,
  parTime: 80,
  platforms: [
    { x: 400, y: 690, width: 800, height: 60 },
    { x: 1400, y: 690, width: 400, height: 60 },
    { x: 2100, y: 690, width: 500, height: 60 },
    { x: 2900, y: 690, width: 400, height: 60 },
    { x: 3600, y: 690, width: 600, height: 60 },
    { x: 4300, y: 690, width: 300, height: 60 },
    { x: 350, y: 520, width: 180, height: 32 },
    { x: 650, y: 430, width: 220, height: 32 },
    { x: 1000, y: 360, width: 200, height: 32 },
    { x: 1300, y: 480, width: 180, height: 32 },
    { x: 1600, y: 380, width: 200, height: 32 },
    { x: 1900, y: 300, width: 250, height: 32 },
    { x: 2200, y: 430, width: 180, height: 32 },
    { x: 2500, y: 350, width: 200, height: 32 },
    { x: 2800, y: 280, width: 180, height: 32 },
    { x: 3100, y: 420, width: 220, height: 32 },
    { x: 3400, y: 340, width: 200, height: 32 },
    { x: 3700, y: 460, width: 250, height: 32 },
    { x: 4000, y: 350, width: 180, height: 32 },
    { x: 4300, y: 450, width: 200, height: 32 },
  ],
  coins: [
    { x: 300, y: 640 },
    { x: 650, y: 380 },
    { x: 1000, y: 310 },
    { x: 1300, y: 430 },
    { x: 1600, y: 330 },
    { x: 1900, y: 250 },
    { x: 2200, y: 380 },
    { x: 2500, y: 300 },
    { x: 2800, y: 230 },
    { x: 3100, y: 370 },
    { x: 3400, y: 290 },
    { x: 3700, y: 410 },
    { x: 4000, y: 300 },
    { x: 4300, y: 400 },
  ],
  enemies: [
    { x: 400, y: 650, type: 'walker', patrolWidth: 350 },
    { x: 1000, y: 326, type: 'jumper' },
    { x: 1500, y: 280, type: 'flyer' },
    { x: 2100, y: 650, type: 'walker', patrolWidth: 300 },
    { x: 2500, y: 316, type: 'jumper' },
    { x: 2900, y: 650, type: 'walker', patrolWidth: 250 },
    { x: 3300, y: 260, type: 'flyer' },
    { x: 3600, y: 650, type: 'walker', patrolWidth: 300 },
    { x: 4000, y: 316, type: 'jumper' },
  ],
  spikes: [
    { x: 900, y: 670, width: 128 },
    { x: 1700, y: 670, width: 64 },
    { x: 2500, y: 670, width: 128 },
    { x: 3200, y: 670, width: 64 },
    { x: 4100, y: 670, width: 128 },
  ],
};

// ─── Sky Temple Levels (World 3) ───

const SKY_1: LevelData = {
  worldWidth: 4000,
  startX: 100,
  startY: 500,
  parTime: 65,
  platforms: [
    // Smaller ground segments — more floating
    { x: 300, y: 690, width: 600, height: 60 },
    { x: 1200, y: 690, width: 300, height: 60 },
    { x: 2200, y: 690, width: 400, height: 60 },
    { x: 3400, y: 690, width: 500, height: 60 },
    // Crumbling platforms (fall after stepping on)
    { x: 700, y: 550, width: 150, height: 32, crumbling: true },
    { x: 950, y: 470, width: 150, height: 32, crumbling: true },
    { x: 1200, y: 400, width: 180, height: 32 },
    { x: 1500, y: 500, width: 150, height: 32, crumbling: true },
    { x: 1750, y: 420, width: 180, height: 32 },
    { x: 2000, y: 340, width: 150, height: 32, crumbling: true },
    { x: 2250, y: 450, width: 200, height: 32 },
    { x: 2500, y: 370, width: 150, height: 32, crumbling: true },
    { x: 2750, y: 300, width: 180, height: 32 },
    { x: 3000, y: 420, width: 150, height: 32, crumbling: true },
    { x: 3250, y: 340, width: 200, height: 32 },
    { x: 3500, y: 500, width: 250, height: 32 },
    { x: 3800, y: 400, width: 200, height: 32 },
  ],
  coins: [
    { x: 200, y: 640 },
    { x: 700, y: 500 },
    { x: 950, y: 420 },
    { x: 1200, y: 350 },
    { x: 1500, y: 450 },
    { x: 1750, y: 370 },
    { x: 2000, y: 290 },
    { x: 2500, y: 320 },
    { x: 2750, y: 250 },
    { x: 3000, y: 370 },
    { x: 3500, y: 450 },
    { x: 3800, y: 350 },
  ],
  enemies: [
    { x: 300, y: 650, type: 'walker', patrolWidth: 250 },
    { x: 1200, y: 366, type: 'jumper' },
    { x: 1750, y: 300, type: 'flyer' },
    { x: 2200, y: 650, type: 'walker', patrolWidth: 200 },
    { x: 2750, y: 270, type: 'flyer' },
    { x: 3400, y: 650, type: 'walker', patrolWidth: 250 },
  ],
  spikes: [
    { x: 850, y: 670, width: 64 },
    { x: 1600, y: 670, width: 64 },
    { x: 2700, y: 670, width: 128 },
  ],
  windZones: [
    { x: 1300, y: 200, width: 400, height: 500, forceX: 150, forceY: 0 },
    { x: 2800, y: 100, width: 300, height: 600, forceX: -120, forceY: -50 },
  ],
};

const SKY_2: LevelData = {
  worldWidth: 4480,
  startX: 100,
  startY: 500,
  parTime: 85,
  platforms: [
    { x: 300, y: 690, width: 500, height: 60 },
    { x: 1100, y: 690, width: 300, height: 60 },
    { x: 2000, y: 690, width: 300, height: 60 },
    { x: 3000, y: 690, width: 400, height: 60 },
    { x: 4100, y: 690, width: 400, height: 60 },
    // Many crumbling platforms
    { x: 650, y: 550, width: 150, height: 32, crumbling: true },
    { x: 900, y: 460, width: 130, height: 32, crumbling: true },
    { x: 1150, y: 380, width: 180, height: 32 },
    { x: 1400, y: 480, width: 130, height: 32, crumbling: true },
    { x: 1650, y: 400, width: 150, height: 32, crumbling: true },
    { x: 1900, y: 320, width: 180, height: 32 },
    { x: 2150, y: 440, width: 130, height: 32, crumbling: true },
    { x: 2400, y: 360, width: 150, height: 32 },
    { x: 2650, y: 280, width: 180, height: 32, crumbling: true },
    { x: 2900, y: 400, width: 150, height: 32 },
    { x: 3150, y: 320, width: 200, height: 32, crumbling: true },
    { x: 3400, y: 440, width: 180, height: 32 },
    { x: 3650, y: 360, width: 150, height: 32, crumbling: true },
    { x: 3900, y: 280, width: 200, height: 32 },
    { x: 4200, y: 450, width: 250, height: 32 },
  ],
  coins: [
    { x: 200, y: 640 },
    { x: 650, y: 500 },
    { x: 900, y: 410 },
    { x: 1150, y: 330 },
    { x: 1400, y: 430 },
    { x: 1650, y: 350 },
    { x: 1900, y: 270 },
    { x: 2150, y: 390 },
    { x: 2400, y: 310 },
    { x: 2650, y: 230 },
    { x: 2900, y: 350 },
    { x: 3400, y: 390 },
    { x: 3900, y: 230 },
    { x: 4200, y: 400 },
  ],
  enemies: [
    { x: 300, y: 650, type: 'walker', patrolWidth: 250 },
    { x: 900, y: 300, type: 'flyer' },
    { x: 1400, y: 446, type: 'jumper' },
    { x: 2000, y: 650, type: 'walker', patrolWidth: 200 },
    { x: 2400, y: 260, type: 'flyer' },
    { x: 2900, y: 366, type: 'jumper' },
    { x: 3400, y: 300, type: 'flyer' },
    { x: 4100, y: 650, type: 'walker', patrolWidth: 200 },
  ],
  spikes: [
    { x: 800, y: 670, width: 64 },
    { x: 1500, y: 670, width: 128 },
    { x: 2500, y: 670, width: 64 },
    { x: 3500, y: 670, width: 128 },
  ],
  windZones: [
    { x: 600, y: 100, width: 300, height: 600, forceX: 200, forceY: 0 },
    { x: 1800, y: 100, width: 400, height: 600, forceX: -150, forceY: -80 },
    { x: 3200, y: 200, width: 350, height: 500, forceX: 180, forceY: -40 },
  ],
};

// ─── World definitions ───

export const WORLDS: WorldData[] = [
  { theme: WORLD_THEMES.jungle, levels: [JUNGLE_1, JUNGLE_2] },
  { theme: WORLD_THEMES.ice, levels: [ICE_1, ICE_2] },
  { theme: WORLD_THEMES.sky, levels: [SKY_1, SKY_2] },
];

// Flat list of all levels (for backwards compat and total count)
export const LEVELS: LevelData[] = WORLDS.flatMap((w) => w.levels);

// Backwards compat
export const LEVEL_1_PLATFORMS = WORLDS[0].levels[0].platforms;
export const LEVEL_1_COINS = WORLDS[0].levels[0].coins;
