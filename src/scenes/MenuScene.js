import Phaser from 'phaser';
import { GAME_WIDTH, GAME_HEIGHT, COLORS, LEVELS } from '../config/gameConfig.js';
import { StorageService } from '../services/StorageService.js';
import { AudioManager } from '../services/AudioManager.js';

export class MenuScene extends Phaser.Scene {
  constructor() {
    super({ key: 'MenuScene' });
    this.audioManager = null;
  }

  create() {
    if (!this.audioManager) {
      this.audioManager = new AudioManager();
      this.audioManager.init();
    }

    // Background
    const bg = this.add.graphics();
    bg.fillGradientStyle(0x87CEEB, 0x87CEEB, 0x4FC3F7, 0x4FC3F7, 1);
    bg.fillRect(0, 0, GAME_WIDTH, GAME_HEIGHT);

    // Title shadow + text
    this.add.text(GAME_WIDTH / 2 + 4, 124, 'BANANO QUEST', {
      fontFamily: 'Arial Black, Arial', fontSize: '72px', color: '#000000'
    }).setOrigin(0.5).setAlpha(0.3);

    const title = this.add.text(GAME_WIDTH / 2, 120, 'BANANO QUEST', {
      fontFamily: 'Arial Black, Arial', fontSize: '72px',
      color: '#FFEB3B', stroke: '#FF9800', strokeThickness: 8
    }).setOrigin(0.5);

    this.tweens.add({
      targets: title, y: 130,
      duration: 1500, ease: 'Sine.easeInOut', yoyo: true, repeat: -1
    });

    // Subtitle
    this.add.text(GAME_WIDTH / 2, 200, 'Collect all the Banano coins!', {
      fontFamily: 'Arial', fontSize: '28px',
      color: '#FFFFFF', stroke: '#000000', strokeThickness: 4
    }).setOrigin(0.5);

    // Stats
    const stats = StorageService.getStats();
    this.add.text(GAME_WIDTH / 2, 240,
      `Total Coins: ${stats.totalCoins} | High Score: ${stats.highScore} | Levels: ${stats.unlockedLevels}/${LEVELS.length}`, {
      fontFamily: 'Arial', fontSize: '18px',
      color: '#B0BEC5', stroke: '#000000', strokeThickness: 2
    }).setOrigin(0.5);

    // Decorative coins
    [{ x: 200, y: 380 }, { x: 350, y: 340 }, { x: 500, y: 400 },
     { x: 780, y: 400 }, { x: 930, y: 340 }, { x: 1080, y: 380 }
    ].forEach((pos, i) => {
      const coin = this.add.image(pos.x, pos.y, 'coin');
      this.tweens.add({
        targets: coin, y: pos.y - 20, angle: 360,
        duration: 2000 + i * 200, ease: 'Sine.easeInOut', yoyo: true, repeat: -1
      });
    });

    // Monkey preview
    const monkey = this.add.image(GAME_WIDTH / 2, 360, 'monkey').setScale(2);
    this.tweens.add({
      targets: monkey, y: 370,
      duration: 800, ease: 'Sine.easeInOut', yoyo: true, repeat: -1
    });

    // Play button
    const playButton = this.add.container(GAME_WIDTH / 2, 480);
    const buttonBg = this.add.graphics();
    buttonBg.fillStyle(COLORS.BANANO_YELLOW);
    buttonBg.fillRoundedRect(-120, -40, 240, 80, 16);
    buttonBg.lineStyle(4, 0xFF9800);
    buttonBg.strokeRoundedRect(-120, -40, 240, 80, 16);
    const buttonText = this.add.text(0, 0, 'PLAY', {
      fontFamily: 'Arial Black, Arial', fontSize: '48px', color: '#795548'
    }).setOrigin(0.5);
    playButton.add([buttonBg, buttonText]);
    playButton.setSize(240, 80);
    playButton.setInteractive({ useHandCursor: true });

    playButton.on('pointerover', () => {
      this.tweens.add({ targets: playButton, scaleX: 1.1, scaleY: 1.1, duration: 100 });
    });
    playButton.on('pointerout', () => {
      this.tweens.add({ targets: playButton, scaleX: 1, scaleY: 1, duration: 100 });
    });
    playButton.on('pointerdown', () => {
      this.audioManager.resume();
      if (this.audioManager) this.audioManager.playButtonClick();
      this.cameras.main.fadeOut(500, 0, 0, 0);
      this.time.delayedCall(500, () => {
        this.scene.start('GameScene', { level: 0, lives: 3 });
      });
    });

    // Instructions (mobile-aware)
    const isMobile = !this.sys.game.device.os.desktop;
    this.add.text(GAME_WIDTH / 2, 580, isMobile
      ? 'Use on-screen buttons to move and jump'
      : 'Arrow Keys or WASD to move | SPACE to jump', {
      fontFamily: 'Arial', fontSize: '20px',
      color: '#FFFFFF', stroke: '#000000', strokeThickness: 3
    }).setOrigin(0.5);

    // Version
    this.add.text(GAME_WIDTH / 2, 650, `${LEVELS.length} Levels | 2 Worlds`, {
      fontFamily: 'Arial', fontSize: '16px',
      color: '#90CAF9', stroke: '#000000', strokeThickness: 2
    }).setOrigin(0.5);

    this.cameras.main.fadeIn(500);
  }
}
