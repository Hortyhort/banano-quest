// Game dimensions
export const GAME_WIDTH = 1280;
export const GAME_HEIGHT = 720;

// Physics settings
export const GRAVITY = 800;
export const PLAYER_SPEED = 300;
export const PLAYER_JUMP_VELOCITY = -480;

// Color palette
export const COLORS = {
  SKY_BLUE: 0x87CEEB,
  GRASS_GREEN: 0x4CAF50,
  BANANO_YELLOW: 0xFFEB3B,
  MONKEY_ORANGE: 0xFF9800,
  MONKEY_BROWN: 0x795548,
  PLATFORM_DARK: 0x388E3C,
  CAVE_BG: 0x2C3E50,
  CAVE_PLATFORM: 0x7F8C8D,
  SKY_BG_TOP: 0xB3E5FC,
  SKY_BG_BOTTOM: 0xE1F5FE,
  UI_TEXT: '#FFFFFF',
  UI_SHADOW: '#000000'
};

// Player settings
export const PLAYER = {
  WIDTH: 48,
  HEIGHT: 64,
  START_X: 100,
  START_Y: 500
};

// Coin settings
export const COIN = {
  RADIUS: 20,
  SCORE_VALUE: 10
};

// Combo system
export const COMBO = {
  WINDOW: 2000,      // ms to keep combo alive
  MULTIPLIERS: [1, 1.5, 2, 3, 4, 5], // index = combo count bracket
};

// Enemy stomp score
export const ENEMY_STOMP_SCORE = 25;

// --- LEVEL DATA ---

// World themes define visual parameters
export const WORLD_THEMES = {
  jungle: {
    name: 'Jungle',
    bgTop: 0x87CEEB,
    bgBottom: 0xB3E5FC,
    platformColor: 0x4CAF50,
    platformDark: 0x388E3C,
    grassColor: 0x66BB6A,
    groundColor: 0x388E3C,
    hillFar: 0x81C784,
    hillNear: 0x66BB6A,
    cloudColor: 0xFFFFFF,
  },
  cave: {
    name: 'Crystal Cave',
    bgTop: 0x1a1a2e,
    bgBottom: 0x2C3E50,
    platformColor: 0x607D8B,
    platformDark: 0x455A64,
    grassColor: 0x78909C,
    groundColor: 0x37474F,
    hillFar: 0x263238,
    hillNear: 0x37474F,
    cloudColor: 0x546E7A,
  }
};

/**
 * Each level defines:
 *   world: theme key
 *   platforms: [{x, y, width, height, ?moving, ?moveAxis, ?moveRange, ?moveSpeed, ?falling}]
 *   coins: [{x, y, ?value}]     value overrides default
 *   enemies: [{type, x, y, ?patrolDistance, ?amplitude, ?speed}]
 *   powerUps: [{type, x, y}]    SPEED | DOUBLE_JUMP | MAGNET | SHIELD
 *   spikes: [{x, y}]
 *   par: seconds for 3-star time
 */
