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

    // Load monkey sprites
    this.load.svg('monkey', 'assets/monkey-0.svg', { width: 64, height: 78 });
    this.load.svg('monkey-walk-1', 'assets/monkey-1.svg', { width: 64, height: 78 });
    this.load.svg('monkey-walk-2', 'assets/monkey-2.svg', { width: 64, height: 78 });
    this.load.svg('monkey-jump', 'assets/monkey-3.svg', { width: 64, height: 78 });

    // Generate placeholder graphics for platforms and coins
    this.generatePlaceholderGraphics();
  }

  generatePlaceholderGraphics() {

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

    // Generate slime enemy sprite
    const slimeGraphics = this.make.graphics({ x: 0, y: 0, add: false });
    // Body
    slimeGraphics.fillStyle(0x4CAF50);
    slimeGraphics.fillEllipse(24, 28, 36, 28);
    // Darker bottom
    slimeGraphics.fillStyle(0x388E3C);
    slimeGraphics.fillEllipse(24, 34, 36, 16);
    // Eyes (white)
    slimeGraphics.fillStyle(0xFFFFFF);
    slimeGraphics.fillCircle(16, 22, 7);
    slimeGraphics.fillCircle(32, 22, 7);
    // Pupils
    slimeGraphics.fillStyle(0x1B5E20);
    slimeGraphics.fillCircle(18, 23, 4);
    slimeGraphics.fillCircle(34, 23, 4);
    // Angry eyebrows
    slimeGraphics.lineStyle(2, 0x1B5E20);
    slimeGraphics.beginPath();
    slimeGraphics.moveTo(10, 16);
    slimeGraphics.lineTo(20, 18);
    slimeGraphics.strokePath();
    slimeGraphics.beginPath();
    slimeGraphics.moveTo(38, 16);
    slimeGraphics.lineTo(28, 18);
    slimeGraphics.strokePath();

    slimeGraphics.generateTexture('slime', 48, 40);
    slimeGraphics.destroy();

    // Generate spike hazard sprite
    const spikeGraphics = this.make.graphics({ x: 0, y: 0, add: false });
    const spikeCount = 4;
    const spikeW = 48;
    const spikeH = 32;
    const sw = spikeW / spikeCount;
    for (let i = 0; i < spikeCount; i++) {
      spikeGraphics.fillStyle(0x9E9E9E);
      spikeGraphics.fillTriangle(
        i * sw, spikeH,
        i * sw + sw / 2, 4,
        i * sw + sw, spikeH
      );
      spikeGraphics.lineStyle(1, 0xBDBDBD);
      spikeGraphics.beginPath();
      spikeGraphics.moveTo(i * sw + sw / 2, 4);
      spikeGraphics.lineTo(i * sw + sw, spikeH);
      spikeGraphics.strokePath();
    }

    spikeGraphics.generateTexture('spike', spikeW, spikeH);
    spikeGraphics.destroy();

    // Generate heart sprite for lives display
    const heartGraphics = this.make.graphics({ x: 0, y: 0, add: false });
    heartGraphics.fillStyle(0xFF1744);
    heartGraphics.fillCircle(10, 10, 8);
    heartGraphics.fillCircle(22, 10, 8);
    heartGraphics.fillTriangle(2, 12, 30, 12, 16, 28);
    heartGraphics.fillStyle(0xFF5252);
    heartGraphics.fillCircle(9, 8, 4);

    heartGraphics.generateTexture('heart', 32, 30);
    heartGraphics.destroy();
  }

  create() {
    this.scene.start('MenuScene');
  }
}
