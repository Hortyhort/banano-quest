import Phaser from 'phaser';
import { GAME_WIDTH, GAME_HEIGHT, COLORS, LEVELS, WORLD_THEMES } from '../config/gameConfig.js';
import { StorageService } from '../services/StorageService.js';
import { AudioManager } from '../services/AudioManager.js';
import { AchievementService } from '../services/AchievementService.js';

export class MenuScene extends Phaser.Scene {
  constructor() {
    super({ key: 'MenuScene' });
    this.audioManager = null;
  }

  create() {
    if (!this.audioManager) {
      this.audioManager = new AudioManager();
      this.audioManager.init();
    }

    // Background
    const bg = this.add.graphics();
    bg.fillGradientStyle(0x87CEEB, 0x87CEEB, 0x4FC3F7, 0x4FC3F7, 1);
    bg.fillRect(0, 0, GAME_WIDTH, GAME_HEIGHT);

    // Title shadow + text
    this.add.text(GAME_WIDTH / 2 + 4, 104, 'BANANO QUEST', {
      fontFamily: 'Arial Black, Arial', fontSize: '72px', color: '#000000'
    }).setOrigin(0.5).setAlpha(0.3);

    const title = this.add.text(GAME_WIDTH / 2, 100, 'BANANO QUEST', {
      fontFamily: 'Arial Black, Arial', fontSize: '72px',
      color: '#FFEB3B', stroke: '#FF9800', strokeThickness: 8
    }).setOrigin(0.5);

    this.tweens.add({
      targets: title, y: 110,
      duration: 1500, ease: 'Sine.easeInOut', yoyo: true, repeat: -1
    });

    // Subtitle
    this.add.text(GAME_WIDTH / 2, 175, 'Collect all the Banano coins!', {
      fontFamily: 'Arial', fontSize: '28px',
      color: '#FFFFFF', stroke: '#000000', strokeThickness: 4
    }).setOrigin(0.5);

    // Stats row
    const stats = StorageService.getStats();
    const worldCount = Object.keys(WORLD_THEMES).length;
    this.add.text(GAME_WIDTH / 2, 210,
      `Total Coins: ${stats.totalCoins} | High Score: ${stats.highScore} | Levels: ${stats.unlockedLevels}/${LEVELS.length}`, {
      fontFamily: 'Arial', fontSize: '18px',
      color: '#B0BEC5', stroke: '#000000', strokeThickness: 2
    }).setOrigin(0.5);

    // Achievement counter
    const achieveCount = AchievementService.getUnlockedCount();
    const achieveTotal = AchievementService.getTotalCount();
    this.add.text(GAME_WIDTH / 2, 235,
      `\u{1F3C6} Achievements: ${achieveCount}/${achieveTotal}`, {
      fontFamily: 'Arial', fontSize: '16px',
      color: achieveCount > 0 ? '#FFD700' : '#607D8B',
      stroke: '#000000', strokeThickness: 2
    }).setOrigin(0.5);

    // Decorative coins
    [{ x: 200, y: 340 }, { x: 350, y: 300 }, { x: 500, y: 360 },
     { x: 780, y: 360 }, { x: 930, y: 300 }, { x: 1080, y: 340 }
    ].forEach((pos, i) => {
      const coin = this.add.image(pos.x, pos.y, 'coin');
      this.tweens.add({
        targets: coin, y: pos.y - 20, angle: 360,
        duration: 2000 + i * 200, ease: 'Sine.easeInOut', yoyo: true, repeat: -1
      });
    });

    // Monkey preview
    const monkey = this.add.image(GAME_WIDTH / 2, 320, 'monkey').setScale(2);
    this.tweens.add({
      targets: monkey, y: 330,
      duration: 800, ease: 'Sine.easeInOut', yoyo: true, repeat: -1
    });

    // Play button (starts level 1)
    this.createButton(GAME_WIDTH / 2 - 140, 430, 'PLAY', 0xFFEB3B, 0xFF9800, '#795548', 200, () => {
      this.cameras.main.fadeOut(500, 0, 0, 0);
      this.time.delayedCall(500, () => {
        this.scene.start('GameScene', { level: 0, lives: 3 });
      });
    });

    // Level Select button
    this.createButton(GAME_WIDTH / 2 + 140, 430, 'LEVELS', 0xFF9800, 0xF57C00, '#FFFFFF', 200, () => {
      this.cameras.main.fadeOut(400, 0, 0, 0);
      this.time.delayedCall(400, () => {
        this.scene.start('LevelSelectScene');
      });
    });

    // Instructions (mobile-aware)
    const isMobile = !this.sys.game.device.os.desktop;
    this.add.text(GAME_WIDTH / 2, 520, isMobile
      ? 'Use on-screen buttons to move and jump'
      : 'Arrow Keys or WASD to move | SPACE to jump', {
      fontFamily: 'Arial', fontSize: '20px',
      color: '#FFFFFF', stroke: '#000000', strokeThickness: 3
    }).setOrigin(0.5);

    // Version info
    this.add.text(GAME_WIDTH / 2, 560, `${LEVELS.length} Levels | ${worldCount} Worlds`, {
      fontFamily: 'Arial', fontSize: '16px',
      color: '#90CAF9', stroke: '#000000', strokeThickness: 2
    }).setOrigin(0.5);

    this.cameras.main.fadeIn(500);
  }

  createButton(x, y, label, fillColor, strokeColor, textColor, width, callback) {
    const btn = this.add.container(x, y);
    const bg = this.add.graphics();
    const hw = width / 2;
    bg.fillStyle(fillColor);
    bg.fillRoundedRect(-hw, -35, width, 70, 16);
    bg.lineStyle(4, strokeColor);
    bg.strokeRoundedRect(-hw, -35, width, 70, 16);
    const text = this.add.text(0, 0, label, {
      fontFamily: 'Arial Black, Arial', fontSize: '36px', color: textColor
    }).setOrigin(0.5);
    btn.add([bg, text]);
    btn.setSize(width, 70);
    btn.setInteractive({ useHandCursor: true });

    btn.on('pointerover', () => {
      this.tweens.add({ targets: btn, scaleX: 1.08, scaleY: 1.08, duration: 80 });
    });
    btn.on('pointerout', () => {
      this.tweens.add({ targets: btn, scaleX: 1, scaleY: 1, duration: 80 });
    });
    btn.on('pointerdown', () => {
      this.audioManager.resume();
      if (this.audioManager) this.audioManager.playButtonClick();
      callback();
    });
  }
}
