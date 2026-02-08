import Phaser from 'phaser';
import { GAME_WIDTH, GAME_HEIGHT } from '../config/gameConfig.js';

export class PauseScene extends Phaser.Scene {
  constructor() {
    super({ key: 'PauseScene' });
  }

  init(data) {
    this.parentScene = data.parentScene;
  }

  create() {
    // Dim overlay
    const overlay = this.add.rectangle(
      GAME_WIDTH / 2, GAME_HEIGHT / 2, GAME_WIDTH, GAME_HEIGHT, 0x000000, 0.6
    );

    // PAUSED title
    this.add.text(GAME_WIDTH / 2, GAME_HEIGHT / 2 - 80, 'PAUSED', {
      fontFamily: 'Arial Black, Arial', fontSize: '56px',
      color: '#FFFFFF', stroke: '#000000', strokeThickness: 6
    }).setOrigin(0.5);

    // Resume button
    const resumeBtn = this.createButton(GAME_WIDTH / 2, GAME_HEIGHT / 2 + 10, 'RESUME', 0x4CAF50, () => {
      this.resumeGame();
    });

    // Restart button
    const restartBtn = this.createButton(GAME_WIDTH / 2, GAME_HEIGHT / 2 + 70, 'RESTART', 0xFF9800, () => {
      this.scene.stop();
      this.scene.stop('UIScene');
      this.parentScene.scene.restart({ level: this.parentScene.level, lives: 3 });
    });

    // Menu button
    const menuBtn = this.createButton(GAME_WIDTH / 2, GAME_HEIGHT / 2 + 130, 'MENU', 0xF44336, () => {
      this.scene.stop();
      this.scene.stop('UIScene');
      this.parentScene.scene.start('MenuScene');
    });

    // ESC or tap overlay to resume
    this.input.keyboard.on('keydown-ESC', () => this.resumeGame());
    this.input.keyboard.on('keydown-P', () => this.resumeGame());
  }

  createButton(x, y, text, color, callback) {
    const btn = this.add.container(x, y);
    const bg = this.add.graphics();
    bg.fillStyle(color, 0.9);
    bg.fillRoundedRect(-100, -22, 200, 44, 10);
    bg.lineStyle(2, 0xFFFFFF, 0.5);
    bg.strokeRoundedRect(-100, -22, 200, 44, 10);

    const label = this.add.text(0, 0, text, {
      fontFamily: 'Arial Black', fontSize: '22px', color: '#FFFFFF'
    }).setOrigin(0.5);

    btn.add([bg, label]);
    btn.setSize(200, 44);
    btn.setInteractive({ useHandCursor: true });

    btn.on('pointerover', () => {
      this.tweens.add({ targets: btn, scaleX: 1.05, scaleY: 1.05, duration: 60 });
    });
    btn.on('pointerout', () => {
      this.tweens.add({ targets: btn, scaleX: 1, scaleY: 1, duration: 60 });
    });
    btn.on('pointerdown', callback);

    return btn;
  }

  resumeGame() {
    this.scene.stop();
    this.parentScene.scene.resume();
    // Re-launch UIScene if it was paused
    if (!this.scene.isActive('UIScene')) {
      this.parentScene.scene.launch('UIScene', {
        gameScene: this.parentScene,
        level: this.parentScene.level,
        lives: this.parentScene.lives,
        totalLevels: this.parentScene.totalLevels || 8
      });
    }
  }
}
