import Phaser from 'phaser';
import { GAME_WIDTH, GAME_HEIGHT } from '../config/gameConfig.js';

export class TouchControls {
  constructor(scene) {
    this.scene = scene;
    this.left = false;
    this.right = false;
    this.jump = false;
    this.jumpJustPressed = false;
    this._jumpWasDown = false;
    this.visible = false;

    // Only show on touch devices
    if (!scene.sys.game.device.input.touch) return;

    this.visible = true;
    this.createButtons();
  }

  createButtons() {
    const scene = this.scene;
    const btnSize = 70;
    const margin = 20;
    const bottomY = GAME_HEIGHT - margin - btnSize / 2;
    const alpha = 0.35;

    // --- Left button ---
    this.leftBtn = this.makeButton(
      margin + btnSize / 2,
      bottomY,
      btnSize,
      '\u25C0',
      alpha
    );
    this.setupButton(this.leftBtn, 'left');

    // --- Right button ---
    this.rightBtn = this.makeButton(
      margin + btnSize + 15 + btnSize / 2,
      bottomY,
      btnSize,
      '\u25B6',
      alpha
    );
    this.setupButton(this.rightBtn, 'right');

    // --- Jump button ---
    const jumpSize = 90;
    this.jumpBtn = this.makeButton(
      GAME_WIDTH - margin - jumpSize / 2,
      bottomY,
      jumpSize,
      '\u25B2',
      alpha
    );
    this.setupButton(this.jumpBtn, 'jump');
  }

  makeButton(x, y, size, label, alpha) {
    const scene = this.scene;
    const container = scene.add.container(x, y);
    container.setDepth(1000);
    container.setScrollFactor(0);

    const bg = scene.add.graphics();
    bg.fillStyle(0x000000, alpha);
    bg.fillRoundedRect(-size / 2, -size / 2, size, size, 14);
    bg.lineStyle(2, 0xffffff, alpha * 0.8);
    bg.strokeRoundedRect(-size / 2, -size / 2, size, size, 14);

    const text = scene.add.text(0, 0, label, {
      fontFamily: 'Arial',
      fontSize: `${Math.floor(size * 0.45)}px`,
      color: '#ffffff'
    }).setOrigin(0.5).setAlpha(alpha + 0.3);

    container.add([bg, text]);
    container.setSize(size, size);
    container.setInteractive();

    return container;
  }

  setupButton(container, action) {
    container.on('pointerdown', () => {
      this[action] = true;
      container.setAlpha(0.9);
    });

    container.on('pointerup', () => {
      this[action] = false;
      container.setAlpha(1);
    });

    container.on('pointerout', () => {
      this[action] = false;
      container.setAlpha(1);
    });
  }

  update() {
    // Edge-detect jump (only trigger once per press)
    this.jumpJustPressed = this.jump && !this._jumpWasDown;
    this._jumpWasDown = this.jump;
  }

  destroy() {
    if (this.leftBtn) this.leftBtn.destroy();
    if (this.rightBtn) this.rightBtn.destroy();
    if (this.jumpBtn) this.jumpBtn.destroy();
  }
}
