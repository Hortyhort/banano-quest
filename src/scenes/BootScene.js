import Phaser from 'phaser';
import { GAME_WIDTH, GAME_HEIGHT, COLORS, COIN } from '../config/gameConfig.js';

export class BootScene extends Phaser.Scene {
  constructor() {
    super({ key: 'BootScene' });
  }

  preload() {
    const progressBar = this.add.graphics();
    const progressBox = this.add.graphics();
    progressBox.fillStyle(0x222222, 0.8);
    progressBox.fillRect(GAME_WIDTH / 2 - 160, GAME_HEIGHT / 2 - 25, 320, 50);

    this.add.text(GAME_WIDTH / 2, GAME_HEIGHT / 2 - 50, 'Loading...', {
      font: '24px Arial', color: '#ffffff'
    }).setOrigin(0.5);

    this.load.on('progress', (value) => {
      progressBar.clear();
      progressBar.fillStyle(COLORS.BANANO_YELLOW, 1);
      progressBar.fillRect(GAME_WIDTH / 2 - 150, GAME_HEIGHT / 2 - 15, 300 * value, 30);
    });

    this.load.on('complete', () => {
      progressBar.destroy();
      progressBox.destroy();
    });

    // Load monkey sprites
    this.load.svg('monkey', 'assets/monkey-0.svg', { width: 64, height: 78 });
    this.load.svg('monkey-walk-1', 'assets/monkey-1.svg', { width: 64, height: 78 });
    this.load.svg('monkey-walk-2', 'assets/monkey-2.svg', { width: 64, height: 78 });
    this.load.svg('monkey-jump', 'assets/monkey-3.svg', { width: 64, height: 78 });

    this.generateTextures();
  }

