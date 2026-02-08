import Phaser from 'phaser';
import { GAME_WIDTH, GAME_HEIGHT, COLORS, COIN } from '../config/gameConfig.ts';
import { generateEnemyTextures } from '../sprites/Enemy.ts';

export class BootScene extends Phaser.Scene {
  constructor() {
    super({ key: 'BootScene' });
  }

  preload() {
    const progressBar = this.add.graphics();
    const progressBox = this.add.graphics();
    progressBox.fillStyle(0x222222, 0.8);
    progressBox.fillRect(GAME_WIDTH / 2 - 160, GAME_HEIGHT / 2 - 25, 320, 50);

    const loadingText = this.add
      .text(GAME_WIDTH / 2, GAME_HEIGHT / 2 - 50, 'Loading...', {
        font: '24px Arial',
        color: '#ffffff',
      })
      .setOrigin(0.5);

    this.load.on('progress', (value: number) => {
      progressBar.clear();
      progressBar.fillStyle(COLORS.BANANO_YELLOW, 1);
      progressBar.fillRect(GAME_WIDTH / 2 - 150, GAME_HEIGHT / 2 - 15, 300 * value, 30);
    });

    this.load.on('complete', () => {
      progressBar.destroy();
      progressBox.destroy();
      loadingText.destroy();
    });

    this.load.svg('monkey', 'assets/monkey-0.svg', { width: 64, height: 78 });
    this.load.svg('monkey-walk-1', 'assets/monkey-1.svg', { width: 64, height: 78 });
    this.load.svg('monkey-walk-2', 'assets/monkey-2.svg', { width: 64, height: 78 });
    this.load.svg('monkey-jump', 'assets/monkey-3.svg', { width: 64, height: 78 });

    this.generatePlaceholderGraphics();
    generateEnemyTextures(this);
  }

  private generatePlaceholderGraphics() {
    this.generateCoinTexture();
    this.generatePlatformTexture();
    this.generateGroundTexture();
  }

  private generateCoinTexture() {
    const r = COIN.RADIUS;
    const d = r * 2;
    const g = this.add.graphics({ x: 0, y: 0 }).setVisible(false);

    // Outer ring — dark gold
    g.fillStyle(0xffa000);
    g.fillCircle(r, r, r);

    // Main body — bright banano yellow
    g.fillStyle(COLORS.BANANO_YELLOW);
    g.fillCircle(r, r, r - 2);

    // Inner highlight — lighter yellow crescent
    g.fillStyle(0xfff176);
    g.fillCircle(r - 3, r - 3, r - 6);

    // "B" mark in center — dark gold
    g.fillStyle(0xffa000);
    // Vertical bar of B
    g.fillRect(r - 4, r - 6, 3, 12);
    // Top bump of B
    g.fillRoundedRect(r - 4, r - 6, 8, 6, 3);
    // Bottom bump of B
    g.fillRoundedRect(r - 4, r, 9, 6, 3);

    // Specular highlight — small white dot
    g.fillStyle(0xffffff, 0.6);
    g.fillCircle(r - 5, r - 5, 3);

    // Outer stroke
    g.lineStyle(2, 0xe68a00);
    g.strokeCircle(r, r, r - 1);

    g.generateTexture('coin', d, d);
    g.destroy();
  }

  private generatePlatformTexture() {
    const g = this.add.graphics({ x: 0, y: 0 }).setVisible(false);

    // Base fill — earthy brown
    g.fillStyle(0x6d4c41);
    g.fillRect(0, 10, 64, 22);

    // Top grass layer — bright green
    g.fillStyle(COLORS.GRASS_GREEN);
    g.fillRect(0, 0, 64, 14);

    // Grass highlights — lighter patches
    g.fillStyle(0x66bb6a);
    g.fillRect(0, 0, 64, 8);

    // Grass tufts — darker tips
    g.fillStyle(0x388e3c);
    for (let i = 0; i < 8; i++) {
      const tx = i * 8 + 1;
      g.fillTriangle(tx, 4, tx + 3, 0, tx + 6, 4);
    }

    // Dirt detail — small lighter brown dots
    g.fillStyle(0x8d6e63);
    g.fillRect(5, 16, 3, 2);
    g.fillRect(18, 20, 2, 2);
    g.fillRect(35, 15, 3, 3);
    g.fillRect(50, 22, 2, 2);
    g.fillRect(58, 18, 3, 2);

    // Bottom shadow
    g.fillStyle(0x4e342e);
    g.fillRect(0, 28, 64, 4);

    g.generateTexture('platform', 64, 32);
    g.destroy();
  }

  private generateGroundTexture() {
    const g = this.add.graphics({ x: 0, y: 0 }).setVisible(false);

    // Deep soil
    g.fillStyle(0x4e342e);
    g.fillRect(0, 0, 64, 64);

    // Upper soil layer
    g.fillStyle(0x6d4c41);
    g.fillRect(0, 0, 64, 48);

    // Top grass strip
    g.fillStyle(COLORS.GRASS_GREEN);
    g.fillRect(0, 0, 64, 14);

    // Grass highlight
    g.fillStyle(0x66bb6a);
    g.fillRect(0, 0, 64, 8);

    // Grass tufts
    g.fillStyle(0x388e3c);
    for (let i = 0; i < 8; i++) {
      const tx = i * 8 + 1;
      g.fillTriangle(tx, 4, tx + 3, 0, tx + 6, 4);
    }

    // Rock/pebble detail in soil
    g.fillStyle(0x8d6e63);
    g.fillRect(8, 22, 4, 3);
    g.fillRect(30, 30, 5, 3);
    g.fillRect(52, 25, 3, 4);
    g.fillRect(15, 42, 4, 3);
    g.fillRect(42, 50, 5, 3);

    // Darker cracks
    g.fillStyle(0x3e2723);
    g.fillRect(20, 35, 1, 8);
    g.fillRect(45, 28, 1, 6);

    g.generateTexture('ground', 64, 64);
    g.destroy();
  }

  create() {
    this.scene.start('MenuScene');
  }
}
