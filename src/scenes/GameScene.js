import Phaser from 'phaser';
import {
  GAME_WIDTH,
  GAME_HEIGHT,
  COLORS,
  PLAYER,
  PLAYER_SPEED
} from '../config/gameConfig.js';
import { LEVELS, TOTAL_LEVELS } from '../config/levels.js';
import { Player } from '../sprites/Player.js';
import { Coin } from '../sprites/Coin.js';
import { Enemy } from '../sprites/Enemy.js';
import { Spike } from '../sprites/Spike.js';
import { MovingPlatform } from '../sprites/MovingPlatform.js';
import { FallingPlatform } from '../sprites/FallingPlatform.js';
import { StorageService } from '../services/StorageService.js';
import { AudioManager } from '../services/AudioManager.js';
import { TouchControls } from '../ui/TouchControls.js';

export class GameScene extends Phaser.Scene {
  constructor() {
    super({ key: 'GameScene' });
  }

  init(data) {
    this.levelNum = data.level || 1;
    this.levelData = LEVELS[this.levelNum - 1];
    this.score = 0;
    this.totalCoins = 0;
    this.collectedCoins = 0;
    this.levelEnded = false;
  }

  create() {
    const ld = this.levelData;

    // Themed background
    this.createThemedBackground(ld.theme);

    // Platforms
    this.platforms = this.physics.add.staticGroup();
    this.createPlatforms(ld.platforms, ld.theme);

    // Moving platforms
    this.movingPlatforms = this.physics.add.group({ allowGravity: false });
    if (ld.movingPlatforms) {
      this.createMovingPlatforms(ld.movingPlatforms, ld.theme);
    }

    // Falling platforms
    this.fallingPlatforms = this.physics.add.group({ allowGravity: false });
    if (ld.fallingPlatforms) {
      this.createFallingPlatforms(ld.fallingPlatforms, ld.theme);
    }

    // Player at level-specific spawn
    const spawn = ld.playerStart || PLAYER;
    this.player = new Player(this, spawn.x, spawn.y);

    // Touch controls
    this.touchControls = new TouchControls(this);
    this.player.touchControls = this.touchControls;

    // Coins
    this.coins = this.physics.add.group();
    this.createCoins(ld.coins);

    // Enemies
    this.enemies = this.physics.add.group();
    this.createEnemies(ld.enemies);

    // Spikes
    this.spikes = this.physics.add.staticGroup();
    this.createSpikes(ld.spikes);

    // Collisions
    this.physics.add.collider(this.player, this.platforms);
    this.physics.add.collider(this.player, this.movingPlatforms, this.handleMovingPlatformCollide, null, this);
    this.physics.add.collider(this.player, this.fallingPlatforms, this.handleFallingPlatformCollide, null, this);
    this.physics.add.collider(this.enemies, this.platforms);
    this.physics.add.collider(this.enemies, this.movingPlatforms);
    this.physics.add.overlap(this.player, this.coins, this.handleCoinCollect, null, this);
    this.physics.add.overlap(this.player, this.enemies, this.handleEnemyCollision, null, this);
    this.physics.add.overlap(this.player, this.spikes, this.handleSpikeHit, null, this);

    // UI
    this.scene.launch('UIScene', { gameScene: this });
    this.cameras.main.fadeIn(500);

    this.events.emit('updateScore', this.score);
    this.events.emit('updateLevel', this.levelNum);
    this.events.emit('updateHighScore', StorageService.getHighScore());
    this.events.emit('updateLives', this.player.lives);

    this.events.on('gameOver', this.handleGameOver, this);

    // Start gameplay music
    AudioManager.playMusic('gameplay');

    // Pause
    this.pauseKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.ESC);
    this.pKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.P);
    this.createPauseButton();

    this.visibilityHandler = () => {
      if (document.hidden && this.scene.isActive() && !this.levelEnded) {
        this.pauseGame();
      }
    };
    document.addEventListener('visibilitychange', this.visibilityHandler);
    this.events.on('shutdown', () => {
      document.removeEventListener('visibilitychange', this.visibilityHandler);
    });

    // ── S4.1: Camera juice ──
    this.setupCamera();

    // ── S4.3: Tutorial (Level 1, first time only) ──
    this.setupTutorial();
  }

  // ════════════════════════════════════════════
  // S4.1 — CAMERA
  // ════════════════════════════════════════════

  setupCamera() {
    const cam = this.cameras.main;
    cam.startFollow(this.player, true, 0.08, 0.08);
    cam.setDeadzone(100, 50);
    cam.setBounds(0, 0, GAME_WIDTH, GAME_HEIGHT);
  }

  cameraShake(duration, intensity) {
    this.cameras.main.shake(duration, intensity);
  }

  cameraZoomPulse() {
    const cam = this.cameras.main;
    this.tweens.add({
      targets: cam,
      zoom: 1.05,
      duration: 200,
      yoyo: true,
      ease: 'Sine.easeInOut'
    });
  }

  // ════════════════════════════════════════════
  // S4.3 — TUTORIAL
  // ════════════════════════════════════════════

  setupTutorial() {
    if (this.levelNum !== 1) return;
    const tutorialSeen = StorageService.getSettings().tutorialSeen;
    if (tutorialSeen) return;

    this.tutorialActive = true;
    const isTouchDevice = this.sys.game.device.input.touch;

    // Move prompt
    const moveText = isTouchDevice
      ? 'Tap the arrows to move'
      : 'Arrow Keys / WASD to move';
    this.tutorialMove = this.add.text(this.player.x, this.player.y - 80, moveText, {
      fontFamily: 'Arial Black, Arial', fontSize: '18px',
      color: '#FFFFFF', stroke: '#000000', strokeThickness: 4,
      align: 'center'
    }).setOrigin(0.5).setDepth(800);

    this.tweens.add({
      targets: this.tutorialMove,
      y: this.tutorialMove.y - 8,
      duration: 600, yoyo: true, repeat: -1
    });

    // Jump prompt (appears after player moves)
    const jumpText = isTouchDevice ? 'Tap JUMP to jump!' : 'SPACE or UP to jump!';
    this.tutorialJump = this.add.text(this.player.x, this.player.y - 80, jumpText, {
      fontFamily: 'Arial Black, Arial', fontSize: '18px',
      color: '#FFFFFF', stroke: '#000000', strokeThickness: 4,
      align: 'center'
    }).setOrigin(0.5).setDepth(800).setAlpha(0);

    // Enemy warning — near the first enemy
    const enemies = this.levelData.enemies;
    if (enemies.length > 0) {
      const e = enemies[0];
      this.tutorialEnemy = this.add.text(e.x, e.y - 60, 'Watch out!  \u26A0', {
        fontFamily: 'Arial Black, Arial', fontSize: '16px',
        color: '#FF5252', stroke: '#000000', strokeThickness: 4
      }).setOrigin(0.5).setDepth(800).setAlpha(0);

      this.tweens.add({
        targets: this.tutorialEnemy,
        y: e.y - 70, duration: 500, yoyo: true, repeat: -1
      });
    }

    this.tutorialMoveDone = false;
    this.tutorialJumpDone = false;
  }

  updateTutorial() {
    if (!this.tutorialActive) return;

    // Dismiss move prompt once player has moved
    if (!this.tutorialMoveDone && Math.abs(this.player.body.velocity.x) > 10) {
      this.tutorialMoveDone = true;
      this.tweens.add({
        targets: this.tutorialMove, alpha: 0, duration: 300,
        onComplete: () => this.tutorialMove.destroy()
      });
      // Show jump prompt
      this.tutorialJump.setPosition(this.player.x, this.player.y - 80);
      this.tweens.add({ targets: this.tutorialJump, alpha: 1, duration: 300 });
      this.tweens.add({
        targets: this.tutorialJump,
        y: this.tutorialJump.y - 8,
        duration: 600, yoyo: true, repeat: -1
      });
    }

    // Dismiss jump prompt once player has jumped
    if (this.tutorialMoveDone && !this.tutorialJumpDone && this.player.isJumping) {
      this.tutorialJumpDone = true;
      this.tweens.add({
        targets: this.tutorialJump, alpha: 0, duration: 300,
        onComplete: () => this.tutorialJump.destroy()
      });
      // Show enemy warning
      if (this.tutorialEnemy) {
        this.tweens.add({ targets: this.tutorialEnemy, alpha: 1, duration: 400 });
        // Auto-dismiss after 4s
        this.time.delayedCall(4000, () => {
          if (this.tutorialEnemy && this.tutorialEnemy.active) {
            this.tweens.add({
              targets: this.tutorialEnemy, alpha: 0, duration: 300,
              onComplete: () => { if (this.tutorialEnemy) this.tutorialEnemy.destroy(); }
            });
          }
        });
      }
      // Mark tutorial as seen
      StorageService.updateSettings({ tutorialSeen: true });
      this.tutorialActive = false;
    }
  }

  // ════════════════════════════════════════════
  // THEMED BACKGROUND RENDERING
  // ════════════════════════════════════════════

  createThemedBackground(theme) {
    const bg = this.add.graphics();
    const [tl, tr, bl, br] = theme.skyGradient;
    bg.fillGradientStyle(tl, tr, bl, br, 1);
    bg.fillRect(0, 0, GAME_WIDTH, GAME_HEIGHT);

    // Decoration layer
    switch (theme.decoration) {
      case 'clouds': this.createClouds(); break;
      case 'bubbles': this.createBubbles(); break;
      case 'neonShapes': this.createNeonShapes(); break;
      case 'snowflakes': this.createSnowflakes(); break;
      case 'embers': this.createEmbers(); break;
    }

    // Hills (tinted per theme)
    this.createThemedHills(theme.hillColors);
  }

  createClouds() {
    const positions = [
      { x: 100, y: 80, s: 1 }, { x: 400, y: 120, s: 0.8 },
      { x: 700, y: 60, s: 1.2 }, { x: 1000, y: 100, s: 0.9 },
      { x: 1200, y: 70, s: 1.1 }
    ];
    positions.forEach(c => {
      const g = this.add.graphics();
      g.fillStyle(0xFFFFFF, 0.8);
      g.fillCircle(0, 0, 30 * c.s);
      g.fillCircle(25 * c.s, -10 * c.s, 25 * c.s);
      g.fillCircle(50 * c.s, 0, 30 * c.s);
      g.fillCircle(25 * c.s, 10 * c.s, 20 * c.s);
      g.setPosition(c.x, c.y);
      this.tweens.add({
        targets: g, x: g.x + 30,
        duration: 4000 + Math.random() * 2000,
        ease: 'Sine.easeInOut', yoyo: true, repeat: -1
      });
    });
  }

  createBubbles() {
    for (let i = 0; i < 25; i++) {
      const x = Phaser.Math.Between(0, GAME_WIDTH);
      const y = Phaser.Math.Between(0, GAME_HEIGHT);
      const r = Phaser.Math.Between(4, 14);
      const g = this.add.graphics();
      g.lineStyle(1.5, 0x81D4FA, 0.5);
      g.strokeCircle(0, 0, r);
      g.fillStyle(0xE1F5FE, 0.1);
      g.fillCircle(0, 0, r);
      g.fillStyle(0xFFFFFF, 0.3);
      g.fillCircle(-r * 0.3, -r * 0.3, r * 0.25);
      g.setPosition(x, y);

      this.tweens.add({
        targets: g, y: g.y - Phaser.Math.Between(100, 300),
        alpha: 0, duration: Phaser.Math.Between(4000, 8000),
        delay: Phaser.Math.Between(0, 3000),
        repeat: -1, onRepeat: () => {
          g.setPosition(Phaser.Math.Between(0, GAME_WIDTH), GAME_HEIGHT + 20);
          g.setAlpha(1);
        }
      });
    }
  }

  createNeonShapes() {
    const shapes = [
      { x: 100, y: 100, type: 'ring' }, { x: 350, y: 200, type: 'diamond' },
      { x: 600, y: 80, type: 'ring' }, { x: 850, y: 180, type: 'diamond' },
      { x: 1100, y: 120, type: 'ring' }, { x: 200, y: 350, type: 'diamond' },
      { x: 500, y: 300, type: 'ring' }, { x: 800, y: 350, type: 'diamond' },
      { x: 1050, y: 300, type: 'ring' }
    ];
    const neonColors = [0xFF00FF, 0x00FFFF, 0xFFFF00, 0xFF4081, 0x00E5FF];

    shapes.forEach((s, i) => {
      const g = this.add.graphics();
      const color = neonColors[i % neonColors.length];
      g.lineStyle(2, color, 0.35);

      if (s.type === 'ring') {
        g.strokeCircle(0, 0, Phaser.Math.Between(15, 30));
      } else {
        const sz = Phaser.Math.Between(12, 22);
        g.beginPath();
        g.moveTo(0, -sz); g.lineTo(sz, 0);
        g.lineTo(0, sz); g.lineTo(-sz, 0);
        g.closePath(); g.strokePath();
      }
      g.setPosition(s.x, s.y);

      this.tweens.add({
        targets: g,
        alpha: { from: 0.2, to: 0.6 },
        angle: s.type === 'ring' ? 360 : 0,
        duration: 2000 + i * 300,
        yoyo: true, repeat: -1, ease: 'Sine.easeInOut'
      });
    });
  }

  createSnowflakes() {
    for (let i = 0; i < 40; i++) {
      const x = Phaser.Math.Between(0, GAME_WIDTH);
      const y = Phaser.Math.Between(-50, GAME_HEIGHT);
      const size = Phaser.Math.Between(2, 5);
      const flake = this.add.circle(x, y, size, 0xFFFFFF, 0.7);

      this.tweens.add({
        targets: flake,
        y: GAME_HEIGHT + 30,
        x: flake.x + Phaser.Math.Between(-60, 60),
        duration: Phaser.Math.Between(5000, 12000),
        delay: Phaser.Math.Between(0, 4000),
        repeat: -1,
        onRepeat: () => {
          flake.setPosition(Phaser.Math.Between(0, GAME_WIDTH), -10);
        }
      });
    }
  }

  createEmbers() {
    for (let i = 0; i < 30; i++) {
      const x = Phaser.Math.Between(0, GAME_WIDTH);
      const y = Phaser.Math.Between(GAME_HEIGHT * 0.5, GAME_HEIGHT);
      const size = Phaser.Math.Between(2, 5);
      const colors = [0xFF6D00, 0xFF9100, 0xFFAB00, 0xFF3D00];
      const ember = this.add.circle(x, y, size, Phaser.Utils.Array.GetRandom(colors), 0.8);

      this.tweens.add({
        targets: ember,
        y: Phaser.Math.Between(-50, GAME_HEIGHT * 0.3),
        x: ember.x + Phaser.Math.Between(-80, 80),
        alpha: 0,
        duration: Phaser.Math.Between(3000, 7000),
        delay: Phaser.Math.Between(0, 3000),
        repeat: -1,
        onRepeat: () => {
          ember.setPosition(
            Phaser.Math.Between(0, GAME_WIDTH),
            Phaser.Math.Between(GAME_HEIGHT * 0.6, GAME_HEIGHT + 20)
          );
          ember.setAlpha(0.8);
        }
      });
    }

    // Lava glow at bottom
    const lava = this.add.graphics();
    lava.fillStyle(0xFF3D00, 0.15);
    lava.fillRect(0, GAME_HEIGHT - 40, GAME_WIDTH, 40);
    lava.fillStyle(0xFF6D00, 0.1);
    lava.fillRect(0, GAME_HEIGHT - 20, GAME_WIDTH, 20);
    this.tweens.add({
      targets: lava, alpha: { from: 0.6, to: 1 },
      duration: 800, yoyo: true, repeat: -1
    });
  }

  createThemedHills(hillColors) {
    const g = this.add.graphics();
    g.fillStyle(hillColors[0], 0.4);
    this.drawHill(g, 0, GAME_HEIGHT - 100, 300, 100);
    this.drawHill(g, 250, GAME_HEIGHT - 80, 250, 80);
    this.drawHill(g, 600, GAME_HEIGHT - 120, 350, 120);
    this.drawHill(g, 950, GAME_HEIGHT - 90, 400, 90);

    g.fillStyle(hillColors[1], 0.5);
    this.drawHill(g, -50, GAME_HEIGHT - 60, 200, 60);
    this.drawHill(g, 400, GAME_HEIGHT - 70, 280, 70);
    this.drawHill(g, 800, GAME_HEIGHT - 50, 220, 50);
    this.drawHill(g, 1100, GAME_HEIGHT - 80, 300, 80);
  }

  drawHill(graphics, x, y, width, height) {
    graphics.beginPath();
    graphics.moveTo(x, y);
    graphics.quadraticCurveTo(x + width / 2, y - height, x + width, y);
    graphics.closePath();
    graphics.fillPath();
  }

  // ════════════════════════════════════════════
  // ENTITY CREATION
  // ════════════════════════════════════════════

  createPlatforms(platformData, theme) {
    platformData.forEach(platform => {
      const isGround = platform.height > 32;
      const texture = isGround ? 'ground' : 'platform';
      const tileWidth = 64;
      const tileHeight = isGround ? 64 : 32;
      const tilesX = Math.ceil(platform.width / tileWidth);
      const startX = platform.x - platform.width / 2;
      const startY = platform.y - platform.height / 2;

      for (let i = 0; i < tilesX; i++) {
        const tile = this.platforms.create(
          startX + i * tileWidth + tileWidth / 2,
          startY + tileHeight / 2,
          texture
        );
        tile.setDisplaySize(tileWidth, tileHeight);
        if (isGround && theme.groundTint) tile.setTint(theme.groundTint);
        else if (!isGround && theme.platformTint) tile.setTint(theme.platformTint);
        tile.refreshBody();
      }
    });
  }

  createMovingPlatforms(data, theme) {
    data.forEach(cfg => {
      const mp = new MovingPlatform(this, cfg.x, cfg.y, cfg);
      if (theme.platformTint) mp.setTint(theme.platformTint);
      this.movingPlatforms.add(mp);
    });
  }

  createFallingPlatforms(data, theme) {
    data.forEach(cfg => {
      const fp = new FallingPlatform(this, cfg.x, cfg.y, cfg);
      if (theme.platformTint) fp.setTint(theme.platformTint);
      this.fallingPlatforms.add(fp);
    });
  }

  createCoins(coinData) {
    this.totalCoins = coinData.length;
    coinData.forEach(pos => {
      const coin = new Coin(this, pos.x, pos.y);
      this.coins.add(coin);
    });
  }

  createEnemies(enemyData) {
    enemyData.forEach(cfg => {
      const enemy = new Enemy(this, cfg.x, cfg.y, cfg);
      this.enemies.add(enemy);
    });
  }

  createSpikes(spikeData) {
    spikeData.forEach(pos => {
      const spike = new Spike(this, pos.x, pos.y);
      this.spikes.add(spike);
    });
  }

  // ════════════════════════════════════════════
  // PAUSE
  // ════════════════════════════════════════════

  createPauseButton() {
    const btn = this.add.container(GAME_WIDTH - 40, 80);
    btn.setDepth(900);
    const bg = this.add.graphics();
    bg.fillStyle(0x000000, 0.3);
    bg.fillRoundedRect(-25, -25, 50, 50, 10);
    const icon = this.add.text(0, 0, '| |', {
      fontFamily: 'Arial Black, Arial', fontSize: '22px', color: '#FFFFFF'
    }).setOrigin(0.5);
    btn.add([bg, icon]);
    btn.setSize(50, 50);
    btn.setInteractive({ useHandCursor: true });
    btn.setScrollFactor(0);
    btn.on('pointerdown', () => this.pauseGame());
  }

  pauseGame() {
    if (this.scene.isPaused() || this.levelEnded) return;
    this.scene.pause();
    this.scene.launch('PauseScene');
  }

  // ════════════════════════════════════════════
  // COLLISION HANDLERS
  // ════════════════════════════════════════════

  handleMovingPlatformCollide(player, platform) {
    // Inherit horizontal velocity so player rides the platform
    if (player.body.touching.down && platform.body) {
      player.ridingPlatformVx = platform.body.velocity.x;
    }
  }

  handleFallingPlatformCollide(player, platform) {
    if (player.body.touching.down && !platform.falling) {
      platform.triggerFall();
    }
  }

  handleCoinCollect(player, coin) {
    if (player.isDead) return;
    const points = coin.collect();
    this.score += points;
    this.collectedCoins++;
    StorageService.addCoins(1);
    AudioManager.playSound('coin_collect');
    AudioManager.vibrate(15);
    this.events.emit('updateScore', this.score);
    player.collectCoin();
    this.showFloatingScore(coin.x, coin.y, points);
    if (this.collectedCoins >= this.totalCoins) {
      this.levelComplete();
    }
  }

  handleEnemyCollision(player, enemy) {
    if (player.isDead || !enemy.alive) return;
    const isStomp = player.body.velocity.y > 0 &&
      player.body.bottom < enemy.body.center.y + 5;
    if (isStomp) {
      const points = enemy.stomp();
      this.score += points;
      AudioManager.playSound('enemy_stomp');
      AudioManager.vibrate(20);
      this.cameraShake(80, 0.006);
      this.events.emit('updateScore', this.score);
      this.showFloatingScore(enemy.x, enemy.y, points);
      player.body.setVelocityY(-300);
    } else {
      player.hit();
    }
  }

  handleSpikeHit(player) {
    if (player.isDead) return;
    player.hit();
  }

  handleGameOver() {
    this.levelEnded = true;
    AudioManager.stopMusic();
    AudioManager.playSound('game_over');
    StorageService.setHighScore(this.score);
    if (this.touchControls) { this.touchControls.destroy(); this.touchControls = null; }
    this.cameras.main.fadeOut(500, 0, 0, 0);
    this.time.delayedCall(600, () => {
      this.scene.stop('UIScene');
      this.scene.stop();
      this.scene.start('GameOverScene', { score: this.score, level: this.levelNum });
    });
  }

  // ════════════════════════════════════════════
  // S4.2 — PARTICLE EFFECTS
  // ════════════════════════════════════════════

  spawnDustPuff(x, y) {
    for (let i = 0; i < 4; i++) {
      const size = Phaser.Math.Between(3, 6);
      const p = this.add.circle(x + Phaser.Math.Between(-10, 10), y, size, 0x8D6E63, 0.6);
      const angle = Phaser.Math.FloatBetween(-Math.PI * 0.8, -Math.PI * 0.2);
      const dist = Phaser.Math.Between(15, 35);
      this.tweens.add({
        targets: p,
        x: p.x + Math.cos(angle) * dist,
        y: p.y + Math.sin(angle) * dist,
        alpha: 0,
        scale: 0.3,
        duration: Phaser.Math.Between(250, 400),
        onComplete: () => p.destroy()
      });
    }
  }

  spawnSpeedLines(x, y, direction) {
    for (let i = 0; i < 2; i++) {
      const line = this.add.rectangle(
        x + direction * 20,
        y + Phaser.Math.Between(-15, 15),
        Phaser.Math.Between(12, 25), 2,
        0xFFFFFF, 0.4
      );
      this.tweens.add({
        targets: line,
        x: line.x + direction * 30,
        alpha: 0,
        duration: 200,
        onComplete: () => line.destroy()
      });
    }
  }

  spawnDeathParticles(x, y) {
    const colors = [0xFF9800, 0x795548, 0xFFEB3B, 0xFF5722, 0xFFFFFF];
    for (let i = 0; i < 12; i++) {
      const size = Phaser.Math.Between(3, 7);
      const color = Phaser.Utils.Array.GetRandom(colors);
      const p = this.add.circle(x, y, size, color, 0.9);
      const angle = (i / 12) * Math.PI * 2;
      const dist = Phaser.Math.Between(40, 80);
      this.tweens.add({
        targets: p,
        x: x + Math.cos(angle) * dist,
        y: y + Math.sin(angle) * dist - 20,
        alpha: 0,
        scale: 0,
        duration: Phaser.Math.Between(400, 700),
        ease: 'Power2',
        onComplete: () => p.destroy()
      });
    }
  }

  // ════════════════════════════════════════════
  // UI HELPERS
  // ════════════════════════════════════════════

  showFloatingScore(x, y, points) {
    const t = this.add.text(x, y, `+${points}`, {
      fontFamily: 'Arial Black, Arial', fontSize: '24px',
      color: '#FFEB3B', stroke: '#000000', strokeThickness: 4
    }).setOrigin(0.5);
    this.tweens.add({
      targets: t, y: y - 60, alpha: 0, duration: 800,
      ease: 'Power2', onComplete: () => t.destroy()
    });
  }

  // ════════════════════════════════════════════
  // LEVEL COMPLETE — with star rating + next level
  // ════════════════════════════════════════════

  levelComplete() {
    this.levelEnded = true;
    AudioManager.stopMusic();
    AudioManager.playSound('level_complete');

    // S4.1: Zoom pulse on level complete
    this.cameraZoomPulse();

    // Calculate stars
    const pct = this.collectedCoins / this.totalCoins;
    let stars = 1;
    if (pct >= 0.75) stars = 2;
    if (pct >= 1) stars = 3;

    // Persist
    StorageService.setHighScore(this.score);
    StorageService.setLevelStars(this.levelNum, stars);
    if (this.levelNum < TOTAL_LEVELS) {
      StorageService.unlockLevel(this.levelNum + 1);
    }
    const highScore = StorageService.getHighScore();

    // Overlay
    const overlay = this.add.rectangle(
      GAME_WIDTH / 2, GAME_HEIGHT / 2,
      GAME_WIDTH, GAME_HEIGHT, 0x000000, 0
    );
    this.tweens.add({ targets: overlay, alpha: 0.6, duration: 500 });

    // Title
    const completeText = this.add.text(
      GAME_WIDTH / 2, GAME_HEIGHT / 2 - 120,
      'LEVEL COMPLETE!', {
        fontFamily: 'Arial Black, Arial', fontSize: '56px',
        color: '#FFEB3B', stroke: '#FF9800', strokeThickness: 8
      }
    ).setOrigin(0.5).setAlpha(0).setScrollFactor(0);

    // Star display — animated reveal
    const starY = GAME_HEIGHT / 2 - 50;
    const starTexts = [];
    for (let i = 0; i < 3; i++) {
      const filled = i < stars;
      const s = this.add.text(GAME_WIDTH / 2 - 50 + i * 50, starY, filled ? '\u2605' : '\u2606', {
        fontFamily: 'Arial', fontSize: '48px',
        color: filled ? '#FFD700' : '#666666'
      }).setOrigin(0.5).setAlpha(0).setScale(0).setScrollFactor(0);
      starTexts.push(s);
    }

    // Coins collected text
    const coinText = this.add.text(
      GAME_WIDTH / 2, GAME_HEIGHT / 2 + 10,
      `Coins: ${this.collectedCoins} / ${this.totalCoins}`, {
        fontFamily: 'Arial', fontSize: '24px',
        color: '#FFFFFF', stroke: '#000000', strokeThickness: 3
      }
    ).setOrigin(0.5).setAlpha(0).setScrollFactor(0);

    // Score
    const scoreText = this.add.text(
      GAME_WIDTH / 2, GAME_HEIGHT / 2 + 45,
      `Score: ${this.score}`, {
        fontFamily: 'Arial', fontSize: '28px',
        color: '#FFFFFF', stroke: '#000000', strokeThickness: 4
      }
    ).setOrigin(0.5).setAlpha(0).setScrollFactor(0);

    // Animate in sequence
    this.tweens.add({
      targets: completeText, alpha: 1, duration: 400, delay: 200
    });
    this.tweens.add({
      targets: [coinText, scoreText], alpha: 1, duration: 400, delay: 400
    });

    // Stars pop in one at a time
    starTexts.forEach((s, i) => {
      this.time.delayedCall(600 + i * 250, () => {
        AudioManager.playSound('star_reveal');
      });
      this.tweens.add({
        targets: s, alpha: 1, scale: 1, duration: 300,
        delay: 600 + i * 250, ease: 'Back.easeOut'
      });
    });

    // Buttons — after animation
    this.time.delayedCall(1500, () => {
      this.createCompleteButtons();
    });

    this.events.emit('updateHighScore', highScore);

    if (this.touchControls) {
      this.touchControls.destroy();
      this.touchControls = null;
    }
  }

  createCompleteButtons() {
    const btnY = GAME_HEIGHT / 2 + 120;
    const hasNext = this.levelNum < TOTAL_LEVELS;

    if (hasNext) {
      this.createActionButton(GAME_WIDTH / 2 - 140, btnY, 'NEXT LEVEL', () => {
        this.scene.stop('UIScene');
        this.scene.restart({ level: this.levelNum + 1 });
      });
    }

    this.createActionButton(
      hasNext ? GAME_WIDTH / 2 + 10 : GAME_WIDTH / 2 - 65,
      btnY, 'RETRY', () => {
        this.scene.stop('UIScene');
        this.scene.restart({ level: this.levelNum });
      }
    );

    this.createActionButton(GAME_WIDTH / 2, btnY + 60, 'LEVEL SELECT', () => {
      this.scene.stop('UIScene');
      this.scene.stop();
      this.scene.start('LevelSelectScene');
    });
  }

  createActionButton(x, y, label, callback) {
    const container = this.add.container(x, y).setDepth(1000).setScrollFactor(0);
    const w = 130;
    const bg = this.add.graphics();
    bg.fillStyle(0x333333, 0.9);
    bg.fillRoundedRect(-w / 2, -22, w, 44, 10);
    bg.lineStyle(2, 0xFFEB3B, 0.6);
    bg.strokeRoundedRect(-w / 2, -22, w, 44, 10);
    const text = this.add.text(0, 0, label, {
      fontFamily: 'Arial Black, Arial', fontSize: '16px', color: '#FFFFFF'
    }).setOrigin(0.5);
    container.add([bg, text]);
    container.setSize(w, 44);
    container.setInteractive({ useHandCursor: true });
    container.on('pointerover', () => text.setColor('#FFEB3B'));
    container.on('pointerout', () => text.setColor('#FFFFFF'));
    container.on('pointerdown', callback);
  }

  // ════════════════════════════════════════════
  // GAME LOOP
  // ════════════════════════════════════════════

  update() {
    if (Phaser.Input.Keyboard.JustDown(this.pauseKey) ||
        Phaser.Input.Keyboard.JustDown(this.pKey)) {
      this.pauseGame();
      return;
    }
    if (this.touchControls) this.touchControls.update();
    if (this.player && !this.player.isDead) this.player.update();
    this.enemies.getChildren().forEach(e => { if (e.active) e.update(); });
    this.movingPlatforms.getChildren().forEach(p => { if (p.active) p.update(); });

    // S4.3: Tutorial
    this.updateTutorial();

    // S4.2: Speed lines when running fast
    if (this.player && !this.player.isDead && !this.levelEnded) {
      const speed = Math.abs(this.player.body.velocity.x);
      if (speed > PLAYER_SPEED * 0.8) {
        const dir = this.player.body.velocity.x > 0 ? -1 : 1;
        this.spawnSpeedLines(this.player.x, this.player.y, dir);
      }
    }

    // Reset riding platform velocity each frame
    if (this.player) {
      this.player.ridingPlatformVx = 0;
    }
  }
}
