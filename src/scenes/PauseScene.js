import Phaser from 'phaser';
import { GAME_WIDTH, GAME_HEIGHT, COLORS } from '../config/gameConfig.js';
import { AudioManager } from '../services/AudioManager.js';

export class PauseScene extends Phaser.Scene {
  constructor() {
    super({ key: 'PauseScene' });
  }

  create() {
    // Dim overlay
    const overlay = this.add.rectangle(
      GAME_WIDTH / 2, GAME_HEIGHT / 2,
      GAME_WIDTH, GAME_HEIGHT,
      0x000000, 0.6
    );

    // Paused title
    this.add.text(GAME_WIDTH / 2, GAME_HEIGHT / 2 - 100, 'PAUSED', {
      fontFamily: 'Arial Black, Arial',
      fontSize: '64px',
      color: '#FFFFFF',
      stroke: '#000000',
      strokeThickness: 6
    }).setOrigin(0.5);

    // Buttons
    this.createButton(GAME_WIDTH / 2, GAME_HEIGHT / 2, 'RESUME', () => this.resumeGame());
    this.createButton(GAME_WIDTH / 2, GAME_HEIGHT / 2 + 70, 'RESTART', () => this.restartGame());
    this.createButton(GAME_WIDTH / 2, GAME_HEIGHT / 2 + 140, 'SETTINGS', () => {
      AudioManager.playSound('menu_click');
      this.scene.launch('SettingsScene', { returnTo: 'PauseScene' });
    });
    this.createButton(GAME_WIDTH / 2, GAME_HEIGHT / 2 + 210, 'QUIT', () => this.quitToMenu());

    // ESC or P to resume
    this.input.keyboard.once('keydown-ESC', () => this.resumeGame());
    this.input.keyboard.once('keydown-P', () => this.resumeGame());
  }

  createButton(x, y, label, callback) {
    const container = this.add.container(x, y);

    const bg = this.add.graphics();
    bg.fillStyle(0x333333, 0.9);
    bg.fillRoundedRect(-110, -28, 220, 56, 12);
    bg.lineStyle(2, 0xffffff, 0.5);
    bg.strokeRoundedRect(-110, -28, 220, 56, 12);

    const text = this.add.text(0, 0, label, {
      fontFamily: 'Arial Black, Arial',
      fontSize: '28px',
      color: '#FFFFFF'
    }).setOrigin(0.5);

    container.add([bg, text]);
    container.setSize(220, 56);
    container.setInteractive({ useHandCursor: true });

    container.on('pointerover', () => text.setColor('#FFEB3B'));
    container.on('pointerout', () => text.setColor('#FFFFFF'));
    container.on('pointerdown', callback);
  }

  resumeGame() {
    AudioManager.playSound('menu_click');
    this.scene.resume('GameScene');
    this.scene.stop();
  }

  restartGame() {
    AudioManager.playSound('menu_click');
    this.scene.stop('UIScene');
    this.scene.stop();
    this.scene.get('GameScene').scene.restart();
  }

  quitToMenu() {
    AudioManager.playSound('menu_click');
    AudioManager.stopMusic();
    this.scene.stop('UIScene');
    this.scene.stop('GameScene');
    this.scene.stop();
    this.scene.start('MenuScene');
  }
}
