import Phaser from 'phaser';
import { GAME_WIDTH, GAME_HEIGHT } from '../config/gameConfig.js';
import { LEVELS, TOTAL_LEVELS } from '../config/levels.js';
import { StorageService } from '../services/StorageService.js';
import { AudioManager } from '../services/AudioManager.js';

export class StatsScene extends Phaser.Scene {
  constructor() {
    super({ key: 'StatsScene' });
  }

  create() {
    // Background
    const bg = this.add.graphics();
    bg.fillGradientStyle(0x0D1B2A, 0x1B2838, 0x1B3A4B, 0x0D1B2A, 1);
    bg.fillRect(0, 0, GAME_WIDTH, GAME_HEIGHT);

    // Title
    this.add.text(GAME_WIDTH / 2, 45, 'STATISTICS', {
      fontFamily: 'Arial Black, Arial',
      fontSize: '42px',
      color: '#81D4FA',
      stroke: '#000000',
      strokeThickness: 6
    }).setOrigin(0.5);

    const stats = StorageService.getStats();
    const allStars = StorageService.getAllStars();

    // ── Lifetime Stats Grid ──
    const gridY = 100;
    const colW = 280;
    const rowH = 60;

    const lifetimeStats = [
      { label: 'High Score', value: stats.highScore.toLocaleString(), icon: '\u{1F3C6}' },
      { label: 'Total Coins', value: stats.totalCoins.toLocaleString(), icon: '\u{1F4B0}' },
      { label: 'Total Deaths', value: stats.totalDeaths.toLocaleString(), icon: '\u{1F480}' },
      { label: 'Enemies Stomped', value: stats.totalEnemiesStomped.toLocaleString(), icon: '\u{1F45F}' },
      { label: 'Power-Ups Used', value: stats.totalPowerUps.toLocaleString(), icon: '\u26A1' },
      { label: 'Play Time', value: this.formatTime(stats.totalPlayTime), icon: '\u23F0' }
    ];

    // Section header
    this.add.text(GAME_WIDTH / 2, gridY, 'LIFETIME', {
      fontFamily: 'Arial Black, Arial', fontSize: '18px',
      color: '#FFEB3B', stroke: '#000000', strokeThickness: 3
    }).setOrigin(0.5);

    const statsStartY = gridY + 30;
    const cols = 3;
    const startX = (GAME_WIDTH - cols * colW) / 2;

    lifetimeStats.forEach((stat, i) => {
      const col = i % cols;
      const row = Math.floor(i / cols);
      const x = startX + col * colW + colW / 2;
      const y = statsStartY + row * rowH;

      this.createStatCard(x, y, stat);
    });

    // ── Per-Level Stats ──
    const levelY = statsStartY + Math.ceil(lifetimeStats.length / cols) * rowH + 20;

    this.add.text(GAME_WIDTH / 2, levelY, 'LEVELS', {
      fontFamily: 'Arial Black, Arial', fontSize: '18px',
      color: '#FFEB3B', stroke: '#000000', strokeThickness: 3
    }).setOrigin(0.5);

    const levelStartY = levelY + 30;
    const levelCardW = 220;
    const levelGap = 15;
    const totalW = TOTAL_LEVELS * levelCardW + (TOTAL_LEVELS - 1) * levelGap;
    const levelStartX = (GAME_WIDTH - totalW) / 2;

    for (let i = 0; i < TOTAL_LEVELS; i++) {
      const x = levelStartX + i * (levelCardW + levelGap);
      const level = LEVELS[i];
      const stars = allStars[i + 1] || 0;
      const bestTime = stats.levelBestTimes[i + 1];
      const isUnlocked = i + 1 <= stats.unlockedLevels;

      this.createLevelCard(x, levelStartY, levelCardW, level, i + 1, stars, bestTime, isUnlocked);
    }

    // ── Completion ──
    const totalStars = Object.values(allStars).reduce((sum, s) => sum + s, 0);
    const maxStars = TOTAL_LEVELS * 3;
    const completionPct = Math.round((totalStars / maxStars) * 100);
    const compY = levelStartY + 170;

    this.add.text(GAME_WIDTH / 2, compY, 'COMPLETION', {
      fontFamily: 'Arial Black, Arial', fontSize: '18px',
      color: '#FFEB3B', stroke: '#000000', strokeThickness: 3
    }).setOrigin(0.5);

    // Completion bar
    const compBarW = 400;
    const compBarX = GAME_WIDTH / 2 - compBarW / 2;
    const compBarY = compY + 25;
    const compG = this.add.graphics();
    compG.fillStyle(0x333333, 0.6);
    compG.fillRoundedRect(compBarX, compBarY, compBarW, 16, 8);
    compG.fillStyle(0x4CAF50, 0.9);
    compG.fillRoundedRect(compBarX, compBarY, compBarW * (completionPct / 100), 16, 8);

    this.add.text(GAME_WIDTH / 2, compBarY + 32, `${completionPct}% — ${totalStars}/${maxStars} Stars`, {
      fontFamily: 'Arial', fontSize: '16px',
      color: '#FFFFFF', stroke: '#000000', strokeThickness: 2
    }).setOrigin(0.5);

    // Back button
    const backBtn = this.add.text(70, 45, '\u25C0 BACK', {
      fontFamily: 'Arial Black, Arial', fontSize: '20px',
      color: '#FFFFFF', stroke: '#000000', strokeThickness: 3
    }).setOrigin(0.5).setInteractive({ useHandCursor: true });

    backBtn.on('pointerover', () => backBtn.setColor('#FFEB3B'));
    backBtn.on('pointerout', () => backBtn.setColor('#FFFFFF'));
    backBtn.on('pointerdown', () => {
      AudioManager.playSound('menu_click');
      this.scene.start('MenuScene');
    });

    this.cameras.main.fadeIn(400);
  }

