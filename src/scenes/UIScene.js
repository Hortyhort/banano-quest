import Phaser from 'phaser';
import { GAME_WIDTH } from '../config/gameConfig.js';
import { AchievementService } from '../services/AchievementService.js';

export class UIScene extends Phaser.Scene {
  constructor() {
    super({ key: 'UIScene' });
  }

  init(data) {
    this.gameScene = data.gameScene;
    this.currentLevel = data.level || 0;
    this.currentLives = data.lives || 3;
    this.totalLevels = data.totalLevels || 1;
    this.achievementQueue = [];
    this.showingAchievement = false;
  }

  create() {
    this.createScoreDisplay();
    this.createHighScoreDisplay();
    this.createLevelDisplay();
    this.createLivesDisplay();
    this.createComboDisplay();
    this.createTimerDisplay();
    this.createPauseButton();
    this.createAchievementContainer();

    if (this.gameScene) {
      this.gameScene.events.on('updateScore', this.updateScore, this);
      this.gameScene.events.on('updateLevel', this.updateLevel, this);
      this.gameScene.events.on('updateHighScore', this.updateHighScore, this);
      this.gameScene.events.on('updateLives', this.updateLives, this);
      this.gameScene.events.on('updateCombo', this.updateCombo, this);
      this.gameScene.events.on('updateTimer', this.updateTimer, this);
      this.gameScene.events.on('checkAchievements', this.checkAchievements, this);
    }
  }

  createScoreDisplay() {
    const panel = this.add.graphics();
    panel.fillStyle(0x000000, 0.3);
    panel.fillRoundedRect(15, 15, 180, 50, 10);

    const coinIcon = this.add.image(50, 40, 'coin').setScale(0.8);
    this.tweens.add({
      targets: coinIcon, angle: 360,
      duration: 3000, repeat: -1
    });

    this.scoreText = this.add.text(80, 40, '0', {
      fontFamily: 'Arial Black, Arial', fontSize: '28px',
      color: '#FFFFFF', stroke: '#000000', strokeThickness: 4
    }).setOrigin(0, 0.5);
  }

  createHighScoreDisplay() {
    const panel = this.add.graphics();
    panel.fillStyle(0x000000, 0.3);
    panel.fillRoundedRect(210, 15, 160, 50, 10);

    this.add.text(230, 40, '\u2605', {
      fontFamily: 'Arial', fontSize: '24px', color: '#FFD700'
    }).setOrigin(0.5);

    this.highScoreText = this.add.text(255, 40, 'Best: 0', {
      fontFamily: 'Arial Black, Arial', fontSize: '20px',
      color: '#FFD700', stroke: '#000000', strokeThickness: 3
    }).setOrigin(0, 0.5);
  }

  createLevelDisplay() {
    const panel = this.add.graphics();
    panel.fillStyle(0x000000, 0.3);
    panel.fillRoundedRect(GAME_WIDTH - 145, 15, 130, 50, 10);

    this.levelText = this.add.text(GAME_WIDTH - 80, 40, `Level ${this.currentLevel + 1}`, {
      fontFamily: 'Arial Black, Arial', fontSize: '24px',
      color: '#FFFFFF', stroke: '#000000', strokeThickness: 4
    }).setOrigin(0.5);
  }

  createLivesDisplay() {
    const panel = this.add.graphics();
    panel.fillStyle(0x000000, 0.3);
    panel.fillRoundedRect(15, 75, 120, 40, 10);

    this.livesText = this.add.text(30, 95, '', {
      fontFamily: 'Arial', fontSize: '22px', color: '#FF5252'
    }).setOrigin(0, 0.5);

    this.updateLives(this.currentLives);
  }

  createComboDisplay() {
    this.comboText = this.add.text(GAME_WIDTH / 2, 35, '', {
      fontFamily: 'Arial Black, Arial', fontSize: '24px',
      color: '#FF9800', stroke: '#000000', strokeThickness: 4
    }).setOrigin(0.5).setAlpha(0);
  }

  createTimerDisplay() {
    const panel = this.add.graphics();
    panel.fillStyle(0x000000, 0.3);
    panel.fillRoundedRect(GAME_WIDTH - 145, 75, 130, 40, 10);

    this.timerText = this.add.text(GAME_WIDTH - 80, 95, '0s', {
      fontFamily: 'Arial', fontSize: '20px',
      color: '#B0BEC5', stroke: '#000000', strokeThickness: 3
    }).setOrigin(0.5);
  }

