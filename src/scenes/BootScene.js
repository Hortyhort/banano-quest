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
