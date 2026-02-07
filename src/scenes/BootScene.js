import Phaser from 'phaser';
import { GAME_WIDTH, GAME_HEIGHT, COLORS, PLAYER, COIN } from '../config/gameConfig.js';

export class BootScene extends Phaser.Scene {
  constructor() {
    super({ key: 'BootScene' });
  }

  preload() {
    // S4.4: Branded splash background (shown immediately)
    const bg = this.add.graphics();
    bg.fillGradientStyle(0x87CEEB, 0x87CEEB, 0x4FC3F7, 0x4FC3F7, 1);
    bg.fillRect(0, 0, GAME_WIDTH, GAME_HEIGHT);

    const splashTitle = this.add.text(GAME_WIDTH / 2, GAME_HEIGHT / 2 - 60, 'BANANO QUEST', {
      fontFamily: 'Arial Black, Arial',
      fontSize: '64px',
      color: '#FFEB3B',
      stroke: '#FF9800',
      strokeThickness: 8
    }).setOrigin(0.5);

    const splashSub = this.add.text(GAME_WIDTH / 2, GAME_HEIGHT / 2 + 10, 'Loading...', {
      fontFamily: 'Arial',
      fontSize: '22px',
      color: '#FFFFFF',
      stroke: '#000000',
      strokeThickness: 3
    }).setOrigin(0.5);

    // Progress bar (only visible if loading takes > 0.3s)
    const progressBar = this.add.graphics();
    const progressBox = this.add.graphics();
    progressBox.fillStyle(0x000000, 0.3);
    progressBox.fillRoundedRect(GAME_WIDTH / 2 - 150, GAME_HEIGHT / 2 + 50, 300, 20, 10);

    this.load.on('progress', (value) => {
      progressBar.clear();
      progressBar.fillStyle(COLORS.BANANO_YELLOW, 1);
      progressBar.fillRoundedRect(GAME_WIDTH / 2 - 146, GAME_HEIGHT / 2 + 54, 292 * value, 12, 6);
    });

    this.load.on('complete', () => {
      progressBar.destroy();
      progressBox.destroy();
      splashSub.setText('');
    });

    // Store splash elements for transition
    this.splashElements = { bg, splashTitle, splashSub };

    // Load monkey sprites
    this.load.svg('monkey', 'assets/monkey-0.svg', { width: 64, height: 78 });
    this.load.svg('monkey-walk-1', 'assets/monkey-1.svg', { width: 64, height: 78 });
    this.load.svg('monkey-walk-2', 'assets/monkey-2.svg', { width: 64, height: 78 });
    this.load.svg('monkey-jump', 'assets/monkey-3.svg', { width: 64, height: 78 });

    // Generate placeholder graphics for platforms and coins
    this.generatePlaceholderGraphics();
  }

