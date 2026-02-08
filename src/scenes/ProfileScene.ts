import Phaser from 'phaser';
import { GAME_WIDTH, GAME_HEIGHT, COLORS } from '../config/gameConfig.ts';
import { StorageService } from '../services/StorageService.ts';
import { AudioManager } from '../services/AudioManager.ts';
import { WalletBridge } from '../services/WalletBridge.ts';
import { AchievementService, ACHIEVEMENTS } from '../services/AchievementService.ts';
import { StreakService } from '../services/StreakService.ts';
import { SkinService } from '../services/SkinService.ts';
import { LeaderboardService } from '../services/LeaderboardService.ts';

export class ProfileScene extends Phaser.Scene {
  constructor() {
    super({ key: 'ProfileScene' });
  }

  create() {
    const bg = this.add.graphics();
    bg.fillGradientStyle(0x1a237e, 0x1a237e, 0x311b92, 0x311b92, 1);
    bg.fillRect(0, 0, GAME_WIDTH, GAME_HEIGHT);

    // Title
    this.add
      .text(GAME_WIDTH / 2, 40, 'PROFILE', {
        fontFamily: 'Arial Black, Arial',
        fontSize: '42px',
        color: '#FFEB3B',
        stroke: '#FF9800',
        strokeThickness: 6,
      })
      .setOrigin(0.5);

    this.createWalletSection();
    this.createStatsSection();
    this.createAchievementsSection();
    this.createSkinsSection();
    this.createLeaderboardSection();
    this.createBackButton();

    this.cameras.main.fadeIn(300);
  }

  private createWalletSection() {
    const x = 210;
    const y = 110;

    const panel = this.add.graphics();
    panel.fillStyle(0x000000, 0.3);
    panel.fillRoundedRect(x - 190, y - 20, 380, 145, 10);

    this.add
      .text(x, y, 'WALLET', {
        fontFamily: 'Arial Black, Arial',
        fontSize: '20px',
        color: '#FFD700',
      })
      .setOrigin(0.5);

    if (WalletBridge.isConnected()) {
      this.add
        .text(x, y + 30, WalletBridge.getShortAddress() ?? '', {
          fontFamily: 'monospace',
          fontSize: '14px',
          color: '#AAFFAA',
        })
        .setOrigin(0.5);

      this.add
        .text(x, y + 55, `Balance: ${WalletBridge.getBalance()} BAN`, {
          fontFamily: 'Arial',
          fontSize: '18px',
          color: '#FFFFFF',
        })
        .setOrigin(0.5);

      this.add
        .text(x, y + 78, `Total earned: ${WalletBridge.getTotalEarned()} BAN`, {
          fontFamily: 'Arial',
          fontSize: '14px',
          color: '#AAAAAA',
        })
        .setOrigin(0.5);

      // Disconnect button
      const dcBtn = this.add.container(x, y + 105);
      const dcBg = this.add.graphics();
      dcBg.fillStyle(0xff1744, 0.8);
      dcBg.fillRoundedRect(-55, -12, 110, 24, 6);
      const dcText = this.add
        .text(0, 0, 'Disconnect', {
          fontFamily: 'Arial',
          fontSize: '13px',
          color: '#FFFFFF',
        })
        .setOrigin(0.5);
      dcBtn.add([dcBg, dcText]);
      dcBtn.setSize(110, 24);
      dcBtn.setInteractive({ useHandCursor: true });
      dcBtn.on('pointerdown', () => {
        WalletBridge.disconnect();
        this.scene.restart();
      });
    } else {
      this.add
        .text(x, y + 40, 'No wallet connected', {
          fontFamily: 'Arial',
          fontSize: '16px',
          color: '#AAAAAA',
        })
        .setOrigin(0.5);

      const connectBtn = this.add.container(x, y + 80);
      const cBg = this.add.graphics();
      cBg.fillStyle(COLORS.BANANO_YELLOW, 0.9);
      cBg.fillRoundedRect(-70, -16, 140, 32, 8);
      const cText = this.add
        .text(0, 0, 'Connect Wallet', {
          fontFamily: 'Arial Black, Arial',
          fontSize: '14px',
          color: '#795548',
        })
        .setOrigin(0.5);
      connectBtn.add([cBg, cText]);
      connectBtn.setSize(140, 32);
      connectBtn.setInteractive({ useHandCursor: true });
      connectBtn.on('pointerdown', () => {
        AudioManager.playSfx('menuSelect');
        WalletBridge.connect();
        this.scene.restart();
      });
    }
  }

  private createStatsSection() {
    const x = 640;
    const y = 110;

    const panel = this.add.graphics();
    panel.fillStyle(0x000000, 0.3);
    panel.fillRoundedRect(x - 190, y - 20, 380, 145, 10);

    this.add
      .text(x, y, 'STATS', {
        fontFamily: 'Arial Black, Arial',
        fontSize: '20px',
        color: '#FFD700',
      })
      .setOrigin(0.5);

    const stats = StorageService.getStats();
    const streak = StreakService.getData();
    const totalStars = StorageService.getTotalStars();

    const lines = [
      `High Score: ${stats.highScore}`,
      `Total Coins: ${stats.totalCoins}`,
      `Stars: ${totalStars}/18`,
      `Current Streak: ${streak.currentStreak} day${streak.currentStreak !== 1 ? 's' : ''}`,
      `Longest Streak: ${streak.longestStreak} day${streak.longestStreak !== 1 ? 's' : ''}`,
    ];

    lines.forEach((line, i) => {
      this.add.text(x - 140, y + 28 + i * 22, line, {
        fontFamily: 'Arial',
        fontSize: '16px',
        color: '#FFFFFF',
      });
    });
  }

