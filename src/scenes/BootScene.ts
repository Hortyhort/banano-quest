import Phaser from 'phaser';
import { GAME_WIDTH, GAME_HEIGHT, COLORS, COIN } from '../config/gameConfig.ts';
import { generateEnemyTextures } from '../sprites/Enemy.ts';
import { QualityManager } from '../services/QualityManager.ts';

const VERSION = '2.0.0';

export class BootScene extends Phaser.Scene {
  constructor() {
    super({ key: 'BootScene' });
  }

  preload() {
    // Background
    const bg = this.add.graphics();
    bg.fillGradientStyle(0x1a1a2e, 0x1a1a2e, 0x16213e, 0x16213e, 1);
    bg.fillRect(0, 0, GAME_WIDTH, GAME_HEIGHT);

    // Title
    this.add
      .text(GAME_WIDTH / 2 + 3, GAME_HEIGHT / 2 - 123, 'BANANO QUEST', {
        fontFamily: 'Arial Black, Arial',
        fontSize: '52px',
        color: '#000000',
      })
      .setOrigin(0.5)
      .setAlpha(0.3);

    const title = this.add
      .text(GAME_WIDTH / 2, GAME_HEIGHT / 2 - 125, 'BANANO QUEST', {
        fontFamily: 'Arial Black, Arial',
        fontSize: '52px',
        color: '#FFEB3B',
        stroke: '#FF9800',
        strokeThickness: 6,
      })
      .setOrigin(0.5);

    this.tweens.add({
      targets: title,
      y: title.y + 5,
      duration: 800,
      ease: 'Sine.easeInOut',
      yoyo: true,
      repeat: -1,
    });

    // Version
    this.add
      .text(GAME_WIDTH / 2, GAME_HEIGHT / 2 - 75, `v${VERSION}`, {
        fontFamily: 'Arial',
        fontSize: '16px',
        color: '#888888',
      })
      .setOrigin(0.5);

    // Progress bar background
    const barWidth = 400;
    const barHeight = 20;
    const barX = GAME_WIDTH / 2 - barWidth / 2;
    const barY = GAME_HEIGHT / 2;

    const progressBox = this.add.graphics();
    progressBox.fillStyle(0x222222, 0.8);
    progressBox.fillRoundedRect(barX - 5, barY - 5, barWidth + 10, barHeight + 10, 8);

    const progressBar = this.add.graphics();

    // Loading text
    const loadingText = this.add
      .text(GAME_WIDTH / 2, barY + 40, 'Loading assets...', {
        fontFamily: 'Arial',
        fontSize: '18px',
        color: '#AAAAAA',
      })
      .setOrigin(0.5);

    // Percentage text
    const percentText = this.add
      .text(GAME_WIDTH / 2, barY + barHeight / 2, '0%', {
        fontFamily: 'Arial Black, Arial',
        fontSize: '14px',
        color: '#FFFFFF',
      })
      .setOrigin(0.5);

    this.load.on('progress', (value: number) => {
      progressBar.clear();
      progressBar.fillStyle(COLORS.BANANO_YELLOW, 1);
      progressBar.fillRoundedRect(barX, barY, barWidth * value, barHeight, 6);
      percentText.setText(`${Math.round(value * 100)}%`);
    });

    this.load.on('complete', () => {
      progressBar.destroy();
      progressBox.destroy();
      loadingText.setText('Ready!');
      percentText.destroy();
    });

    // Copyright
    this.add
      .text(GAME_WIDTH / 2, GAME_HEIGHT - 30, 'Powered by Phaser 3 + Banano', {
        fontFamily: 'Arial',
        fontSize: '14px',
        color: '#555555',
      })
      .setOrigin(0.5);

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
    this.generateSpikeTexture();
  }

