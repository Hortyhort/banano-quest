import Phaser from 'phaser';
import { GAME_WIDTH, GAME_HEIGHT, COLORS, LEVELS, WORLD_THEMES } from '../config/gameConfig.js';
import { StorageService } from '../services/StorageService.js';
import { AudioManager } from '../services/AudioManager.js';

export class LevelSelectScene extends Phaser.Scene {
  constructor() {
    super({ key: 'LevelSelectScene' });
    this.audioManager = null;
  }

  create() {
    if (!this.audioManager) {
      this.audioManager = new AudioManager();
      this.audioManager.init();
    }

    const unlockedLevels = StorageService.getUnlockedLevels();

    // Background
    const bg = this.add.graphics();
    bg.fillGradientStyle(0x1a1a2e, 0x1a1a2e, 0x16213e, 0x16213e, 1);
    bg.fillRect(0, 0, GAME_WIDTH, GAME_HEIGHT);

    // Title
    this.add.text(GAME_WIDTH / 2, 50, 'SELECT LEVEL', {
      fontFamily: 'Arial Black, Arial', fontSize: '42px',
      color: '#FFEB3B', stroke: '#FF9800', strokeThickness: 6
    }).setOrigin(0.5);

    // Group levels by world
    const worlds = {};
    LEVELS.forEach((level, idx) => {
      if (!worlds[level.world]) worlds[level.world] = [];
      worlds[level.world].push({ ...level, index: idx });
    });

    let worldY = 110;
    const worldKeys = Object.keys(worlds);

    worldKeys.forEach(worldKey => {
      const theme = WORLD_THEMES[worldKey];
      const levels = worlds[worldKey];

      // World header
      this.add.text(60, worldY, theme.name, {
        fontFamily: 'Arial Black', fontSize: '26px',
        color: '#FFFFFF', stroke: '#000000', strokeThickness: 3
      });

      // World color bar
      const bar = this.add.graphics();
      bar.fillStyle(theme.bgTop, 0.4);
      bar.fillRoundedRect(40, worldY + 35, GAME_WIDTH - 80, 100, 12);

      // Level buttons in a row
      const startX = 80;
      const spacing = 110;
      const btnY = worldY + 85;

      levels.forEach((level, i) => {
        const x = startX + i * spacing;
        const levelNum = level.index + 1;
        const isUnlocked = levelNum <= unlockedLevels;

        // Button background
        const btn = this.add.container(x, btnY);

        const btnBg = this.add.graphics();
        if (isUnlocked) {
          btnBg.fillStyle(theme.bgTop === 0x87CEEB ? 0x4CAF50 : 0x607D8B, 0.9);
        } else {
          btnBg.fillStyle(0x444444, 0.6);
        }
        btnBg.fillRoundedRect(-38, -30, 76, 60, 10);

        if (isUnlocked) {
          btnBg.lineStyle(2, 0xFFEB3B, 0.8);
          btnBg.strokeRoundedRect(-38, -30, 76, 60, 10);
        }

        // Level number
        const numText = this.add.text(0, -8, `${levelNum}`, {
          fontFamily: 'Arial Black', fontSize: '28px',
          color: isUnlocked ? '#FFFFFF' : '#666666',
          stroke: '#000000', strokeThickness: 3
        }).setOrigin(0.5);

        // Lock icon or star rating
        let subText;
        if (!isUnlocked) {
          subText = this.add.text(0, 16, '\u{1F512}', {
            fontSize: '14px'
          }).setOrigin(0.5);
        } else {
          const earnedStars = StorageService.getLevelStars(level.index);
          let starStr = '';
          for (let s = 0; s < 3; s++) {
            starStr += s < earnedStars ? '\u2605' : '\u2606';
          }
          subText = this.add.text(0, 16, starStr, {
            fontSize: '13px', color: earnedStars > 0 ? '#FFD700' : '#666666'
          }).setOrigin(0.5);
        }

        btn.add([btnBg, numText, subText]);

        if (isUnlocked) {
          btn.setSize(76, 60);
          btn.setInteractive({ useHandCursor: true });

          btn.on('pointerover', () => {
            this.tweens.add({ targets: btn, scaleX: 1.1, scaleY: 1.1, duration: 80 });
          });
          btn.on('pointerout', () => {
            this.tweens.add({ targets: btn, scaleX: 1, scaleY: 1, duration: 80 });
          });
          btn.on('pointerdown', () => {
            this.audioManager.resume();
            if (this.audioManager) this.audioManager.playButtonClick();
            this.cameras.main.fadeOut(400, 0, 0, 0);
            this.time.delayedCall(400, () => {
              this.scene.start('GameScene', { level: level.index, lives: 3 });
            });
          });
        }
      });

      worldY += 150;
    });

    // Back button
    const backBtn = this.add.container(GAME_WIDTH / 2, GAME_HEIGHT - 60);
    const backBg = this.add.graphics();
    backBg.fillStyle(0xFF9800, 0.9);
    backBg.fillRoundedRect(-80, -25, 160, 50, 12);
    backBg.lineStyle(3, 0xFFEB3B);
    backBg.strokeRoundedRect(-80, -25, 160, 50, 12);
    const backText = this.add.text(0, 0, 'BACK', {
      fontFamily: 'Arial Black', fontSize: '24px', color: '#FFFFFF'
    }).setOrigin(0.5);
    backBtn.add([backBg, backText]);
    backBtn.setSize(160, 50);
    backBtn.setInteractive({ useHandCursor: true });

    backBtn.on('pointerover', () => {
      this.tweens.add({ targets: backBtn, scaleX: 1.05, scaleY: 1.05, duration: 80 });
    });
    backBtn.on('pointerout', () => {
      this.tweens.add({ targets: backBtn, scaleX: 1, scaleY: 1, duration: 80 });
    });
    backBtn.on('pointerdown', () => {
      if (this.audioManager) this.audioManager.playButtonClick();
      this.scene.start('MenuScene');
    });

    // Stats footer
    const stats = StorageService.getStats();
    this.add.text(GAME_WIDTH / 2, GAME_HEIGHT - 20,
      `Levels Unlocked: ${stats.unlockedLevels}/${LEVELS.length} | Total Coins: ${stats.totalCoins}`, {
      fontFamily: 'Arial', fontSize: '14px', color: '#607D8B'
    }).setOrigin(0.5);

    this.cameras.main.fadeIn(400);
  }
}
