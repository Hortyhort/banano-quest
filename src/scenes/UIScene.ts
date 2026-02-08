import Phaser from 'phaser';
import { GAME_WIDTH } from '../config/gameConfig.ts';
import { AudioManager } from '../services/AudioManager.ts';

export class UIScene extends Phaser.Scene {
  private gameScene: Phaser.Scene | null = null;
  private scoreText!: Phaser.GameObjects.Text;
  private highScoreText!: Phaser.GameObjects.Text;
  private levelText!: Phaser.GameObjects.Text;
  private livesText!: Phaser.GameObjects.Text;
  private muteButton!: Phaser.GameObjects.Text;

  constructor() {
    super({ key: 'UIScene' });
  }

  init(data: { gameScene: Phaser.Scene }) {
    this.gameScene = data.gameScene;
  }

  create() {
    this.createScoreDisplay();
    this.createHighScoreDisplay();
    this.createLevelDisplay();
    this.createLivesDisplay();
    this.createMuteButton();

    if (this.gameScene) {
      this.gameScene.events.on('updateScore', this.updateScore, this);
      this.gameScene.events.on('updateLevel', this.updateLevel, this);
      this.gameScene.events.on('updateHighScore', this.updateHighScore, this);
      this.gameScene.events.on('updateLives', this.updateLives, this);
    }
  }

  private createScoreDisplay() {
    const panel = this.add.graphics();
    panel.fillStyle(0x000000, 0.3);
    panel.fillRoundedRect(15, 15, 180, 50, 10);

    const coinIcon = this.add.image(50, 40, 'coin').setScale(0.8);
    this.tweens.add({
      targets: coinIcon,
      angle: 360,
      duration: 3000,
      repeat: -1,
    });

    this.scoreText = this.add
      .text(80, 40, '0', {
        fontFamily: 'Arial Black, Arial',
        fontSize: '28px',
        color: '#FFFFFF',
        stroke: '#000000',
        strokeThickness: 4,
      })
      .setOrigin(0, 0.5);
  }

  private createHighScoreDisplay() {
    const panel = this.add.graphics();
    panel.fillStyle(0x000000, 0.3);
    panel.fillRoundedRect(210, 15, 160, 50, 10);

    this.add
      .text(230, 40, '\u2605', {
        fontFamily: 'Arial',
        fontSize: '24px',
        color: '#FFD700',
      })
      .setOrigin(0.5);

    this.highScoreText = this.add
      .text(255, 40, 'Best: 0', {
        fontFamily: 'Arial Black, Arial',
        fontSize: '20px',
        color: '#FFD700',
        stroke: '#000000',
        strokeThickness: 3,
      })
      .setOrigin(0, 0.5);
  }

  private createLevelDisplay() {
    const panel = this.add.graphics();
    panel.fillStyle(0x000000, 0.3);
    panel.fillRoundedRect(GAME_WIDTH - 145, 15, 130, 50, 10);

    this.levelText = this.add
      .text(GAME_WIDTH - 80, 40, 'Level 1', {
        fontFamily: 'Arial Black, Arial',
        fontSize: '24px',
        color: '#FFFFFF',
        stroke: '#000000',
        strokeThickness: 4,
      })
      .setOrigin(0.5);
  }

  private createLivesDisplay() {
    const panel = this.add.graphics();
    panel.fillStyle(0x000000, 0.3);
    panel.fillRoundedRect(GAME_WIDTH - 290, 15, 130, 50, 10);

    this.add
      .text(GAME_WIDTH - 270, 40, '\u2764', {
        fontFamily: 'Arial',
        fontSize: '24px',
        color: '#FF1744',
      })
      .setOrigin(0, 0.5);

    this.livesText = this.add
      .text(GAME_WIDTH - 240, 40, 'x 3', {
        fontFamily: 'Arial Black, Arial',
        fontSize: '24px',
        color: '#FFFFFF',
        stroke: '#000000',
        strokeThickness: 4,
      })
      .setOrigin(0, 0.5);
  }

  private createMuteButton() {
    const panel = this.add.graphics();
    panel.fillStyle(0x000000, 0.3);
    panel.fillRoundedRect(GAME_WIDTH - 60, 680, 45, 30, 8);

    this.muteButton = this.add
      .text(GAME_WIDTH - 38, 695, AudioManager.isMuted() ? '\u{1F507}' : '\u{1F50A}', {
        fontFamily: 'Arial',
        fontSize: '20px',
      })
      .setOrigin(0.5)
      .setInteractive({ useHandCursor: true });

    this.muteButton.on('pointerdown', () => {
      const nowMuted = AudioManager.toggleMute();
      this.muteButton.setText(nowMuted ? '\u{1F507}' : '\u{1F50A}');
    });
  }

  private updateScore(score: number) {
    if (this.scoreText) {
      this.tweens.add({
        targets: this.scoreText,
        scaleX: 1.3,
        scaleY: 1.3,
        duration: 100,
        yoyo: true,
      });
      this.scoreText.setText(score.toString());
    }
  }

  private updateLevel(level: number) {
    if (this.levelText) {
      this.levelText.setText(`Level ${level}`);
    }
  }

  private updateHighScore(highScore: number) {
    if (this.highScoreText) {
      this.highScoreText.setText(`Best: ${highScore}`);
    }
  }

  private updateLives(lives: number) {
    if (this.livesText) {
      this.livesText.setText(`x ${lives}`);
      if (lives <= 1) {
        this.livesText.setColor('#FF1744');
      }
    }
  }
}
