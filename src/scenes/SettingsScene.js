import Phaser from 'phaser';
import { GAME_WIDTH, GAME_HEIGHT } from '../config/gameConfig.js';
import { AudioManager } from '../services/AudioManager.js';
import { StorageService } from '../services/StorageService.js';

export class SettingsScene extends Phaser.Scene {
  constructor() {
    super({ key: 'SettingsScene' });
  }

  init(data) {
    this.returnTo = data.returnTo || 'MenuScene';
  }

  create() {
    // Dim overlay
    this.add.rectangle(
      GAME_WIDTH / 2, GAME_HEIGHT / 2,
      GAME_WIDTH, GAME_HEIGHT,
      0x000000, 0.7
    );

    // Panel background
    const panel = this.add.graphics();
    panel.fillStyle(0x2E2E2E, 0.95);
    panel.fillRoundedRect(GAME_WIDTH / 2 - 220, GAME_HEIGHT / 2 - 200, 440, 400, 20);
    panel.lineStyle(3, 0xFFEB3B, 0.8);
    panel.strokeRoundedRect(GAME_WIDTH / 2 - 220, GAME_HEIGHT / 2 - 200, 440, 400, 20);

    // Title
    this.add.text(GAME_WIDTH / 2, GAME_HEIGHT / 2 - 160, 'SETTINGS', {
      fontFamily: 'Arial Black, Arial',
      fontSize: '42px',
      color: '#FFEB3B',
      stroke: '#000000',
      strokeThickness: 4
    }).setOrigin(0.5);

    // Toggle rows
    const settings = AudioManager.getSettings();
    const startY = GAME_HEIGHT / 2 - 70;

    this.createToggle(GAME_WIDTH / 2, startY, 'Sound Effects', settings.soundEnabled, (val) => {
      AudioManager.setSoundEnabled(val);
      if (val) AudioManager.playSound('menu_click');
    });

    this.createToggle(GAME_WIDTH / 2, startY + 80, 'Music', settings.musicEnabled, (val) => {
      AudioManager.setMusicEnabled(val);
    });

    this.createToggle(GAME_WIDTH / 2, startY + 160, 'Haptics', settings.hapticsEnabled, (val) => {
      StorageService.updateSettings({ hapticsEnabled: val });
      AudioManager._settings = null; // bust cache
      if (val && navigator.vibrate) navigator.vibrate(20);
    });

    // Back button
    const backBtn = this.add.container(GAME_WIDTH / 2, GAME_HEIGHT / 2 + 160);
    const btnBg = this.add.graphics();
    btnBg.fillStyle(0x444444, 0.9);
    btnBg.fillRoundedRect(-80, -25, 160, 50, 12);
    btnBg.lineStyle(2, 0xFFFFFF, 0.4);
    btnBg.strokeRoundedRect(-80, -25, 160, 50, 12);
    const btnText = this.add.text(0, 0, 'BACK', {
      fontFamily: 'Arial Black, Arial',
      fontSize: '24px',
      color: '#FFFFFF'
    }).setOrigin(0.5);
    backBtn.add([btnBg, btnText]);
    backBtn.setSize(160, 50);
    backBtn.setInteractive({ useHandCursor: true });
    backBtn.on('pointerover', () => btnText.setColor('#FFEB3B'));
    backBtn.on('pointerout', () => btnText.setColor('#FFFFFF'));
    backBtn.on('pointerdown', () => {
      AudioManager.playSound('menu_click');
      this.closeSettings();
    });

    this.input.keyboard.once('keydown-ESC', () => this.closeSettings());
  }

  createToggle(x, y, label, initialValue, onChange) {
    const labelText = this.add.text(x - 100, y, label, {
      fontFamily: 'Arial',
      fontSize: '26px',
      color: '#FFFFFF'
    }).setOrigin(0, 0.5);

    let isOn = initialValue;

    // Toggle track
    const track = this.add.graphics();
    const knob = this.add.graphics();

    const drawToggle = () => {
      track.clear();
      track.fillStyle(isOn ? 0x4CAF50 : 0x666666, 1);
      track.fillRoundedRect(x + 70, y - 16, 60, 32, 16);

      knob.clear();
      knob.fillStyle(0xFFFFFF, 1);
      const knobX = isOn ? x + 70 + 38 : x + 70 + 22;
      knob.fillCircle(knobX, y, 12);
    };

    drawToggle();

    // Hit area
    const hitArea = this.add.rectangle(x + 100, y, 60, 32).setInteractive({ useHandCursor: true });
    hitArea.setAlpha(0.001);

    hitArea.on('pointerdown', () => {
      isOn = !isOn;
      drawToggle();
      onChange(isOn);
    });
  }

  closeSettings() {
    if (this.returnTo === 'PauseScene') {
      // We came from pause — just close settings overlay
      this.scene.stop();
    } else if (this.returnTo === 'MenuScene') {
      this.scene.stop();
    } else {
      this.scene.stop();
    }
  }
}