  private generateCoinTexture() {
    const r = COIN.RADIUS;
    const d = r * 2;
    const g = this.add.graphics({ x: 0, y: 0 }).setVisible(false);

    g.fillStyle(0xffa000);
    g.fillCircle(r, r, r);
    g.fillStyle(COLORS.BANANO_YELLOW);
    g.fillCircle(r, r, r - 2);
    g.fillStyle(0xfff176);
    g.fillCircle(r - 3, r - 3, r - 6);
    g.fillStyle(0xffa000);
    g.fillRect(r - 4, r - 6, 3, 12);
    g.fillRoundedRect(r - 4, r - 6, 8, 6, 3);
    g.fillRoundedRect(r - 4, r, 9, 6, 3);
    g.fillStyle(0xffffff, 0.6);
    g.fillCircle(r - 5, r - 5, 3);
    g.lineStyle(2, 0xe68a00);
    g.strokeCircle(r, r, r - 1);

    g.generateTexture('coin', d, d);
    g.destroy();
  }

  private generatePlatformTexture() {
    const g = this.add.graphics({ x: 0, y: 0 }).setVisible(false);

    g.fillStyle(0x6d4c41);
    g.fillRect(0, 10, 64, 22);
    g.fillStyle(COLORS.GRASS_GREEN);
    g.fillRect(0, 0, 64, 14);
    g.fillStyle(0x66bb6a);
    g.fillRect(0, 0, 64, 8);
    g.fillStyle(0x388e3c);
    for (let i = 0; i < 8; i++) {
      const tx = i * 8 + 1;
      g.fillTriangle(tx, 4, tx + 3, 0, tx + 6, 4);
    }
    g.fillStyle(0x8d6e63);
    g.fillRect(5, 16, 3, 2);
    g.fillRect(18, 20, 2, 2);
    g.fillRect(35, 15, 3, 3);
    g.fillRect(50, 22, 2, 2);
    g.fillRect(58, 18, 3, 2);
    g.fillStyle(0x4e342e);
    g.fillRect(0, 28, 64, 4);

    g.generateTexture('platform', 64, 32);
    g.destroy();
  }

  private generateGroundTexture() {
    const g = this.add.graphics({ x: 0, y: 0 }).setVisible(false);

    g.fillStyle(0x4e342e);
    g.fillRect(0, 0, 64, 64);
    g.fillStyle(0x6d4c41);
    g.fillRect(0, 0, 64, 48);
    g.fillStyle(COLORS.GRASS_GREEN);
    g.fillRect(0, 0, 64, 14);
    g.fillStyle(0x66bb6a);
    g.fillRect(0, 0, 64, 8);
    g.fillStyle(0x388e3c);
    for (let i = 0; i < 8; i++) {
      const tx = i * 8 + 1;
      g.fillTriangle(tx, 4, tx + 3, 0, tx + 6, 4);
    }
    g.fillStyle(0x8d6e63);
    g.fillRect(8, 22, 4, 3);
    g.fillRect(30, 30, 5, 3);
    g.fillRect(52, 25, 3, 4);
    g.fillRect(15, 42, 4, 3);
    g.fillRect(42, 50, 5, 3);
    g.fillStyle(0x3e2723);
    g.fillRect(20, 35, 1, 8);
    g.fillRect(45, 28, 1, 6);

    g.generateTexture('ground', 64, 64);
    g.destroy();
  }

  private generateSpikeTexture() {
    const g = this.add.graphics({ x: 0, y: 0 }).setVisible(false);

    g.fillStyle(COLORS.SPIKE_RED);
    for (let i = 0; i < 4; i++) {
      const bx = i * 16;
      g.fillTriangle(bx, 32, bx + 8, 4, bx + 16, 32);
    }
    g.fillStyle(0xff5252);
    for (let i = 0; i < 4; i++) {
      const bx = i * 16 + 2;
      g.fillTriangle(bx, 32, bx + 6, 10, bx + 12, 32);
    }

    g.generateTexture('spike', 64, 32);
    g.destroy();
  }

  create() {
    QualityManager.init();

    // Brief pause on loading screen to show branding
    this.time.delayedCall(400, () => {
      this.cameras.main.fadeOut(300, 0, 0, 0);
      this.time.delayedCall(300, () => {
        this.scene.start('MenuScene');
      });
    });
  }
}
