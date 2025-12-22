import Phaser from 'phaser';
import { GAME_WIDTH, GAME_HEIGHT, COLORS, PLAYER, COIN } from '../config/gameConfig.js';

export class BootScene extends Phaser.Scene {
  constructor() {
    super({ key: 'BootScene' });
  }

  preload() {
    // Create loading bar
    const progressBar = this.add.graphics();
    const progressBox = this.add.graphics();
    progressBox.fillStyle(0x222222, 0.8);
    progressBox.fillRect(GAME_WIDTH / 2 - 160, GAME_HEIGHT / 2 - 25, 320, 50);

    const loadingText = this.add.text(GAME_WIDTH / 2, GAME_HEIGHT / 2 - 50, 'Loading...', {
      font: '24px Arial',
      color: '#ffffff'
    }).setOrigin(0.5);

    this.load.on('progress', (value) => {
      progressBar.clear();
      progressBar.fillStyle(COLORS.BANANO_YELLOW, 1);
      progressBar.fillRect(GAME_WIDTH / 2 - 150, GAME_HEIGHT / 2 - 15, 300 * value, 30);
    });

    this.load.on('complete', () => {
      progressBar.destroy();
      progressBox.destroy();
      loadingText.destroy();
    });

    // Generate placeholder graphics
    this.generatePlaceholderGraphics();
  }

  generatePlaceholderGraphics() {
    // Generate monkey sprite
    const monkeyGraphics = this.make.graphics({ x: 0, y: 0, add: false });

    // Body (orange rectangle)
    monkeyGraphics.fillStyle(COLORS.MONKEY_ORANGE);
    monkeyGraphics.fillRoundedRect(4, 8, PLAYER.WIDTH - 8, PLAYER.HEIGHT - 16, 8);

    // Face (lighter belly area)
    monkeyGraphics.fillStyle(0xFFCC80);
    monkeyGraphics.fillRoundedRect(12, 20, PLAYER.WIDTH - 24, 30, 6);

    // Eyes
    monkeyGraphics.fillStyle(0x000000);
    monkeyGraphics.fillCircle(16, 24, 4);
    monkeyGraphics.fillCircle(32, 24, 4);

    // Eye whites
    monkeyGraphics.fillStyle(0xFFFFFF);
    monkeyGraphics.fillCircle(17, 23, 2);
    monkeyGraphics.fillCircle(33, 23, 2);

    // Smile
    monkeyGraphics.lineStyle(2, 0x000000);
    monkeyGraphics.beginPath();
    monkeyGraphics.arc(24, 35, 8, 0.2, Math.PI - 0.2);
    monkeyGraphics.strokePath();

    // Ears
    monkeyGraphics.fillStyle(COLORS.MONKEY_BROWN);
    monkeyGraphics.fillCircle(4, 20, 8);
    monkeyGraphics.fillCircle(44, 20, 8);

    monkeyGraphics.generateTexture('monkey', PLAYER.WIDTH, PLAYER.HEIGHT);
    monkeyGraphics.destroy();

    // Generate coin sprite
    const coinGraphics = this.make.graphics({ x: 0, y: 0, add: false });

    // Coin outer circle
    coinGraphics.fillStyle(COLORS.BANANO_YELLOW);
    coinGraphics.fillCircle(COIN.RADIUS, COIN.RADIUS, COIN.RADIUS);

    // Coin inner highlight
    coinGraphics.fillStyle(0xFFF176);
    coinGraphics.fillCircle(COIN.RADIUS - 2, COIN.RADIUS - 2, COIN.RADIUS - 6);

    // Coin border
    coinGraphics.lineStyle(2, 0xFFA000);
    coinGraphics.strokeCircle(COIN.RADIUS, COIN.RADIUS, COIN.RADIUS - 1);

    coinGraphics.generateTexture('coin', COIN.RADIUS * 2, COIN.RADIUS * 2);
    coinGraphics.destroy();

    // Generate platform texture
    const platformGraphics = this.make.graphics({ x: 0, y: 0, add: false });

    // Main platform body
    platformGraphics.fillStyle(COLORS.GRASS_GREEN);
    platformGraphics.fillRect(0, 8, 64, 24);

    // Grass top
    platformGraphics.fillStyle(0x66BB6A);
    platformGraphics.fillRect(0, 0, 64, 12);

    // Grass detail
    platformGraphics.fillStyle(0x81C784);
    for (let i = 0; i < 8; i++) {
      platformGraphics.fillRect(i * 8 + 2, 0, 4, 8);
    }

    // Dirt bottom
    platformGraphics.fillStyle(COLORS.PLATFORM_DARK);
    platformGraphics.fillRect(0, 28, 64, 4);

    platformGraphics.generateTexture('platform', 64, 32);
    platformGraphics.destroy();

    // Generate ground texture (wider)
    const groundGraphics = this.make.graphics({ x: 0, y: 0, add: false });
    groundGraphics.fillStyle(COLORS.PLATFORM_DARK);
    groundGraphics.fillRect(0, 0, 64, 64);
    groundGraphics.fillStyle(COLORS.GRASS_GREEN);
    groundGraphics.fillRect(0, 0, 64, 16);
    groundGraphics.fillStyle(0x66BB6A);
    groundGraphics.fillRect(0, 0, 64, 8);

    groundGraphics.generateTexture('ground', 64, 64);
    groundGraphics.destroy();
  }

  create() {
    this.scene.start('MenuScene');
  }
}