  generatePlaceholderGraphics() {

    // Generate coin sprite
    const coinGraphics = this.make.graphics({ x: 0, y: 0, add: false });

    // Coin outer circle
    coinGraphics.fillStyle(COLORS.BANANO_YELLOW);
    coinGraphics.fillCircle(COIN.RADIUS, COIN.RADIUS, COIN.RADIUS);

    // Coin inner highlight
    coinGraphics.fillStyle(0xFFF176);
    coinGraphics.fillCircle(COIN.RADIUS - 2, COIN.RADIUS - 2, COIN.RADIUS - 6);

    // Coin border
    coinGraphics.lineStyle(2, 0xFFA000);
    coinGraphics.strokeCircle(COIN.RADIUS, COIN.RADIUS, COIN.RADIUS - 1);

    coinGraphics.generateTexture('coin', COIN.RADIUS * 2, COIN.RADIUS * 2);
    coinGraphics.destroy();

    // Generate platform texture
    const platformGraphics = this.make.graphics({ x: 0, y: 0, add: false });

    // Main platform body
    platformGraphics.fillStyle(COLORS.GRASS_GREEN);
    platformGraphics.fillRect(0, 8, 64, 24);

    // Grass top
    platformGraphics.fillStyle(0x66BB6A);
    platformGraphics.fillRect(0, 0, 64, 12);

    // Grass detail
    platformGraphics.fillStyle(0x81C784);
    for (let i = 0; i < 8; i++) {
      platformGraphics.fillRect(i * 8 + 2, 0, 4, 8);
    }

    // Dirt bottom
    platformGraphics.fillStyle(COLORS.PLATFORM_DARK);
    platformGraphics.fillRect(0, 28, 64, 4);

    platformGraphics.generateTexture('platform', 64, 32);
    platformGraphics.destroy();

    // Generate ground texture (wider)
    const groundGraphics = this.make.graphics({ x: 0, y: 0, add: false });
    groundGraphics.fillStyle(COLORS.PLATFORM_DARK);
    groundGraphics.fillRect(0, 0, 64, 64);
    groundGraphics.fillStyle(COLORS.GRASS_GREEN);
    groundGraphics.fillRect(0, 0, 64, 16);
    groundGraphics.fillStyle(0x66BB6A);
    groundGraphics.fillRect(0, 0, 64, 8);

    groundGraphics.generateTexture('ground', 64, 64);
    groundGraphics.destroy();

    // Generate slime enemy sprite
    const slimeGraphics = this.make.graphics({ x: 0, y: 0, add: false });
    // Body
    slimeGraphics.fillStyle(0x4CAF50);
    slimeGraphics.fillEllipse(24, 28, 36, 28);
    // Darker bottom
    slimeGraphics.fillStyle(0x388E3C);
    slimeGraphics.fillEllipse(24, 34, 36, 16);
    // Eyes (white)
    slimeGraphics.fillStyle(0xFFFFFF);
    slimeGraphics.fillCircle(16, 22, 7);
    slimeGraphics.fillCircle(32, 22, 7);
    // Pupils
    slimeGraphics.fillStyle(0x1B5E20);
    slimeGraphics.fillCircle(18, 23, 4);
    slimeGraphics.fillCircle(34, 23, 4);
    // Angry eyebrows
    slimeGraphics.lineStyle(2, 0x1B5E20);
    slimeGraphics.beginPath();
    slimeGraphics.moveTo(10, 16);
    slimeGraphics.lineTo(20, 18);
    slimeGraphics.strokePath();
    slimeGraphics.beginPath();
    slimeGraphics.moveTo(38, 16);
    slimeGraphics.lineTo(28, 18);
    slimeGraphics.strokePath();

    slimeGraphics.generateTexture('slime', 48, 40);
    slimeGraphics.destroy();

    // Generate spike hazard sprite
    const spikeGraphics = this.make.graphics({ x: 0, y: 0, add: false });
    const spikeCount = 4;
    const spikeW = 48;
    const spikeH = 32;
    const sw = spikeW / spikeCount;
    for (let i = 0; i < spikeCount; i++) {
      spikeGraphics.fillStyle(0x9E9E9E);
      spikeGraphics.fillTriangle(
        i * sw, spikeH,
        i * sw + sw / 2, 4,
        i * sw + sw, spikeH
      );
      spikeGraphics.lineStyle(1, 0xBDBDBD);
      spikeGraphics.beginPath();
      spikeGraphics.moveTo(i * sw + sw / 2, 4);
      spikeGraphics.lineTo(i * sw + sw, spikeH);
      spikeGraphics.strokePath();
    }

    spikeGraphics.generateTexture('spike', spikeW, spikeH);
    spikeGraphics.destroy();

    // Generate heart sprite for lives display
    const heartGraphics = this.make.graphics({ x: 0, y: 0, add: false });
    heartGraphics.fillStyle(0xFF1744);
    heartGraphics.fillCircle(10, 10, 8);
    heartGraphics.fillCircle(22, 10, 8);
    heartGraphics.fillTriangle(2, 12, 30, 12, 16, 28);
    heartGraphics.fillStyle(0xFF5252);
    heartGraphics.fillCircle(9, 8, 4);

    heartGraphics.generateTexture('heart', 32, 30);
    heartGraphics.destroy();

    // ── S5: Question block texture ──
    const qBlockG = this.make.graphics({ x: 0, y: 0, add: false });
    qBlockG.fillStyle(0xFFB300);
    qBlockG.fillRect(0, 0, 48, 48);
    qBlockG.fillStyle(0xFFCA28);
    qBlockG.fillRect(4, 4, 40, 40);
    qBlockG.lineStyle(3, 0xFF6F00);
    qBlockG.strokeRect(1, 1, 46, 46);
    // ? mark
    qBlockG.fillStyle(0xFF6F00);
    qBlockG.fillRect(20, 10, 8, 4);
    qBlockG.fillRect(24, 14, 6, 6);
    qBlockG.fillRect(18, 14, 6, 6);
    qBlockG.fillRect(24, 18, 4, 6);
    qBlockG.fillRect(20, 22, 8, 4);
    qBlockG.fillRect(22, 26, 4, 4);
    qBlockG.fillRect(22, 32, 4, 5);
    qBlockG.generateTexture('question_block', 48, 48);
    qBlockG.destroy();

    // Used block texture
    const usedBlockG = this.make.graphics({ x: 0, y: 0, add: false });
    usedBlockG.fillStyle(0x8D6E63);
    usedBlockG.fillRect(0, 0, 48, 48);
    usedBlockG.fillStyle(0x795548);
    usedBlockG.fillRect(4, 4, 40, 40);
    usedBlockG.lineStyle(2, 0x5D4037);
    usedBlockG.strokeRect(1, 1, 46, 46);
    usedBlockG.generateTexture('used_block', 48, 48);
    usedBlockG.destroy();

    // Power-up: Speed (blue star)
    this.generatePowerUpTexture('powerup_speed', 0x42A5F5, 0x1E88E5);
    // Power-up: Double Jump (white star)
    this.generatePowerUpTexture('powerup_jump', 0xFFFFFF, 0xE0E0E0);
    // Power-up: Magnet (yellow star)
    this.generatePowerUpTexture('powerup_magnet', 0xFFEB3B, 0xFFC107);

    // Flying enemy (purple bat)
    const flyG = this.make.graphics({ x: 0, y: 0, add: false });
    // Body
    flyG.fillStyle(0x7E57C2);
    flyG.fillEllipse(24, 24, 28, 22);
    // Wings
    flyG.fillStyle(0x9575CD);
    flyG.fillTriangle(0, 14, 12, 20, 8, 32);
    flyG.fillTriangle(48, 14, 36, 20, 40, 32);
    // Eyes
    flyG.fillStyle(0xFFFFFF);
    flyG.fillCircle(17, 20, 5);
    flyG.fillCircle(31, 20, 5);
    flyG.fillStyle(0x311B92);
    flyG.fillCircle(18, 21, 3);
    flyG.fillCircle(32, 21, 3);
    // Fangs
    flyG.fillStyle(0xFFFFFF);
    flyG.fillTriangle(20, 28, 22, 34, 24, 28);
    flyG.fillTriangle(24, 28, 26, 34, 28, 28);
    flyG.generateTexture('flying_enemy', 48, 40);
    flyG.destroy();

    // Charging enemy (red bull)
    const chargeG = this.make.graphics({ x: 0, y: 0, add: false });
    // Body
    chargeG.fillStyle(0xD32F2F);
    chargeG.fillEllipse(24, 26, 40, 28);
    // Darker underside
    chargeG.fillStyle(0xB71C1C);
    chargeG.fillEllipse(24, 32, 40, 16);
    // Horns
    chargeG.fillStyle(0xBDBDBD);
    chargeG.fillTriangle(8, 14, 2, 4, 14, 18);
    chargeG.fillTriangle(40, 14, 46, 4, 34, 18);
    // Eyes (angry)
    chargeG.fillStyle(0xFFFFFF);
    chargeG.fillCircle(16, 20, 6);
    chargeG.fillCircle(32, 20, 6);
    chargeG.fillStyle(0x1A1A1A);
    chargeG.fillCircle(18, 21, 3);
    chargeG.fillCircle(34, 21, 3);
    // Nostrils
    chargeG.fillStyle(0xFF6F00);
    chargeG.fillCircle(21, 30, 3);
    chargeG.fillCircle(27, 30, 3);
    chargeG.generateTexture('charging_enemy', 48, 40);
    chargeG.destroy();

    // Boss (large enemy)
    const bossG = this.make.graphics({ x: 0, y: 0, add: false });
    // Large body
    bossG.fillStyle(0xE53935);
    bossG.fillEllipse(48, 52, 80, 56);
    bossG.fillStyle(0xC62828);
    bossG.fillEllipse(48, 60, 80, 36);
    // Crown
    bossG.fillStyle(0xFFD600);
    bossG.fillRect(24, 8, 48, 12);
    bossG.fillTriangle(24, 8, 32, 0, 40, 8);
    bossG.fillTriangle(40, 8, 48, 0, 56, 8);
    bossG.fillTriangle(56, 8, 64, 0, 72, 8);
    // Crown gems
    bossG.fillStyle(0xE53935);
    bossG.fillCircle(36, 14, 3);
    bossG.fillCircle(48, 14, 3);
    bossG.fillCircle(60, 14, 3);
    // Eyes
    bossG.fillStyle(0xFFFFFF);
    bossG.fillCircle(34, 40, 10);
    bossG.fillCircle(62, 40, 10);
    bossG.fillStyle(0x1A1A1A);
    bossG.fillCircle(36, 42, 6);
    bossG.fillCircle(64, 42, 6);
    // Angry eyebrows
    bossG.lineStyle(3, 0x1A1A1A);
    bossG.beginPath();
    bossG.moveTo(24, 30);
    bossG.lineTo(38, 34);
    bossG.strokePath();
    bossG.beginPath();
    bossG.moveTo(72, 30);
    bossG.lineTo(58, 34);
    bossG.strokePath();
    // Mouth
    bossG.fillStyle(0x1A1A1A);
    bossG.fillRect(36, 56, 24, 6);
    bossG.fillStyle(0xFFFFFF);
    bossG.fillTriangle(40, 56, 44, 52, 48, 56);
    bossG.fillTriangle(52, 56, 56, 52, 60, 56);
    bossG.generateTexture('boss', 96, 76);
    bossG.destroy();
  }

