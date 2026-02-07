import Phaser from 'phaser';
import { GAME_WIDTH, GAME_HEIGHT, COLORS } from '../config/gameConfig.js';
import { LEVELS, TOTAL_LEVELS } from '../config/levels.js';
import { StorageService } from '../services/StorageService.js';

export class LevelSelectScene extends Phaser.Scene {
  constructor() {
    super({ key: 'LevelSelectScene' });
  }

  create() {
    const unlocked = StorageService.getUnlockedLevels();

    // Background — parchment-style map
    const bg = this.add.graphics();
    bg.fillGradientStyle(0x3E2723, 0x4E342E, 0x5D4037, 0x3E2723, 1);
    bg.fillRect(0, 0, GAME_WIDTH, GAME_HEIGHT);

    // Subtle texture noise (scattered dots)
    for (let i = 0; i < 120; i++) {
      bg.fillStyle(0x6D4C41, Phaser.Math.FloatBetween(0.05, 0.15));
      bg.fillCircle(
        Phaser.Math.Between(0, GAME_WIDTH),
        Phaser.Math.Between(0, GAME_HEIGHT),
        Phaser.Math.Between(1, 4)
      );
    }

    // Title
    this.add.text(GAME_WIDTH / 2, 50, 'SELECT YOUR QUEST', {
      fontFamily: 'Arial Black, Arial',
      fontSize: '42px',
      color: '#FFEB3B',
      stroke: '#000000',
      strokeThickness: 6
    }).setOrigin(0.5);

    // Path node positions — winding trail
    const nodes = [
      { x: 180, y: 520 },
      { x: 420, y: 380 },
      { x: 640, y: 500 },
      { x: 880, y: 340 },
      { x: 1100, y: 460 }
    ];

    // Draw the path (dotted trail between nodes)
    const pathGfx = this.add.graphics();
    for (let i = 0; i < nodes.length - 1; i++) {
      const from = nodes[i];
      const to = nodes[i + 1];
      const steps = 20;
      for (let s = 0; s <= steps; s++) {
        const t = s / steps;
        const px = Phaser.Math.Interpolation.Linear([from.x, to.x], t);
        const py = Phaser.Math.Interpolation.Linear([from.y, to.y], t);
        const isUnlocked = i + 1 < unlocked;
        pathGfx.fillStyle(isUnlocked ? 0xFFEB3B : 0x795548, s % 2 === 0 ? 0.7 : 0.3);
        pathGfx.fillCircle(px, py, 4);
      }
    }

    // Draw level nodes
    nodes.forEach((pos, i) => {
      const levelNum = i + 1;
      const level = LEVELS[i];
      const isUnlocked = levelNum <= unlocked;
      const stars = StorageService.getLevelStars(levelNum);
      const themeColor = level.theme.skyGradient[0];

      this.createLevelNode(pos.x, pos.y, levelNum, level, isUnlocked, stars, themeColor);
    });

    // Back button
    const backBtn = this.createButton(70, 50, '\u25C0 BACK', () => {
      this.scene.start('MenuScene');
    });

    this.cameras.main.fadeIn(400);
  }

  createLevelNode(x, y, levelNum, level, isUnlocked, stars, themeColor) {
    const container = this.add.container(x, y);

    // Glow behind node (only if unlocked)
    if (isUnlocked) {
      const glow = this.add.graphics();
      glow.fillStyle(themeColor, 0.3);
      glow.fillCircle(0, 0, 55);
      container.add(glow);

      this.tweens.add({
        targets: glow,
        alpha: { from: 0.4, to: 0.8 },
        duration: 1200,
        yoyo: true,
        repeat: -1,
        ease: 'Sine.easeInOut'
      });
    }

    // Circle background
    const circle = this.add.graphics();
    if (isUnlocked) {
      circle.fillStyle(themeColor, 0.9);
      circle.fillCircle(0, 0, 42);
      circle.lineStyle(3, 0xFFEB3B, 1);
      circle.strokeCircle(0, 0, 42);
    } else {
      circle.fillStyle(0x424242, 0.8);
      circle.fillCircle(0, 0, 42);
      circle.lineStyle(2, 0x616161, 0.6);
      circle.strokeCircle(0, 0, 42);
    }
    container.add(circle);

    // Icon or lock
    const iconText = isUnlocked ? level.icon : '\u{1F512}';
    const icon = this.add.text(0, -3, iconText, {
      fontFamily: 'Arial',
      fontSize: '32px'
    }).setOrigin(0.5);
    container.add(icon);

    // Level number badge
    const badge = this.add.graphics();
    badge.fillStyle(isUnlocked ? 0xFF9800 : 0x616161, 1);
    badge.fillCircle(30, -30, 14);
    const numText = this.add.text(30, -30, `${levelNum}`, {
      fontFamily: 'Arial Black, Arial',
      fontSize: '16px',
      color: '#FFFFFF'
    }).setOrigin(0.5);
    container.add([badge, numText]);

    // Level name below
    const nameColor = isUnlocked ? '#FFFFFF' : '#757575';
    const name = this.add.text(0, 60, level.name, {
      fontFamily: 'Arial Black, Arial',
      fontSize: '16px',
      color: nameColor,
      stroke: '#000000',
      strokeThickness: 3
    }).setOrigin(0.5);
    container.add(name);

    // Star rating below name
    if (isUnlocked) {
      const totalCoins = level.coins.length;
      const starStr = this.getStarDisplay(stars);
      const starText = this.add.text(0, 82, starStr, {
        fontFamily: 'Arial',
        fontSize: '20px',
        color: '#FFD700'
      }).setOrigin(0.5);
      container.add(starText);
    }

    // Make interactive if unlocked
    if (isUnlocked) {
      container.setSize(90, 90);
      container.setInteractive({ useHandCursor: true });

      container.on('pointerover', () => {
        this.tweens.add({ targets: container, scaleX: 1.12, scaleY: 1.12, duration: 100 });
      });
      container.on('pointerout', () => {
        this.tweens.add({ targets: container, scaleX: 1, scaleY: 1, duration: 100 });
      });
      container.on('pointerdown', () => {
        this.cameras.main.fadeOut(400, 0, 0, 0);
        this.time.delayedCall(400, () => {
          this.scene.start('GameScene', { level: levelNum });
        });
      });
    }
  }

  getStarDisplay(stars) {
    let str = '';
    for (let i = 0; i < 3; i++) {
      str += i < stars ? '\u2605' : '\u2606';
    }
    return str;
  }

  createButton(x, y, label, callback) {
    const text = this.add.text(x, y, label, {
      fontFamily: 'Arial Black, Arial',
      fontSize: '20px',
      color: '#FFFFFF',
      stroke: '#000000',
      strokeThickness: 3
    }).setOrigin(0.5).setInteractive({ useHandCursor: true });

    text.on('pointerover', () => text.setColor('#FFEB3B'));
    text.on('pointerout', () => text.setColor('#FFFFFF'));
    text.on('pointerdown', callback);
    return text;
  }
}
