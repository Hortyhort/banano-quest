import Phaser from 'phaser';
import { GAME_WIDTH, GAME_HEIGHT } from '../config/gameConfig.ts';
import { AudioManager } from '../services/AudioManager.ts';
import { TouchInput, isTouchDevice } from '../services/TouchInput.ts';

export class UIScene extends Phaser.Scene {
  private gameScene: Phaser.Scene | null = null;
  private scoreText!: Phaser.GameObjects.Text;
  private highScoreText!: Phaser.GameObjects.Text;
  private levelText!: Phaser.GameObjects.Text;
  private livesText!: Phaser.GameObjects.Text;
  private timerText!: Phaser.GameObjects.Text;
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
    this.createTimerDisplay();
    this.createMuteButton();
    if (isTouchDevice()) {
      this.createTouchControls();
    }

    if (this.gameScene) {
      this.gameScene.events.on('updateScore', this.updateScore, this);
      this.gameScene.events.on('updateLevel', this.updateLevel, this);
      this.gameScene.events.on('updateHighScore', this.updateHighScore, this);
      this.gameScene.events.on('updateLives', this.updateLives, this);
      this.gameScene.events.on('updateTimer', this.updateTimer, this);
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

  private createTimerDisplay() {
    const panel = this.add.graphics();
    panel.fillStyle(0x000000, 0.3);
    panel.fillRoundedRect(GAME_WIDTH / 2 - 60, 15, 120, 50, 10);

    this.add
      .text(GAME_WIDTH / 2 - 30, 40, '\u23F1', {
        fontFamily: 'Arial',
        fontSize: '20px',
        color: '#FFFFFF',
      })
      .setOrigin(0.5);

    this.timerText = this.add
      .text(GAME_WIDTH / 2 + 15, 40, '0s', {
        fontFamily: 'Arial Black, Arial',
        fontSize: '22px',
        color: '#FFFFFF',
        stroke: '#000000',
        strokeThickness: 3,
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

  private updateLevel(level: string | number) {
    if (this.levelText) {
      this.levelText.setText(typeof level === 'string' ? level : `Level ${level}`);
    }
  }

  private updateHighScore(highScore: number) {
    if (this.highScoreText) {
      this.highScoreText.setText(`Best: ${highScore}`);
    }
  }

  private updateTimer(seconds: number) {
    if (this.timerText) {
      this.timerText.setText(`${seconds}s`);
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

  // ─── Touch Controls ───

  private createTouchControls() {
    const btnAlpha = 0.25;
    const btnActiveAlpha = 0.5;
    const btnSize = 80;
    const padding = 20;
    const bottomY = GAME_HEIGHT - padding - btnSize / 2;

    // Left button
    this.createTouchButton(
      padding + btnSize / 2,
      bottomY,
      btnSize,
      '\u25C0',
      btnAlpha,
      btnActiveAlpha,
      () => {
        TouchInput.left = true;
      },
      () => {
        TouchInput.left = false;
      }
    );

    // Right button
    this.createTouchButton(
      padding + btnSize + padding + btnSize / 2,
      bottomY,
      btnSize,
      '\u25B6',
      btnAlpha,
      btnActiveAlpha,
      () => {
        TouchInput.right = true;
      },
      () => {
        TouchInput.right = false;
      }
    );

    // Jump button (right side, larger)
    const jumpSize = 100;
    this.createTouchButton(
      GAME_WIDTH - padding - jumpSize / 2,
      bottomY - 10,
      jumpSize,
      '\u25B2',
      btnAlpha,
      btnActiveAlpha,
      () => {
        TouchInput.jump = true;
      },
      () => {
        TouchInput.jump = false;
      }
    );

    // Clear touch state when scene shuts down
    this.events.on('shutdown', () => {
      TouchInput.left = false;
      TouchInput.right = false;
      TouchInput.jump = false;
    });
  }

  private createTouchButton(
    x: number,
    y: number,
    size: number,
    label: string,
    alpha: number,
    activeAlpha: number,
    onDown: () => void,
    onUp: () => void
  ): Phaser.GameObjects.Container {
    const bg = this.add.graphics();
    bg.fillStyle(0x000000, alpha);
    bg.fillRoundedRect(-size / 2, -size / 2, size, size, 16);
    bg.lineStyle(2, 0xffffff, alpha);
    bg.strokeRoundedRect(-size / 2, -size / 2, size, size, 16);

    const text = this.add
      .text(0, 0, label, {
        fontFamily: 'Arial',
        fontSize: `${Math.floor(size * 0.4)}px`,
        color: '#FFFFFF',
      })
      .setOrigin(0.5)
      .setAlpha(0.7);

    const container = this.add.container(x, y, [bg, text]);
    container.setSize(size, size);
    container.setInteractive();

    container.on('pointerdown', () => {
      bg.clear();
      bg.fillStyle(0xffffff, activeAlpha);
      bg.fillRoundedRect(-size / 2, -size / 2, size, size, 16);
      bg.lineStyle(2, 0xffffff, activeAlpha);
      bg.strokeRoundedRect(-size / 2, -size / 2, size, size, 16);
      text.setAlpha(1);
      onDown();
    });

    const release = () => {
      bg.clear();
      bg.fillStyle(0x000000, alpha);
      bg.fillRoundedRect(-size / 2, -size / 2, size, size, 16);
      bg.lineStyle(2, 0xffffff, alpha);
      bg.strokeRoundedRect(-size / 2, -size / 2, size, size, 16);
      text.setAlpha(0.7);
      onUp();
    };

    container.on('pointerup', release);
    container.on('pointerout', release);

    return container;
  }
}