  createPauseButton() {
    const btn = this.add.container(GAME_WIDTH - 40, 140);

    const bg = this.add.graphics();
    bg.fillStyle(0x000000, 0.4);
    bg.fillRoundedRect(-22, -22, 44, 44, 10);

    // Pause icon (two bars)
    const icon = this.add.graphics();
    icon.fillStyle(0xFFFFFF, 0.9);
    icon.fillRect(-8, -10, 6, 20);
    icon.fillRect(2, -10, 6, 20);

    btn.add([bg, icon]);
    btn.setSize(44, 44);
    btn.setInteractive({ useHandCursor: true });
    btn.setDepth(1000);

    btn.on('pointerover', () => {
      this.tweens.add({ targets: btn, scaleX: 1.1, scaleY: 1.1, duration: 60 });
    });
    btn.on('pointerout', () => {
      this.tweens.add({ targets: btn, scaleX: 1, scaleY: 1, duration: 60 });
    });
    btn.on('pointerdown', () => {
      if (this.gameScene) {
        this.gameScene.togglePause();
      }
    });
  }

  createAchievementContainer() {
    // Achievement notification banner (hidden initially)
    this.achieveBanner = this.add.container(GAME_WIDTH / 2, -80).setDepth(2000);

    const bannerBg = this.add.graphics();
    bannerBg.fillStyle(0x1B5E20, 0.95);
    bannerBg.fillRoundedRect(-160, -35, 320, 70, 14);
    bannerBg.lineStyle(2, 0xFFD700, 0.9);
    bannerBg.strokeRoundedRect(-160, -35, 320, 70, 14);

    this.achieveIcon = this.add.text(-140, 0, '\u{1F3C6}', {
      fontSize: '28px'
    }).setOrigin(0.5);

    this.achieveTitle = this.add.text(-10, -12, '', {
      fontFamily: 'Arial Black', fontSize: '18px',
      color: '#FFD700', stroke: '#000000', strokeThickness: 2
    }).setOrigin(0.5);

    this.achieveDesc = this.add.text(-10, 12, '', {
      fontFamily: 'Arial', fontSize: '14px',
      color: '#FFFFFF'
    }).setOrigin(0.5);

    this.achieveBanner.add([bannerBg, this.achieveIcon, this.achieveTitle, this.achieveDesc]);
  }

  checkAchievements() {
    const pending = AchievementService.getPending();
    if (pending.length > 0) {
      this.achievementQueue.push(...pending);
      if (!this.showingAchievement) {
        this.showNextAchievement();
      }
    }
  }

  showNextAchievement() {
    if (this.achievementQueue.length === 0) {
      this.showingAchievement = false;
      return;
    }

    this.showingAchievement = true;
    const achievement = this.achievementQueue.shift();

    this.achieveTitle.setText(achievement.name);
    this.achieveDesc.setText(achievement.desc);

    // Slide in from top
    this.achieveBanner.y = -80;
    this.tweens.add({
      targets: this.achieveBanner,
      y: 60,
      duration: 400,
      ease: 'Back.easeOut',
      onComplete: () => {
        // Hold for 2.5s then slide out
        this.time.delayedCall(2500, () => {
          this.tweens.add({
            targets: this.achieveBanner,
            y: -80,
            duration: 300,
            ease: 'Power2',
            onComplete: () => {
              this.showNextAchievement();
            }
          });
        });
      }
    });
  }

  updateScore(score) {
    if (this.scoreText) {
      this.tweens.add({
        targets: this.scoreText, scaleX: 1.3, scaleY: 1.3,
        duration: 100, yoyo: true
      });
      this.scoreText.setText(score.toString());
    }
  }

  updateLevel(level) {
    if (this.levelText) this.levelText.setText(`Level ${level}`);
  }

  updateHighScore(highScore) {
    if (this.highScoreText) this.highScoreText.setText(`Best: ${highScore}`);
  }

  updateLives(lives) {
    if (this.livesText) {
      this.livesText.setText('\u2764'.repeat(Math.max(0, lives)));
      if (lives <= 1) {
        this.tweens.add({
          targets: this.livesText,
          alpha: { from: 1, to: 0.4 }, duration: 300,
          yoyo: true, repeat: 2
        });
      }
    }
  }

  updateCombo(combo) {
    if (!this.comboText) return;
    if (combo >= 2) {
      this.comboText.setText(`COMBO x${combo}!`);
      this.comboText.setAlpha(1);
      this.tweens.add({
        targets: this.comboText,
        scaleX: 1.3, scaleY: 1.3,
        duration: 100, yoyo: true
      });
    } else {
      this.tweens.add({
        targets: this.comboText,
        alpha: 0, duration: 300
      });
    }
  }

  updateTimer(seconds) {
    if (this.timerText) {
      this.timerText.setText(`${seconds}s`);
    }
  }
}