  generateTextures() {
    // Coin
    const coinG = this.make.graphics({ x: 0, y: 0, add: false });
    coinG.fillStyle(COLORS.BANANO_YELLOW);
    coinG.fillCircle(COIN.RADIUS, COIN.RADIUS, COIN.RADIUS);
    coinG.fillStyle(0xFFF176);
    coinG.fillCircle(COIN.RADIUS - 2, COIN.RADIUS - 2, COIN.RADIUS - 6);
    coinG.lineStyle(2, 0xFFA000);
    coinG.strokeCircle(COIN.RADIUS, COIN.RADIUS, COIN.RADIUS - 1);
    coinG.generateTexture('coin', COIN.RADIUS * 2, COIN.RADIUS * 2);
    coinG.destroy();

    // Platform
    const platG = this.make.graphics({ x: 0, y: 0, add: false });
    platG.fillStyle(COLORS.GRASS_GREEN);
    platG.fillRect(0, 8, 64, 24);
    platG.fillStyle(0x66BB6A);
    platG.fillRect(0, 0, 64, 12);
    platG.fillStyle(0x81C784);
    for (let i = 0; i < 8; i++) platG.fillRect(i * 8 + 2, 0, 4, 8);
    platG.fillStyle(COLORS.PLATFORM_DARK);
    platG.fillRect(0, 28, 64, 4);
    platG.generateTexture('platform', 64, 32);
    platG.destroy();

    // Ground
    const gndG = this.make.graphics({ x: 0, y: 0, add: false });
    gndG.fillStyle(COLORS.PLATFORM_DARK);
    gndG.fillRect(0, 0, 64, 64);
    gndG.fillStyle(COLORS.GRASS_GREEN);
    gndG.fillRect(0, 0, 64, 16);
    gndG.fillStyle(0x66BB6A);
    gndG.fillRect(0, 0, 64, 8);
    gndG.generateTexture('ground', 64, 64);
    gndG.destroy();

    // Enemy walker - red angry blob
    const walkerG = this.make.graphics({ x: 0, y: 0, add: false });
    walkerG.fillStyle(0xE53935);
    walkerG.fillCircle(20, 20, 18);
    walkerG.fillStyle(0xC62828);
    walkerG.fillCircle(20, 24, 14);
    // Eyes
    walkerG.fillStyle(0xFFFFFF);
    walkerG.fillCircle(14, 14, 5);
    walkerG.fillCircle(26, 14, 5);
    walkerG.fillStyle(0x000000);
    walkerG.fillCircle(15, 14, 2);
    walkerG.fillCircle(27, 14, 2);
    // Angry brows
    walkerG.lineStyle(2, 0x000000);
    walkerG.lineBetween(10, 10, 17, 12);
    walkerG.lineBetween(30, 10, 23, 12);
    walkerG.generateTexture('enemy-walker', 40, 40);
    walkerG.destroy();

    // Enemy flyer - purple bat-like thing
    const flyerG = this.make.graphics({ x: 0, y: 0, add: false });
    flyerG.fillStyle(0x7B1FA2);
    flyerG.fillCircle(18, 18, 14);
    // Wings
    flyerG.fillStyle(0x9C27B0);
    flyerG.fillTriangle(0, 12, 8, 18, 4, 6);
    flyerG.fillTriangle(36, 12, 28, 18, 32, 6);
    // Eyes
    flyerG.fillStyle(0xFF0000);
    flyerG.fillCircle(13, 15, 3);
    flyerG.fillCircle(23, 15, 3);
    flyerG.fillStyle(0xFFFF00);
    flyerG.fillCircle(13, 15, 1);
    flyerG.fillCircle(23, 15, 1);
    flyerG.generateTexture('enemy-flyer', 36, 36);
    flyerG.destroy();

    // Spike - red triangle
    const spikeG = this.make.graphics({ x: 0, y: 0, add: false });
    spikeG.fillStyle(0xBDBDBD);
    spikeG.fillTriangle(0, 32, 16, 4, 32, 32);
    spikeG.fillStyle(0x9E9E9E);
    spikeG.fillTriangle(4, 32, 16, 8, 28, 32);
    spikeG.lineStyle(1, 0x757575);
    spikeG.lineBetween(16, 4, 16, 32);
    spikeG.generateTexture('spike', 32, 32);
    spikeG.destroy();

    // Cave platform - rocky brown
    const cavePlatG = this.make.graphics({ x: 0, y: 0, add: false });
    cavePlatG.fillStyle(0x5D4037);
    cavePlatG.fillRect(0, 8, 64, 24);
    cavePlatG.fillStyle(0x795548);
    cavePlatG.fillRect(0, 0, 64, 12);
    cavePlatG.fillStyle(0x6D4C41);
    for (let i = 0; i < 6; i++) cavePlatG.fillRect(i * 11 + 1, 2, 8, 6);
    cavePlatG.fillStyle(0x3E2723);
    cavePlatG.fillRect(0, 28, 64, 4);
    // Small crystal accents
    cavePlatG.fillStyle(0x4FC3F7, 0.5);
    cavePlatG.fillTriangle(10, 0, 14, 0, 12, -4);
    cavePlatG.fillTriangle(44, 0, 48, 0, 46, -3);
    cavePlatG.generateTexture('platform-cave', 64, 32);
    cavePlatG.destroy();

    // Cave ground - dark stone
    const caveGndG = this.make.graphics({ x: 0, y: 0, add: false });
    caveGndG.fillStyle(0x3E2723);
    caveGndG.fillRect(0, 0, 64, 64);
    caveGndG.fillStyle(0x5D4037);
    caveGndG.fillRect(0, 0, 64, 16);
    caveGndG.fillStyle(0x4E342E);
    caveGndG.fillRect(0, 0, 64, 8);
    // Stone texture lines
    caveGndG.lineStyle(1, 0x3E2723, 0.4);
    caveGndG.lineBetween(0, 24, 64, 24);
    caveGndG.lineBetween(20, 16, 20, 40);
    caveGndG.lineBetween(44, 20, 44, 48);
    caveGndG.generateTexture('ground-cave', 64, 64);
    caveGndG.destroy();

    // Sky platform - cloud-like white/blue
    const skyPlatG = this.make.graphics({ x: 0, y: 0, add: false });
    skyPlatG.fillStyle(0xE3F2FD);
    skyPlatG.fillRect(0, 8, 64, 24);
    skyPlatG.fillStyle(0xBBDEFB);
    skyPlatG.fillRect(0, 0, 64, 12);
    skyPlatG.fillStyle(0xFFFFFF, 0.6);
    for (let i = 0; i < 5; i++) skyPlatG.fillCircle(i * 14 + 6, 6, 7);
    skyPlatG.fillStyle(0x90CAF9);
    skyPlatG.fillRect(0, 28, 64, 4);
    skyPlatG.generateTexture('platform-sky', 64, 32);
    skyPlatG.destroy();

    // Sky ground - solid cloud base
    const skyGndG = this.make.graphics({ x: 0, y: 0, add: false });
    skyGndG.fillStyle(0xBBDEFB);
    skyGndG.fillRect(0, 0, 64, 64);
    skyGndG.fillStyle(0xE3F2FD);
    skyGndG.fillRect(0, 0, 64, 16);
    skyGndG.fillStyle(0xFFFFFF, 0.5);
    for (let i = 0; i < 5; i++) skyGndG.fillCircle(i * 14 + 6, 6, 8);
    skyGndG.generateTexture('ground-sky', 64, 64);
    skyGndG.destroy();

    // Power-up textures
    const puSize = 32;
    const puTypes = [
      { key: 'powerup-speed', color: 0xFF5722, icon: '\u26A1' },
      { key: 'powerup-double_jump', color: 0x2196F3, icon: '\u2191' },
      { key: 'powerup-magnet', color: 0x9C27B0, icon: 'M' },
      { key: 'powerup-shield', color: 0x4FC3F7, icon: 'S' },
    ];
    puTypes.forEach(pu => {
      const g = this.make.graphics({ x: 0, y: 0, add: false });
      g.fillStyle(pu.color, 0.9);
      g.fillCircle(puSize / 2, puSize / 2, puSize / 2 - 2);
      g.lineStyle(2, 0xFFFFFF, 0.8);
      g.strokeCircle(puSize / 2, puSize / 2, puSize / 2 - 2);
      g.fillStyle(0xFFFFFF);
      g.fillCircle(puSize / 2, puSize / 2, 6);
      g.generateTexture(pu.key, puSize, puSize);
      g.destroy();
    });
  }

  create() {
    this.scene.start('MenuScene');
  }
}
