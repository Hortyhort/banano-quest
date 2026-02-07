import Phaser from 'phaser';
import { GAME_WIDTH, GAME_HEIGHT, COLORS } from '../config/gameConfig.js';
import { StorageService } from '../services/StorageService.js';
import { AudioManager } from '../services/AudioManager.js';

export class GameOverScene extends Phaser.Scene {
  constructor() {
    super({ key: 'GameOverScene' });
  }

  init(data) {
    this.finalScore = data.score || 0;
    this.level = data.level || 1;
  }

  create() {
    // Check / set high score
    const isNewHighScore = StorageService.setHighScore(this.finalScore);
    const highScore = StorageService.getHighScore();

    // Dark background
    const bg = this.add.graphics();
    bg.fillGradientStyle(0x1a1a2e, 0x1a1a2e, 0x16213e, 0x16213e, 1);
    bg.fillRect(0, 0, GAME_WIDTH, GAME_HEIGHT);

    // Game Over text
    const title = this.add.text(GAME_WIDTH / 2, 180, 'GAME OVER', {
      fontFamily: 'Arial Black, Arial',
      fontSize: '72px',
      color: '#FF5252',
      stroke: '#000000',
      strokeThickness: 8
    }).setOrigin(0.5).setAlpha(0).setScale(0.5);

    this.tweens.add({
      targets: title,
      alpha: 1,
      scale: 1,
      duration: 500,
      ease: 'Back.easeOut'
    });

    // Score
    this.add.text(GAME_WIDTH / 2, 300, `Score: ${this.finalScore}`, {
      fontFamily: 'Arial Black, Arial',
      fontSize: '36px',
      color: '#FFFFFF',
      stroke: '#000000',
      strokeThickness: 4
    }).setOrigin(0.5);

    // High score
    const highScoreColor = isNewHighScore ? '#00FF00' : '#FFD700';
    const highScoreLabel = isNewHighScore ? 'NEW HIGH SCORE!' : `Best: ${highScore}`;

    const highText = this.add.text(GAME_WIDTH / 2, 360, highScoreLabel, {
      fontFamily: 'Arial Black, Arial',
      fontSize: '28px',
      color: highScoreColor,
      stroke: '#000000',
      strokeThickness: 4
    }).setOrigin(0.5);

    if (isNewHighScore) {
      this.tweens.add({
        targets: highText,
        scaleX: 1.15,
        scaleY: 1.15,
        duration: 400,
        yoyo: true,
        repeat: -1,
        ease: 'Sine.easeInOut'
      });
    }

    // Sad monkey
    const monkey = this.add.image(GAME_WIDTH / 2, 460, 'monkey');
    monkey.setScale(2.5);
    monkey.setTint(0x888888);
    this.tweens.add({
      targets: monkey,
      angle: { from: -5, to: 5 },
      duration: 800,
      yoyo: true,
      repeat: -1,
      ease: 'Sine.easeInOut'
    });

    // Play Again button
    const isTouchDevice = this.sys.game.device.input.touch;

    const buttonContainer = this.add.container(GAME_WIDTH / 2, 580);
    const buttonBg = this.add.graphics();
    buttonBg.fillStyle(COLORS.BANANO_YELLOW);
    buttonBg.fillRoundedRect(-130, -35, 260, 70, 14);
    buttonBg.lineStyle(3, 0xFF9800);
    buttonBg.strokeRoundedRect(-130, -35, 260, 70, 14);

    const buttonText = this.add.text(0, 0, 'PLAY AGAIN', {
      fontFamily: 'Arial Black, Arial',
      fontSize: '32px',
      color: '#795548'
    }).setOrigin(0.5);

    buttonContainer.add([buttonBg, buttonText]);
    buttonContainer.setSize(260, 70);
    buttonContainer.setInteractive({ useHandCursor: true });

    buttonContainer.on('pointerover', () => {
      this.tweens.add({ targets: buttonContainer, scaleX: 1.08, scaleY: 1.08, duration: 100 });
    });
    buttonContainer.on('pointerout', () => {
      this.tweens.add({ targets: buttonContainer, scaleX: 1, scaleY: 1, duration: 100 });
    });
    buttonContainer.on('pointerdown', () => {
      AudioManager.playSound('menu_click');
      this.playAgain();
    });

    this.input.keyboard.once('keydown-SPACE', () => this.playAgain());

    // Level select button
    const lsBtn = this.add.text(GAME_WIDTH / 2, 640, 'LEVEL SELECT', {
      fontFamily: 'Arial Black, Arial',
      fontSize: '18px',
      color: '#888888',
      stroke: '#000000',
      strokeThickness: 2
    }).setOrigin(0.5).setInteractive({ useHandCursor: true });
    lsBtn.on('pointerover', () => lsBtn.setColor('#FFEB3B'));
    lsBtn.on('pointerout', () => lsBtn.setColor('#888888'));
    lsBtn.on('pointerdown', () => {
      AudioManager.playSound('menu_click');
      this.cameras.main.fadeOut(300, 0, 0, 0);
      this.time.delayedCall(300, () => {
        this.scene.start('LevelSelectScene');
      });
    });

    this.cameras.main.fadeIn(300);
  }

  playAgain() {
    this.cameras.main.fadeOut(300, 0, 0, 0);
    this.time.delayedCall(300, () => {
      this.scene.start('GameScene', { level: this.level });
    });
  }
}
