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

    // High score display
    this.createHighScoreDisplay();

    // Level display
    this.createLevelDisplay();

    // Lives display
    this.createLivesDisplay();

    // Listen for updates from GameScene
    if (this.gameScene) {
      this.gameScene.events.on('updateScore', this.updateScore, this);
      this.gameScene.events.on('updateLevel', this.updateLevel, this);
      this.gameScene.events.on('updateHighScore', this.updateHighScore, this);
      this.gameScene.events.on('updateLives', this.updateLives, this);
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

  createHighScoreDisplay() {
    // Background panel
    const panel = this.add.graphics();
    panel.fillStyle(0x000000, 0.3);
    panel.fillRoundedRect(210, 15, 160, 50, 10);

    // Trophy icon (simple star shape)
    const star = this.add.text(230, 40, '★', {
      fontFamily: 'Arial',
      fontSize: '24px',
      color: '#FFD700'
    }).setOrigin(0.5);

    // High score text
    this.highScoreText = this.add.text(255, 40, 'Best: 0', {
      fontFamily: 'Arial Black, Arial',
      fontSize: '20px',
      color: '#FFD700',
      stroke: '#000000',
      strokeThickness: 3
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

  createLivesDisplay() {
    // Background panel
    const panel = this.add.graphics();
    panel.fillStyle(0x000000, 0.3);
    panel.fillRoundedRect(GAME_WIDTH - 290, 15, 130, 50, 10);

    // Heart icons
    this.heartIcons = [];
    for (let i = 0; i < 3; i++) {
      const heart = this.add.image(GAME_WIDTH - 270 + i * 38, 40, 'heart').setScale(0.9);
      this.heartIcons.push(heart);
    }
  }

  updateLives(lives) {
    this.heartIcons.forEach((heart, i) => {
      if (i < lives) {
        heart.setAlpha(1);
        heart.clearTint();
      } else {
        // Animate heart loss
        this.tweens.add({
          targets: heart,
          scaleX: 1.5,
          scaleY: 1.5,
          alpha: 0.2,
          duration: 200,
          yoyo: false,
          onComplete: () => {
            heart.setScale(0.9);
            heart.setTint(0x333333);
          }
        });
      }
    });
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

  updateHighScore(highScore) {
    if (this.highScoreText) {
      this.highScoreText.setText(`Best: ${highScore}`);
    }
  }
}
