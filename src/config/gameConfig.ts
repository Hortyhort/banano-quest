// Game dimensions
export const GAME_WIDTH = 1280;
export const GAME_HEIGHT = 720;

// Physics settings
export const GRAVITY = 800;
export const PLAYER_SPEED = 300;
export const PLAYER_JUMP_VELOCITY = -450;

// Color palette
export const COLORS = {
  SKY_BLUE: 0x87ceeb,
  GRASS_GREEN: 0x4caf50,
  BANANO_YELLOW: 0xffeb3b,
  MONKEY_ORANGE: 0xff9800,
  MONKEY_BROWN: 0x795548,
  PLATFORM_DARK: 0x388e3c,
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

// Level 1 platform layout
export const LEVEL_1_PLATFORMS: PlatformData[] = [
  { x: 640, y: 690, width: 1280, height: 60 },
  { x: 200, y: 550, width: 200, height: 32 },
  { x: 500, y: 450, width: 200, height: 32 },
  { x: 800, y: 550, width: 200, height: 32 },
  { x: 1050, y: 450, width: 200, height: 32 },
  { x: 350, y: 350, width: 200, height: 32 },
  { x: 700, y: 300, width: 250, height: 32 },
  { x: 1000, y: 200, width: 200, height: 32 },
  { x: 150, y: 200, width: 150, height: 32 },
];

// Level 1 coin positions
export const LEVEL_1_COINS: CoinData[] = [
  { x: 200, y: 500 },
  { x: 500, y: 400 },
  { x: 800, y: 500 },
  { x: 1050, y: 400 },
  { x: 350, y: 300 },
  { x: 650, y: 250 },
  { x: 750, y: 250 },
  { x: 1000, y: 150 },
  { x: 150, y: 150 },
  { x: 640, y: 640 },
  { x: 900, y: 640 },
  { x: 400, y: 640 },
];