  generatePowerUpTexture(key, fillColor, strokeColor) {
    const g = this.make.graphics({ x: 0, y: 0, add: false });
    // Outer glow
    g.fillStyle(fillColor, 0.3);
    g.fillCircle(16, 16, 16);
    // Main circle
    g.fillStyle(fillColor);
    g.fillCircle(16, 16, 12);
    // Highlight
    g.fillStyle(0xFFFFFF, 0.5);
    g.fillCircle(13, 12, 5);
    // Border
    g.lineStyle(2, strokeColor);
    g.strokeCircle(16, 16, 12);
    // Star shape in center
    g.fillStyle(0xFFFFFF, 0.8);
    g.fillCircle(16, 16, 4);
    g.generateTexture(key, 32, 32);
    g.destroy();
  }

  create() {
    // S4.4: Show monkey on splash, hold for 1.5s, then fade to menu
    const monkey = this.add.image(GAME_WIDTH / 2, GAME_HEIGHT / 2 + 90, 'monkey');
    monkey.setScale(2.5);

    // Bounce the monkey
    this.tweens.add({
      targets: monkey,
      y: monkey.y - 15,
      duration: 500,
      yoyo: true,
      repeat: 1,
      ease: 'Sine.easeInOut'
    });

    // Animate title
    this.tweens.add({
      targets: this.splashElements.splashTitle,
      y: this.splashElements.splashTitle.y - 10,
      duration: 600,
      yoyo: true,
      repeat: 1,
      ease: 'Sine.easeInOut'
    });

    // After 1.5s, fade out and go to menu
    this.time.delayedCall(1500, () => {
      this.cameras.main.fadeOut(500, 0, 0, 0);
      this.time.delayedCall(500, () => {
        this.scene.start('MenuScene');
      });
    });
  }
}