  createStatCard(x, y, stat) {
    const g = this.add.graphics();
    g.fillStyle(0x1A2744, 0.6);
    g.fillRoundedRect(x - 120, y - 20, 240, 45, 8);

    this.add.text(x - 100, y, stat.icon, {
      fontSize: '22px'
    }).setOrigin(0.5);

    this.add.text(x - 80, y - 7, stat.label, {
      fontFamily: 'Arial', fontSize: '12px',
      color: '#90CAF9'
    }).setOrigin(0, 0.5);

    this.add.text(x - 80, y + 10, stat.value, {
      fontFamily: 'Arial Black, Arial', fontSize: '18px',
      color: '#FFFFFF'
    }).setOrigin(0, 0.5);
  }

  createLevelCard(x, y, w, level, num, stars, bestTime, isUnlocked) {
    const h = 140;
    const g = this.add.graphics();

    if (isUnlocked) {
      g.fillStyle(0x1A2744, 0.6);
      g.fillRoundedRect(x, y, w, h, 8);
      g.lineStyle(1, 0x42A5F5, 0.4);
      g.strokeRoundedRect(x, y, w, h, 8);
    } else {
      g.fillStyle(0x121212, 0.4);
      g.fillRoundedRect(x, y, w, h, 8);
    }

    const cx = x + w / 2;

    // Level icon
    const iconText = isUnlocked ? level.icon : '\u{1F512}';
    this.add.text(cx, y + 25, iconText, {
      fontSize: '28px'
    }).setOrigin(0.5);

    // Level name
    const nameColor = isUnlocked ? '#FFFFFF' : '#616161';
    this.add.text(cx, y + 55, `${num}. ${level.name}`, {
      fontFamily: 'Arial Black, Arial', fontSize: '12px',
      color: nameColor
    }).setOrigin(0.5);

    if (isUnlocked) {
      // Stars
      let starStr = '';
      for (let i = 0; i < 3; i++) {
        starStr += i < stars ? '\u2605' : '\u2606';
      }
      this.add.text(cx, y + 80, starStr, {
        fontFamily: 'Arial', fontSize: '22px',
        color: '#FFD700'
      }).setOrigin(0.5);

      // Best time
      const timeStr = bestTime ? this.formatTime(bestTime) : '--:--';
      this.add.text(cx, y + 108, `Best: ${timeStr}`, {
        fontFamily: 'Arial', fontSize: '13px',
        color: '#90CAF9'
      }).setOrigin(0.5);
    }
  }

  formatTime(seconds) {
    if (!seconds && seconds !== 0) return '--:--';
    const m = Math.floor(seconds / 60);
    const s = Math.floor(seconds % 60);
    return `${m}:${s.toString().padStart(2, '0')}`;
  }
}
