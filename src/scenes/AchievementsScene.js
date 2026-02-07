import Phaser from 'phaser';
import { GAME_WIDTH, GAME_HEIGHT } from '../config/gameConfig.js';
import { AchievementManager } from '../services/AchievementManager.js';
import { AudioManager } from '../services/AudioManager.js';

export class AchievementsScene extends Phaser.Scene {
  constructor() {
    super({ key: 'AchievementsScene' });
  }

  create() {
    // Background
    const bg = this.add.graphics();
    bg.fillGradientStyle(0x1A1A2E, 0x16213E, 0x0F3460, 0x1A1A2E, 1);
    bg.fillRect(0, 0, GAME_WIDTH, GAME_HEIGHT);

    // Title
    this.add.text(GAME_WIDTH / 2, 45, 'ACHIEVEMENTS', {
      fontFamily: 'Arial Black, Arial',
      fontSize: '42px',
      color: '#FFD700',
      stroke: '#000000',
      strokeThickness: 6
    }).setOrigin(0.5);

    const all = AchievementManager.getAll();
    const unlocked = AchievementManager.getUnlocked();
    const unlockedCount = unlocked.length;

    // Progress bar
    const barW = 300;
    const barX = GAME_WIDTH / 2 - barW / 2;
    const barY = 80;
    const barG = this.add.graphics();
    barG.fillStyle(0x333333, 0.6);
    barG.fillRoundedRect(barX, barY, barW, 12, 6);
    barG.fillStyle(0xFFD700, 0.9);
    barG.fillRoundedRect(barX, barY, barW * (unlockedCount / all.length), 12, 6);

    this.add.text(GAME_WIDTH / 2, barY + 28, `${unlockedCount} / ${all.length}`, {
      fontFamily: 'Arial', fontSize: '16px',
      color: '#FFFFFF', stroke: '#000000', strokeThickness: 2
    }).setOrigin(0.5);

    // Achievement grid (3 columns, 4 rows)
    const cols = 3;
    const cardW = 360;
    const cardH = 65;
    const gapX = 20;
    const gapY = 12;
    const gridW = cols * cardW + (cols - 1) * gapX;
    const startX = (GAME_WIDTH - gridW) / 2;
    const startY = 120;

    all.forEach((ach, i) => {
      const col = i % cols;
      const row = Math.floor(i / cols);
      const x = startX + col * (cardW + gapX);
      const y = startY + row * (cardH + gapY);
      const isUnlocked = unlocked.includes(ach.id);

      this.createAchievementCard(x, y, cardW, cardH, ach, isUnlocked);
    });

    // Back button
    const backBtn = this.add.text(70, 45, '\u25C0 BACK', {
      fontFamily: 'Arial Black, Arial', fontSize: '20px',
      color: '#FFFFFF', stroke: '#000000', strokeThickness: 3
    }).setOrigin(0.5).setInteractive({ useHandCursor: true });

    backBtn.on('pointerover', () => backBtn.setColor('#FFEB3B'));
    backBtn.on('pointerout', () => backBtn.setColor('#FFFFFF'));
    backBtn.on('pointerdown', () => {
      AudioManager.playSound('menu_click');
      this.scene.start('MenuScene');
    });

    this.cameras.main.fadeIn(400);
  }

  createAchievementCard(x, y, w, h, ach, isUnlocked) {
    const g = this.add.graphics();

    if (isUnlocked) {
      g.fillStyle(0x1B5E20, 0.6);
      g.fillRoundedRect(x, y, w, h, 8);
      g.lineStyle(2, 0x4CAF50, 0.7);
      g.strokeRoundedRect(x, y, w, h, 8);
    } else {
      g.fillStyle(0x212121, 0.5);
      g.fillRoundedRect(x, y, w, h, 8);
      g.lineStyle(1, 0x424242, 0.4);
      g.strokeRoundedRect(x, y, w, h, 8);
    }

    // Icon
    const iconText = isUnlocked ? ach.icon : '\u{1F512}';
    this.add.text(x + 30, y + h / 2, iconText, {
      fontSize: '28px'
    }).setOrigin(0.5);

    // Name
    const nameColor = isUnlocked ? '#FFFFFF' : '#757575';
    this.add.text(x + 60, y + h / 2 - 10, ach.name, {
      fontFamily: 'Arial Black, Arial', fontSize: '14px',
      color: nameColor
    }).setOrigin(0, 0.5);

    // Description
    const descColor = isUnlocked ? '#A5D6A7' : '#616161';
    this.add.text(x + 60, y + h / 2 + 12, ach.description, {
      fontFamily: 'Arial', fontSize: '12px',
      color: descColor
    }).setOrigin(0, 0.5);

    // Checkmark for unlocked
    if (isUnlocked) {
      this.add.text(x + w - 25, y + h / 2, '\u2713', {
        fontFamily: 'Arial', fontSize: '24px',
        color: '#4CAF50'
      }).setOrigin(0.5);
    }
  }
}
