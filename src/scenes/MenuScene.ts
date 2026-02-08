import Phaser from 'phaser';
import { GAME_WIDTH, GAME_HEIGHT, COLORS } from '../config/gameConfig.ts';
import { AudioManager } from '../services/AudioManager.ts';
import { AchievementService, ACHIEVEMENTS } from '../services/AchievementService.ts';
import { StreakService } from '../services/StreakService.ts';
import { WalletBridge } from '../services/WalletBridge.ts';

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
      AudioManager.playSfx('menuSelect');
      AudioManager.stopBgm();
      this.cameras.main.fadeOut(500, 0, 0, 0);
      this.time.delayedCall(500, () => {
        this.scene.start('LevelSelectScene');
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

    // Stats display
    const streak = StreakService.getCurrentStreak();
    const achCount = AchievementService.getUnlockedCount();
    const statsText: string[] = [];
    if (streak > 0) statsText.push(`\u{1F525} ${streak} day streak`);
    if (achCount > 0) statsText.push(`\u{1F3C6} ${achCount}/${ACHIEVEMENTS.length}`);
    if (WalletBridge.isConnected()) {
      statsText.push(`\u{1F4B0} ${WalletBridge.getBalance()} BAN`);
    }
    if (statsText.length > 0) {
      this.add
        .text(GAME_WIDTH / 2, 655, statsText.join('   '), {
          fontFamily: 'Arial',
          fontSize: '18px',
          color: '#FFD700',
          stroke: '#000000',
          strokeThickness: 3,
        })
        .setOrigin(0.5);
    }

    // Profile button (top-right)
    const profileBtn = this.add.container(GAME_WIDTH - 80, 40);
    const pBg = this.add.graphics();
    pBg.fillStyle(0x311b92, 0.8);
    pBg.fillRoundedRect(-55, -18, 110, 36, 8);
    const pText = this.add
      .text(0, 0, 'PROFILE', {
        fontFamily: 'Arial Black, Arial',
        fontSize: '16px',
        color: '#FFFFFF',
      })
      .setOrigin(0.5);
    profileBtn.add([pBg, pText]);
    profileBtn.setSize(110, 36);
    profileBtn.setInteractive({ useHandCursor: true });
    profileBtn.on('pointerdown', () => {
      AudioManager.playSfx('menuSelect');
      this.scene.start('ProfileScene');
    });

    // Wallet connect button (top-left) if not connected
    if (!WalletBridge.isConnected()) {
      const walletBtn = this.add.container(100, 40);
      const wBg = this.add.graphics();
      wBg.fillStyle(COLORS.BANANO_YELLOW, 0.9);
      wBg.fillRoundedRect(-75, -18, 150, 36, 8);
      const wText = this.add
        .text(0, 0, 'Connect Wallet', {
          fontFamily: 'Arial Black, Arial',
          fontSize: '14px',
          color: '#795548',
        })
        .setOrigin(0.5);
      walletBtn.add([wBg, wText]);
      walletBtn.setSize(150, 36);
      walletBtn.setInteractive({ useHandCursor: true });
      walletBtn.on('pointerdown', () => {
        AudioManager.playSfx('menuSelect');
        WalletBridge.connect();
        this.scene.restart();
      });
    } else {
      this.add
        .text(100, 40, WalletBridge.getShortAddress() ?? '', {
          fontFamily: 'monospace',
          fontSize: '12px',
          color: '#AAFFAA',
          stroke: '#000000',
          strokeThickness: 2,
        })
        .setOrigin(0.5);
    }

    this.cameras.main.fadeIn(500);

    // Start menu BGM on first user interaction (AudioContext policy)
    const startAudio = () => {
      AudioManager.init();
      AudioManager.startBgm('menu');
      this.input.off('pointerdown', startAudio);
      this.input.keyboard!.off('keydown', startAudio);
    };
    this.input.on('pointerdown', startAudio);
    this.input.keyboard!.on('keydown', startAudio);
  }
}
