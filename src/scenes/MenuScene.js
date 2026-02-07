import Phaser from 'phaser';
import { GAME_WIDTH, GAME_HEIGHT, COLORS } from '../config/gameConfig.js';
import { AudioManager } from '../services/AudioManager.js';

export class MenuScene extends Phaser.Scene {
  constructor() {
    super({ key: 'MenuScene' });
  }

  create() {
    // Background gradient effect
    const bg = this.add.graphics();
    bg.fillGradientStyle(0x87CEEB, 0x87CEEB, 0x4FC3F7, 0x4FC3F7, 1);
    bg.fillRect(0, 0, GAME_WIDTH, GAME_HEIGHT);

    // Title text with shadow
    this.add.text(GAME_WIDTH / 2 + 4, 154, 'BANANO QUEST', {
      fontFamily: 'Arial Black, Arial',
      fontSize: '72px',
      color: '#000000'
    }).setOrigin(0.5).setAlpha(0.3);

    const title = this.add.text(GAME_WIDTH / 2, 150, 'BANANO QUEST', {
      fontFamily: 'Arial Black, Arial',
      fontSize: '72px',
      color: '#FFEB3B',
      stroke: '#FF9800',
      strokeThickness: 8
    }).setOrigin(0.5);

    // Animate title
    this.tweens.add({
      targets: title,
      y: 160,
      duration: 1500,
      ease: 'Sine.easeInOut',
      yoyo: true,
      repeat: -1
    });

    // Subtitle
    this.add.text(GAME_WIDTH / 2, 230, 'Collect all the Banano coins!', {
      fontFamily: 'Arial',
      fontSize: '28px',
      color: '#FFFFFF',
      stroke: '#000000',
      strokeThickness: 4
    }).setOrigin(0.5);

    // Decorative coins
    const coinPositions = [
      { x: 200, y: 400 },
      { x: 350, y: 350 },
      { x: 500, y: 420 },
      { x: 780, y: 420 },
      { x: 930, y: 350 },
      { x: 1080, y: 400 }
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
        repeat: -1
      });
    });

    // Play button
    const playButton = this.add.container(GAME_WIDTH / 2, 500);

    const buttonBg = this.add.graphics();
    buttonBg.fillStyle(COLORS.BANANO_YELLOW);
    buttonBg.fillRoundedRect(-120, -40, 240, 80, 16);
    buttonBg.lineStyle(4, 0xFF9800);
    buttonBg.strokeRoundedRect(-120, -40, 240, 80, 16);

    const buttonText = this.add.text(0, 0, 'PLAY', {
      fontFamily: 'Arial Black, Arial',
      fontSize: '48px',
      color: '#795548'
    }).setOrigin(0.5);

    playButton.add([buttonBg, buttonText]);
    playButton.setSize(240, 80);
    playButton.setInteractive({ useHandCursor: true });

    // Button hover effects
    playButton.on('pointerover', () => {
      this.tweens.add({
        targets: playButton,
        scaleX: 1.1,
        scaleY: 1.1,
        duration: 100
      });
    });

    playButton.on('pointerout', () => {
      this.tweens.add({
        targets: playButton,
        scaleX: 1,
        scaleY: 1,
        duration: 100
      });
    });

    playButton.on('pointerdown', () => {
      AudioManager.unlock();
      AudioManager.playSound('menu_click');
      AudioManager.stopMusic();
      this.cameras.main.fadeOut(500, 0, 0, 0);
      this.time.delayedCall(500, () => {
        this.scene.start('LevelSelectScene');
      });
    });

    // Instructions — adapt for touch vs keyboard
    const isTouchDevice = this.sys.game.device.input.touch;
    const instructions = isTouchDevice
      ? 'Use on-screen buttons to move and jump'
      : 'Arrow Keys or WASD to move | SPACE to jump';

    this.add.text(GAME_WIDTH / 2, 620, instructions, {
      fontFamily: 'Arial',
      fontSize: '20px',
      color: '#FFFFFF',
      stroke: '#000000',
      strokeThickness: 3
    }).setOrigin(0.5);

    // Monkey preview
    const monkey = this.add.image(GAME_WIDTH / 2, 380, 'monkey');
    monkey.setScale(2);
    this.tweens.add({
      targets: monkey,
      y: 390,
      duration: 800,
      ease: 'Sine.easeInOut',
      yoyo: true,
      repeat: -1
    });

    // Settings button (gear icon)
    const settingsBtn = this.add.text(GAME_WIDTH - 50, 40, '\u2699', {
      fontFamily: 'Arial',
      fontSize: '36px',
      color: '#FFFFFF',
      stroke: '#000000',
      strokeThickness: 3
    }).setOrigin(0.5).setInteractive({ useHandCursor: true });

    settingsBtn.on('pointerover', () => settingsBtn.setColor('#FFEB3B'));
    settingsBtn.on('pointerout', () => settingsBtn.setColor('#FFFFFF'));
    settingsBtn.on('pointerdown', () => {
      AudioManager.unlock();
      AudioManager.playSound('menu_click');
      this.scene.launch('SettingsScene', { returnTo: 'MenuScene' });
    });

    // S6: Bottom menu row — Achievements, Stats, Skins
    const menuY = 570;
    const menuSpacing = 180;
    const menuItems = [
      { label: '\u{1F3C6} Achievements', scene: 'AchievementsScene' },
      { label: '\u{1F4CA} Stats', scene: 'StatsScene' },
      { label: '\u{1F3A8} Skins', scene: 'SkinsScene' }
    ];

    menuItems.forEach((item, i) => {
      const x = GAME_WIDTH / 2 + (i - 1) * menuSpacing;
      const btn = this.add.text(x, menuY, item.label, {
        fontFamily: 'Arial Black, Arial',
        fontSize: '18px',
        color: '#FFFFFF',
        stroke: '#000000',
        strokeThickness: 3
      }).setOrigin(0.5).setInteractive({ useHandCursor: true });

      btn.on('pointerover', () => btn.setColor('#FFEB3B'));
      btn.on('pointerout', () => btn.setColor('#FFFFFF'));
      btn.on('pointerdown', () => {
        AudioManager.unlock();
        AudioManager.playSound('menu_click');
        this.scene.start(item.scene);
      });
    });

    // Start menu music (unlock on first interaction)
    this.input.once('pointerdown', () => {
      AudioManager.unlock();
      AudioManager.playMusic('menu');
    });
    this.input.keyboard.once('keydown', () => {
      AudioManager.unlock();
      AudioManager.playMusic('menu');
    });

    // If already unlocked, start music immediately
    if (AudioManager.unlocked) {
      AudioManager.playMusic('menu');
    }

    // Fade in
    this.cameras.main.fadeIn(500);
  }
}