  private createAchievementsSection() {
    const x = 1070;
    const y = 110;

    const panel = this.add.graphics();
    panel.fillStyle(0x000000, 0.3);
    panel.fillRoundedRect(x - 190, y - 20, 380, 145, 10);

    const unlocked = AchievementService.getUnlockedCount();
    this.add
      .text(x, y, `ACHIEVEMENTS (${unlocked}/${ACHIEVEMENTS.length})`, {
        fontFamily: 'Arial Black, Arial',
        fontSize: '20px',
        color: '#FFD700',
      })
      .setOrigin(0.5);

    const all = AchievementService.getAll();
    const rows = 3;
    const cols = 5;
    const startX = x - 160;
    const startY = y + 30;

    all.slice(0, rows * cols).forEach((entry, i) => {
      const col = i % cols;
      const row = Math.floor(i / cols);
      const ax = startX + col * 75;
      const ay = startY + row * 36;

      const icon = this.add.graphics();
      if (entry.progress.unlocked) {
        icon.fillStyle(0xffd700, 0.9);
      } else {
        icon.fillStyle(0x555555, 0.5);
      }
      icon.fillCircle(ax + 12, ay + 10, 12);

      this.add.text(ax + 28, ay + 3, entry.def.name, {
        fontFamily: 'Arial',
        fontSize: '11px',
        color: entry.progress.unlocked ? '#FFFFFF' : '#888888',
      });
    });
  }

  private createSkinsSection() {
    const x = 210;
    const y = 310;

    const panel = this.add.graphics();
    panel.fillStyle(0x000000, 0.3);
    panel.fillRoundedRect(x - 190, y - 20, 380, 130, 10);

    this.add
      .text(x, y, 'SKINS', {
        fontFamily: 'Arial Black, Arial',
        fontSize: '20px',
        color: '#FFD700',
      })
      .setOrigin(0.5);

    const totalStars = StorageService.getTotalStars();
    const allSkins = SkinService.getAll(totalStars);
    const selected = SkinService.getSelected();

    allSkins.forEach((skin, i) => {
      const sx = x - 150 + i * 48;
      const sy = y + 45;

      const g = this.add.graphics();
      if (skin.unlocked) {
        g.fillStyle(skin.tint, 0.9);
      } else {
        g.fillStyle(0x333333, 0.5);
      }
      g.fillRoundedRect(sx - 16, sy - 16, 32, 32, 6);

      if (skin.id === selected.id) {
        g.lineStyle(2, 0xffd700, 1);
        g.strokeRoundedRect(sx - 16, sy - 16, 32, 32, 6);
      }

      this.add
        .text(sx, sy + 26, skin.name, {
          fontFamily: 'Arial',
          fontSize: '10px',
          color: skin.unlocked ? '#FFFFFF' : '#666666',
        })
        .setOrigin(0.5);

      if (skin.unlocked && skin.id !== selected.id) {
        const hitZone = this.add.zone(sx, sy, 32, 32).setInteractive({ useHandCursor: true });
        hitZone.on('pointerdown', () => {
          AudioManager.playSfx('menuSelect');
          SkinService.select(skin.id, totalStars);
          this.scene.restart();
        });
      }
    });
  }

  private createLeaderboardSection() {
    const x = 850;
    const y = 310;

    const panel = this.add.graphics();
    panel.fillStyle(0x000000, 0.3);
    panel.fillRoundedRect(x - 390, y - 20, 780, 130, 10);

    this.add
      .text(x, y, 'LEADERBOARD - TOP SCORES', {
        fontFamily: 'Arial Black, Arial',
        fontSize: '20px',
        color: '#FFD700',
      })
      .setOrigin(0.5);

    const entries = LeaderboardService.getGlobal();

    if (entries.length === 0) {
      this.add
        .text(x, y + 50, 'No scores yet — go play some levels!', {
          fontFamily: 'Arial',
          fontSize: '16px',
          color: '#AAAAAA',
        })
        .setOrigin(0.5);
    } else {
      const shown = entries.slice(0, 5);
      shown.forEach((entry, i) => {
        const ex = x - 350 + (i % 5) * 150;
        const ey = y + 35;
        const rank = i + 1;
        const starStr = '\u2605'.repeat(entry.stars);
        const rankColor = rank === 1 ? '#FFD700' : rank === 2 ? '#C0C0C0' : '#CD7F32';

        this.add.text(ex, ey, `#${rank}`, {
          fontFamily: 'Arial Black, Arial',
          fontSize: '16px',
          color: rank <= 3 ? rankColor : '#FFFFFF',
        });

        this.add.text(ex, ey + 22, `${entry.score}`, {
          fontFamily: 'Arial',
          fontSize: '14px',
          color: '#FFFFFF',
        });

        this.add.text(ex, ey + 40, starStr || '-', {
          fontFamily: 'Arial',
          fontSize: '12px',
          color: '#FFD700',
        });
      });
    }
  }

  private createBackButton() {
    const backBtn = this.add.container(GAME_WIDTH / 2, GAME_HEIGHT - 40);
    const backBg = this.add.graphics();
    backBg.fillStyle(COLORS.MONKEY_BROWN, 0.8);
    backBg.fillRoundedRect(-80, -20, 160, 40, 8);
    const backText = this.add
      .text(0, 0, 'BACK TO MENU', {
        fontFamily: 'Arial Black, Arial',
        fontSize: '20px',
        color: '#FFFFFF',
      })
      .setOrigin(0.5);
    backBtn.add([backBg, backText]);
    backBtn.setSize(160, 40);
    backBtn.setInteractive({ useHandCursor: true });

    backBtn.on('pointerdown', () => {
      AudioManager.playSfx('menuSelect');
      this.scene.start('MenuScene');
    });
  }
}
