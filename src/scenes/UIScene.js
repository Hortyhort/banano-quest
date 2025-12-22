import Phaser from 'phaser';
import { GAME_WIDTH, COLORS } from '../config/gameConfig.js';

export class UIScene extends Phaser.Scene {
  constructor() {
    super({ key: 'UIScene' });
  }

  init(data) {
    this.gameScene = data.gameScene;
  }

  create() {
    // Score display with coin icon
    this.createScoreDisplay();

    // Level display
    this.createLevelDisplay();

    // Listen for updates from GameScene
    if (this.gameScene) {
      this.gameScene.events.on('updateScore', this.updateScore, this);
      this.gameScene.events.on('updateLevel', this.updateLevel, this);
    }
  }

  createScoreDisplay() {
    // Background panel
    const panel = this.add.graphics();
    panel.fillStyle(0x000000, 0.3);
    panel.fillRoundedRect(15, 15, 180, 50, 10);

    // Coin icon
    const coinIcon = this.add.image(50, 40, 'coin').setScale(0.8);

    // Animate coin
    this.tweens.add({
      targets: coinIcon,
      angle: 360,
      duration: 3000,
      repeat: -1
    });

    // Score text
    this.scoreText = this.add.text(80, 40, '0', {
      fontFamily: 'Arial Black, Arial',
      fontSize: '28px',
      color: '#FFFFFF',
      stroke: '#000000',
      strokeThickness: 4
    }).setOrigin(0, 0.5);
  }

  createLevelDisplay() {
    // Background panel
    const panel = this.add.graphics();
    panel.fillStyle(0x000000, 0.3);
    panel.fillRoundedRect(GAME_WIDTH - 145, 15, 130, 50, 10);

    // Level text
    this.levelText = this.add.text(GAME_WIDTH - 80, 40, 'Level 1', {
      fontFamily: 'Arial Black, Arial',
      fontSize: '24px',
      color: '#FFFFFF',
      stroke: '#000000',
      strokeThickness: 4
    }).setOrigin(0.5);
  }

  updateScore(score) {
    if (this.scoreText) {
      // Animate score change
      this.tweens.add({
        targets: this.scoreText,
        scaleX: 1.3,
        scaleY: 1.3,
        duration: 100,
        yoyo: true
      });

      this.scoreText.setText(score.toString());
    }
  }

  updateLevel(level) {
    if (this.levelText) {
      this.levelText.setText(`Level ${level}`);
    }
  }
}
