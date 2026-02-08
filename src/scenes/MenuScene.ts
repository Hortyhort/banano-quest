import Phaser from 'phaser';
import { GAME_WIDTH, GAME_HEIGHT, COLORS } from '../config/gameConfig.ts';

export class MenuScene extends Phaser.Scene {
  constructor() {
    super({ key: 'MenuScene' });
  }

  create() {
    const bg = this.add.graphics();
    bg.fillGradientStyle(0x87ceeb, 0x87ceeb, 0x4fc3f7, 0x4fc3f7, 1);
    bg.fillRect(0, 0, GAME_WIDTH, GAME_HEIGHT);

    this.add
      .text(GAME_WIDTH / 2 + 4, 154, 'BANANO QUEST', {
        fontFamily: 'Arial Black, Arial',
        fontSize: '72px',
        color: '#000000',
      })
      .setOrigin(0.5)
      .setAlpha(0.3);

    const title = this.add
      .text(GAME_WIDTH / 2, 150, 'BANANO QUEST', {
        fontFamily: 'Arial Black, Arial',
        fontSize: '72px',
        color: '#FFEB3B',
        stroke: '#FF9800',
        strokeThickness: 8,
      })
      .setOrigin(0.5);

    this.tweens.add({
      targets: title,
      y: 160,
      duration: 1500,
      ease: 'Sine.easeInOut',
      yoyo: true,
      repeat: -1,
    });

    this.add
      .text(GAME_WIDTH / 2, 230, 'Collect all the Banano coins!', {
        fontFamily: 'Arial',
        fontSize: '28px',
        color: '#FFFFFF',
        stroke: '#000000',
        strokeThickness: 4,
      })
      .setOrigin(0.5);

    const coinPositions = [
      { x: 200, y: 400 },
      { x: 350, y: 350 },
      { x: 500, y: 420 },
      { x: 780, y: 420 },
      { x: 930, y: 350 },
      { x: 1080, y: 400 },
    ];

    coinPositions.forEach((pos, i) => {
      const coin = this.add.image(pos.x, pos.y, 'coin');
      this.tweens.add({
        targets: coin,
        y: pos.y - 20,
        angle: 360,
        duration: 2000 + i * 200,
        ease: 'Sine.easeInOut',
        yoyo: true,
        repeat: -1,
      });
    });

    const playButton = this.add.container(GAME_WIDTH / 2, 500);

    const buttonBg = this.add.graphics();
    buttonBg.fillStyle(COLORS.BANANO_YELLOW);
    buttonBg.fillRoundedRect(-120, -40, 240, 80, 16);
    buttonBg.lineStyle(4, 0xff9800);
    buttonBg.strokeRoundedRect(-120, -40, 240, 80, 16);

    const buttonText = this.add
      .text(0, 0, 'PLAY', {
        fontFamily: 'Arial Black, Arial',
        fontSize: '48px',
        color: '#795548',
      })
      .setOrigin(0.5);

    playButton.add([buttonBg, buttonText]);
    playButton.setSize(240, 80);
    playButton.setInteractive({ useHandCursor: true });

    playButton.on('pointerover', () => {
      this.tweens.add({
        targets: playButton,
        scaleX: 1.1,
        scaleY: 1.1,
        duration: 100,
      });
    });

    playButton.on('pointerout', () => {
      this.tweens.add({
        targets: playButton,
        scaleX: 1,
        scaleY: 1,
        duration: 100,
      });
    });

    playButton.on('pointerdown', () => {
      this.cameras.main.fadeOut(500, 0, 0, 0);
      this.time.delayedCall(500, () => {
        this.scene.start('GameScene');
      });
    });

    this.add
      .text(GAME_WIDTH / 2, 620, 'Arrow Keys or WASD to move | SPACE to jump', {
        fontFamily: 'Arial',
        fontSize: '20px',
        color: '#FFFFFF',
        stroke: '#000000',
        strokeThickness: 3,
      })
      .setOrigin(0.5);

    const monkey = this.add.image(GAME_WIDTH / 2, 380, 'monkey');
    monkey.setScale(2);
    this.tweens.add({
      targets: monkey,
      y: 390,
      duration: 800,
      ease: 'Sine.easeInOut',
      yoyo: true,
      repeat: -1,
    });

    this.cameras.main.fadeIn(500);
  }
}