export const LEVELS = [
  // ===== WORLD 1: JUNGLE =====

  // Level 1 - Tutorial: Just coins, basic platforms
  {
    world: 'jungle',
    par: 30,
    platforms: [
      { x: 640, y: 690, width: 1280, height: 60 },
      { x: 200, y: 550, width: 200, height: 32 },
      { x: 500, y: 450, width: 200, height: 32 },
      { x: 800, y: 550, width: 200, height: 32 },
      { x: 1050, y: 450, width: 200, height: 32 },
      { x: 350, y: 350, width: 200, height: 32 },
      { x: 700, y: 300, width: 250, height: 32 },
      { x: 1000, y: 200, width: 200, height: 32 },
      { x: 150, y: 200, width: 150, height: 32 },
    ],
    coins: [
      { x: 200, y: 500 }, { x: 500, y: 400 }, { x: 800, y: 500 },
      { x: 1050, y: 400 }, { x: 350, y: 300 }, { x: 650, y: 250 },
      { x: 750, y: 250 }, { x: 1000, y: 150 }, { x: 150, y: 150 },
      { x: 640, y: 640 }, { x: 900, y: 640 }, { x: 400, y: 640 },
    ],
    enemies: [],
    powerUps: [],
    spikes: [],
  },

  // Level 2 - First enemies: introduce patrol walkers
  {
    world: 'jungle',
    par: 35,
    platforms: [
      { x: 640, y: 690, width: 1280, height: 60 },
      { x: 200, y: 550, width: 250, height: 32 },
      { x: 550, y: 460, width: 200, height: 32 },
      { x: 900, y: 520, width: 250, height: 32 },
      { x: 1150, y: 420, width: 180, height: 32 },
      { x: 350, y: 340, width: 200, height: 32 },
      { x: 700, y: 280, width: 300, height: 32 },
      { x: 1050, y: 200, width: 200, height: 32 },
    ],
    coins: [
      { x: 150, y: 640 }, { x: 300, y: 640 }, { x: 550, y: 410 },
      { x: 850, y: 470 }, { x: 950, y: 470 }, { x: 1150, y: 370 },
      { x: 350, y: 290 }, { x: 650, y: 230 }, { x: 750, y: 230 },
      { x: 1050, y: 150 },
    ],
    enemies: [
      { type: 'walker', x: 900, y: 490, patrolDistance: 80 },
      { type: 'walker', x: 700, y: 250, patrolDistance: 100 },
    ],
    powerUps: [],
    spikes: [],
  },

  // Level 3 - Spikes and a shield power-up
  {
    world: 'jungle',
    par: 40,
    platforms: [
      { x: 640, y: 690, width: 1280, height: 60 },
      { x: 180, y: 550, width: 200, height: 32 },
      { x: 450, y: 480, width: 150, height: 32 },
      { x: 700, y: 550, width: 200, height: 32 },
      { x: 950, y: 450, width: 180, height: 32 },
      { x: 300, y: 350, width: 250, height: 32 },
      { x: 650, y: 280, width: 200, height: 32 },
      { x: 1000, y: 320, width: 200, height: 32 },
      { x: 1200, y: 220, width: 150, height: 32 },
      { x: 150, y: 180, width: 150, height: 32 },
    ],
    coins: [
      { x: 180, y: 500 }, { x: 450, y: 430 }, { x: 700, y: 500 },
      { x: 950, y: 400 }, { x: 250, y: 300 }, { x: 350, y: 300 },
      { x: 650, y: 230 }, { x: 1000, y: 270 }, { x: 1200, y: 170 },
      { x: 150, y: 130 }, { x: 500, y: 640 }, { x: 800, y: 640 },
    ],
    enemies: [
      { type: 'walker', x: 300, y: 320, patrolDistance: 80 },
      { type: 'walker', x: 640, y: 660, patrolDistance: 150 },
    ],
    powerUps: [
      { type: 'SHIELD', x: 1000, y: 280 },
    ],
    spikes: [
      { x: 560, y: 670 }, { x: 592, y: 670 }, { x: 624, y: 670 },
    ],
  },

  // Level 4 - Moving platforms and flyers
  {
    world: 'jungle',
    par: 45,
    platforms: [
      { x: 640, y: 690, width: 1280, height: 60 },
      { x: 180, y: 560, width: 200, height: 32 },
      { x: 450, y: 470, width: 150, height: 32, moving: true, moveAxis: 'x', moveRange: 100, moveSpeed: 60 },
      { x: 750, y: 520, width: 180, height: 32 },
      { x: 1000, y: 430, width: 150, height: 32, moving: true, moveAxis: 'y', moveRange: 80, moveSpeed: 40 },
      { x: 300, y: 350, width: 200, height: 32 },
      { x: 600, y: 260, width: 200, height: 32 },
      { x: 950, y: 200, width: 180, height: 32 },
      { x: 1200, y: 300, width: 150, height: 32 },
      { x: 150, y: 180, width: 150, height: 32, falling: true },
    ],
    coins: [
      { x: 180, y: 510 }, { x: 450, y: 420 }, { x: 750, y: 470 },
      { x: 1000, y: 380 }, { x: 250, y: 300 }, { x: 350, y: 300 },
      { x: 600, y: 210 }, { x: 950, y: 150 }, { x: 1200, y: 250 },
      { x: 150, y: 130 }, { x: 400, y: 640 }, { x: 900, y: 640 },
    ],
    enemies: [
      { type: 'walker', x: 300, y: 320, patrolDistance: 60 },
      { type: 'flyer', x: 500, y: 350, amplitude: 50, speed: 60 },
      { type: 'walker', x: 640, y: 660, patrolDistance: 100 },
    ],
    powerUps: [
      { type: 'DOUBLE_JUMP', x: 600, y: 220 },
    ],
    spikes: [
      { x: 830, y: 670 }, { x: 862, y: 670 },
    ],
  },

  // Level 5 - Jungle Boss Level: dense enemies, all mechanics
  {
    world: 'jungle',
    par: 50,
    platforms: [
      { x: 640, y: 690, width: 1280, height: 60 },
      { x: 150, y: 560, width: 180, height: 32 },
      { x: 400, y: 500, width: 150, height: 32, moving: true, moveAxis: 'x', moveRange: 80, moveSpeed: 70 },
      { x: 650, y: 560, width: 200, height: 32 },
      { x: 900, y: 480, width: 150, height: 32 },
      { x: 1100, y: 400, width: 180, height: 32, falling: true },
      { x: 300, y: 380, width: 200, height: 32 },
      { x: 550, y: 300, width: 150, height: 32, moving: true, moveAxis: 'y', moveRange: 60, moveSpeed: 50 },
      { x: 800, y: 260, width: 200, height: 32 },
      { x: 1050, y: 200, width: 180, height: 32 },
      { x: 150, y: 200, width: 150, height: 32 },
    ],
    coins: [
      { x: 150, y: 510 }, { x: 400, y: 450 }, { x: 600, y: 510 },
      { x: 700, y: 510 }, { x: 900, y: 430 }, { x: 1100, y: 350 },
      { x: 250, y: 330 }, { x: 350, y: 330 }, { x: 550, y: 250 },
      { x: 800, y: 210 }, { x: 1050, y: 150 }, { x: 150, y: 150 },
      { x: 500, y: 640 }, { x: 750, y: 640 },
    ],
    enemies: [
      { type: 'walker', x: 650, y: 530, patrolDistance: 60 },
      { type: 'walker', x: 300, y: 350, patrolDistance: 60 },
      { type: 'walker', x: 800, y: 230, patrolDistance: 70 },
      { type: 'flyer', x: 450, y: 420, amplitude: 40, speed: 70 },
      { type: 'flyer', x: 950, y: 320, amplitude: 50, speed: 80 },
    ],
    powerUps: [
      { type: 'MAGNET', x: 1050, y: 160 },
      { type: 'SHIELD', x: 300, y: 340 },
    ],
    spikes: [
      { x: 480, y: 670 }, { x: 512, y: 670 }, { x: 544, y: 670 },
      { x: 960, y: 670 }, { x: 992, y: 670 },
    ],
  },

  // ===== WORLD 2: CRYSTAL CAVE =====

  // Level 6 - Cave intro: darker theme, tighter spaces
  {
    world: 'cave',
    par: 35,
    platforms: [
      { x: 640, y: 690, width: 1280, height: 60 },
      { x: 200, y: 560, width: 180, height: 32 },
      { x: 450, y: 480, width: 160, height: 32 },
      { x: 700, y: 540, width: 200, height: 32 },
      { x: 950, y: 460, width: 160, height: 32 },
      { x: 1150, y: 380, width: 180, height: 32 },
      { x: 350, y: 360, width: 200, height: 32 },
      { x: 600, y: 280, width: 180, height: 32 },
      { x: 900, y: 240, width: 200, height: 32 },
      { x: 150, y: 200, width: 150, height: 32 },
    ],
    coins: [
      { x: 200, y: 510 }, { x: 450, y: 430 }, { x: 650, y: 490 },
      { x: 750, y: 490 }, { x: 950, y: 410 }, { x: 1150, y: 330 },
      { x: 350, y: 310 }, { x: 600, y: 230 }, { x: 900, y: 190 },
      { x: 150, y: 150 },
    ],
    enemies: [
      { type: 'walker', x: 700, y: 510, patrolDistance: 70 },
      { type: 'walker', x: 350, y: 330, patrolDistance: 60 },
    ],
    powerUps: [],
    spikes: [
      { x: 540, y: 670 }, { x: 572, y: 670 },
    ],
  },

  // Level 7 - Cave with moving platforms and flyers
  {
    world: 'cave',
    par: 45,
    platforms: [
      { x: 640, y: 690, width: 1280, height: 60 },
      { x: 180, y: 550, width: 160, height: 32 },
      { x: 400, y: 460, width: 140, height: 32, moving: true, moveAxis: 'y', moveRange: 80, moveSpeed: 45 },
      { x: 650, y: 520, width: 180, height: 32, falling: true },
      { x: 880, y: 450, width: 150, height: 32, moving: true, moveAxis: 'x', moveRange: 100, moveSpeed: 55 },
      { x: 1100, y: 380, width: 160, height: 32 },
      { x: 300, y: 340, width: 200, height: 32 },
      { x: 550, y: 260, width: 160, height: 32, falling: true },
      { x: 800, y: 220, width: 200, height: 32 },
      { x: 1050, y: 160, width: 180, height: 32 },
    ],
    coins: [
      { x: 180, y: 500 }, { x: 400, y: 410 }, { x: 650, y: 470 },
      { x: 880, y: 400 }, { x: 1100, y: 330 }, { x: 250, y: 290 },
      { x: 350, y: 290 }, { x: 550, y: 210 }, { x: 800, y: 170 },
      { x: 1050, y: 110 }, { x: 500, y: 640 }, { x: 750, y: 640 },
    ],
    enemies: [
      { type: 'walker', x: 300, y: 310, patrolDistance: 60 },
      { type: 'flyer', x: 600, y: 380, amplitude: 50, speed: 65 },
      { type: 'flyer', x: 900, y: 300, amplitude: 40, speed: 75 },
      { type: 'walker', x: 800, y: 190, patrolDistance: 70 },
    ],
    powerUps: [
      { type: 'SPEED', x: 1100, y: 340 },
    ],
    spikes: [
      { x: 400, y: 670 }, { x: 432, y: 670 }, { x: 464, y: 670 },
      { x: 896, y: 670 }, { x: 928, y: 670 },
    ],
  },

  // Level 8 - Cave gauntlet: high difficulty
  {
    world: 'cave',
    par: 55,
    platforms: [
      { x: 640, y: 690, width: 1280, height: 60 },
      { x: 150, y: 560, width: 150, height: 32 },
      { x: 350, y: 480, width: 120, height: 32, falling: true },
      { x: 550, y: 540, width: 140, height: 32, moving: true, moveAxis: 'x', moveRange: 80, moveSpeed: 65 },
      { x: 780, y: 460, width: 130, height: 32 },
      { x: 1000, y: 520, width: 150, height: 32, falling: true },
      { x: 1180, y: 420, width: 140, height: 32, moving: true, moveAxis: 'y', moveRange: 70, moveSpeed: 50 },
      { x: 280, y: 350, width: 160, height: 32 },
      { x: 500, y: 280, width: 140, height: 32, moving: true, moveAxis: 'x', moveRange: 90, moveSpeed: 55 },
      { x: 750, y: 220, width: 180, height: 32 },
      { x: 1000, y: 180, width: 150, height: 32 },
      { x: 150, y: 180, width: 130, height: 32 },
    ],
    coins: [
      { x: 150, y: 510 }, { x: 350, y: 430 }, { x: 550, y: 490 },
      { x: 780, y: 410 }, { x: 1000, y: 470 }, { x: 1180, y: 370 },
      { x: 280, y: 300 }, { x: 500, y: 230 }, { x: 700, y: 170 },
      { x: 800, y: 170 }, { x: 1000, y: 130 }, { x: 150, y: 130 },
      { x: 400, y: 640 }, { x: 650, y: 640 }, { x: 900, y: 640 },
    ],
    enemies: [
      { type: 'walker', x: 780, y: 430, patrolDistance: 40 },
      { type: 'walker', x: 280, y: 320, patrolDistance: 50 },
      { type: 'walker', x: 750, y: 190, patrolDistance: 60 },
      { type: 'flyer', x: 400, y: 400, amplitude: 40, speed: 70 },
      { type: 'flyer', x: 850, y: 300, amplitude: 50, speed: 80 },
      { type: 'flyer', x: 600, y: 150, amplitude: 30, speed: 60 },
    ],
    powerUps: [
      { type: 'DOUBLE_JUMP', x: 780, y: 420 },
      { type: 'SHIELD', x: 150, y: 140 },
    ],
    spikes: [
      { x: 320, y: 670 }, { x: 352, y: 670 }, { x: 384, y: 670 },
      { x: 576, y: 670 }, { x: 608, y: 670 },
      { x: 832, y: 670 }, { x: 864, y: 670 }, { x: 896, y: 670 },
    ],
  },
];

// Backwards compat aliases
export const LEVEL_1_PLATFORMS = LEVELS[0].platforms;
export const LEVEL_1_COINS = LEVELS[0].coins;
