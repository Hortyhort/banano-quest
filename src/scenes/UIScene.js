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

    // Power-up indicator (S5.1)
    this.createPowerUpDisplay();

    // Listen for updates from GameScene
    if (this.gameScene) {
      this.gameScene.events.on('updateScore', this.updateScore, this);
      this.gameScene.events.on('updateLevel', this.updateLevel, this);
      this.gameScene.events.on('updateHighScore', this.updateHighScore, this);
      this.gameScene.events.on('updateLives', this.updateLives, this);
      this.gameScene.events.on('updatePowerUp', this.updatePowerUp, this);
    }

    // Clean up timer on shutdown
    this.events.once('shutdown', () => {
      if (this.powerUpTimerEvent) {
        this.powerUpTimerEvent.remove();
        this.powerUpTimerEvent = null;
      }
    });
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

  createPowerUpDisplay() {
    // Container for power-up indicator (hidden by default)
    this.powerUpContainer = this.add.container(GAME_WIDTH / 2, 80);
    this.powerUpContainer.setAlpha(0);

    const bg = this.add.graphics();
    bg.fillStyle(0x000000, 0.4);
    bg.fillRoundedRect(-70, -18, 140, 36, 8);
    this.powerUpContainer.add(bg);

    this.powerUpIcon = this.add.circle(-48, 0, 10, 0xFFFFFF);
    this.powerUpContainer.add(this.powerUpIcon);

    this.powerUpText = this.add.text(-30, 0, '', {
      fontFamily: 'Arial Black, Arial',
      fontSize: '14px',
      color: '#FFFFFF',
      stroke: '#000000',
      strokeThickness: 2
    }).setOrigin(0, 0.5);
    this.powerUpContainer.add(this.powerUpText);

    // Timer bar background
    this.powerUpBarBg = this.add.graphics();
    this.powerUpBarBg.fillStyle(0x333333, 0.6);
    this.powerUpBarBg.fillRoundedRect(-50, 12, 100, 6, 3);
    this.powerUpContainer.add(this.powerUpBarBg);

    // Timer bar fill
    this.powerUpBar = this.add.graphics();
    this.powerUpContainer.add(this.powerUpBar);

    this.powerUpDuration = 0;
    this.powerUpStartTime = 0;
  }

  updatePowerUp(type, duration) {
    if (!type) {
      // Power-up expired
      this.tweens.add({
        targets: this.powerUpContainer,
        alpha: 0,
        duration: 300
      });
      this.powerUpDuration = 0;
      return;
    }

    const labels = {
      speed: 'SPEED',
      doubleJump: 'DBL JUMP',
      magnet: 'MAGNET'
    };
    const colors = {
      speed: 0x42A5F5,
      doubleJump: 0xFFFFFF,
      magnet: 0xFFEB3B
    };

    this.powerUpIcon.setFillStyle(colors[type] || 0xFFFFFF);
    this.powerUpText.setText(labels[type] || type);
    this.powerUpDuration = duration;
    this.powerUpStartTime = this.time.now;

    // Show with pop
    this.powerUpContainer.setAlpha(0).setScale(0.5);
    this.tweens.add({
      targets: this.powerUpContainer,
      alpha: 1,
      scaleX: 1,
      scaleY: 1,
      duration: 300,
      ease: 'Back.easeOut'
    });

    // Update timer bar
    if (this.powerUpTimerEvent) this.powerUpTimerEvent.remove();
    this.powerUpTimerEvent = this.time.addEvent({
      delay: 50,
      callback: () => {
        const elapsed = this.time.now - this.powerUpStartTime;
        const remaining = Math.max(0, 1 - elapsed / this.powerUpDuration);
        this.powerUpBar.clear();
        const barColor = remaining > 0.3 ? (colors[type] || 0xFFFFFF) : 0xFF4444;
        this.powerUpBar.fillStyle(barColor, 0.9);
        this.powerUpBar.fillRoundedRect(-50, 12, 100 * remaining, 6, 3);
      },
      loop: true
    });
  }
}
