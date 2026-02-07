import Phaser from 'phaser';
import {
  GAME_WIDTH,
  GAME_HEIGHT,
  COLORS,
  PLAYER,
  LEVEL_1_PLATFORMS,
  LEVEL_1_COINS,
  LEVEL_1_ENEMIES,
  LEVEL_1_SPIKES
} from '../config/gameConfig.js';
import { Player } from '../sprites/Player.js';
import { Coin } from '../sprites/Coin.js';
import { Enemy } from '../sprites/Enemy.js';
import { Spike } from '../sprites/Spike.js';
import { StorageService } from '../services/StorageService.js';
import { TouchControls } from '../ui/TouchControls.js';

export class GameScene extends Phaser.Scene {
  constructor() {
    super({ key: 'GameScene' });
    this.score = 0;
    this.level = 1;
    this.totalCoins = 0;
    this.collectedCoins = 0;
    this.levelEnded = false;
  }

  create() {
    // Reset state
    this.score = 0;
    this.collectedCoins = 0;
    this.levelEnded = false;

    // Create background with gradient
    this.createBackground();

    // Create platforms
    this.platforms = this.physics.add.staticGroup();
    this.createPlatforms();

    // Create player
    this.player = new Player(this, PLAYER.START_X, PLAYER.START_Y);

    // Create touch controls (mobile only) and link to player
    this.touchControls = new TouchControls(this);
    this.player.touchControls = this.touchControls;

    // Create coins
    this.coins = this.physics.add.group();
    this.createCoins();

    // Create enemies
    this.enemies = this.physics.add.group();
    this.createEnemies();

    // Create spikes
    this.spikes = this.physics.add.staticGroup();
    this.createSpikes();

    // --- Collisions ---
    this.physics.add.collider(this.player, this.platforms);
    this.physics.add.collider(this.enemies, this.platforms);

    // Player <-> Coins
    this.physics.add.overlap(
      this.player, this.coins,
      this.handleCoinCollect, null, this
    );

    // Player <-> Enemies (stomp or damage)
    this.physics.add.overlap(
      this.player, this.enemies,
      this.handleEnemyCollision, null, this
    );

    // Player <-> Spikes
    this.physics.add.overlap(
      this.player, this.spikes,
      this.handleSpikeHit, null, this
    );

    // Launch UI scene
    this.scene.launch('UIScene', { gameScene: this });

    // Camera fade in
    this.cameras.main.fadeIn(500);

    // Emit initial state
    this.events.emit('updateScore', this.score);
    this.events.emit('updateLevel', this.level);
    this.events.emit('updateHighScore', StorageService.getHighScore());
    this.events.emit('updateLives', this.player.lives);

    // Listen for game over from player
    this.events.on('gameOver', this.handleGameOver, this);

    // --- Pause controls ---
    this.pauseKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.ESC);
    this.pKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.P);

    // Create pause button (top-right, touch-friendly)
    this.createPauseButton();

    // Auto-pause on tab/app blur
    this.visibilityHandler = () => {
      if (document.hidden && this.scene.isActive() && !this.levelEnded) {
        this.pauseGame();
      }
    };
    document.addEventListener('visibilitychange', this.visibilityHandler);

    // Clean up on scene shutdown
    this.events.on('shutdown', () => {
      document.removeEventListener('visibilitychange', this.visibilityHandler);
    });
  }

  // ---- Pause ----

  createPauseButton() {
    const btn = this.add.container(GAME_WIDTH - 40, 80);
    btn.setDepth(900);

    const bg = this.add.graphics();
    bg.fillStyle(0x000000, 0.3);
    bg.fillRoundedRect(-25, -25, 50, 50, 10);

    const icon = this.add.text(0, 0, '| |', {
      fontFamily: 'Arial Black, Arial',
      fontSize: '22px',
      color: '#FFFFFF'
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

  // ---- Entity creation ----

  createBackground() {
    const bg = this.add.graphics();
    bg.fillGradientStyle(0x87CEEB, 0x87CEEB, 0xB3E5FC, 0xB3E5FC, 1);
    bg.fillRect(0, 0, GAME_WIDTH, GAME_HEIGHT);
    this.createClouds();
    this.createHills();
  }

  createClouds() {
    const cloudPositions = [
      { x: 100, y: 80, scale: 1 },
      { x: 400, y: 120, scale: 0.8 },
      { x: 700, y: 60, scale: 1.2 },
      { x: 1000, y: 100, scale: 0.9 },
      { x: 1200, y: 70, scale: 1.1 }
    ];

    cloudPositions.forEach(cloud => {
      const g = this.add.graphics();
      g.fillStyle(0xFFFFFF, 0.8);
      g.fillCircle(0, 0, 30 * cloud.scale);
      g.fillCircle(25 * cloud.scale, -10 * cloud.scale, 25 * cloud.scale);
      g.fillCircle(50 * cloud.scale, 0, 30 * cloud.scale);
      g.fillCircle(25 * cloud.scale, 10 * cloud.scale, 20 * cloud.scale);
      g.setPosition(cloud.x, cloud.y);

      this.tweens.add({
        targets: g,
        x: g.x + 30,
        duration: 4000 + Math.random() * 2000,
        ease: 'Sine.easeInOut',
        yoyo: true,
        repeat: -1
      });
    });
  }

  createHills() {
    const hillGraphics = this.add.graphics();

    hillGraphics.fillStyle(0x81C784, 0.5);
    this.drawHill(hillGraphics, 0, GAME_HEIGHT - 100, 300, 100);
    this.drawHill(hillGraphics, 250, GAME_HEIGHT - 80, 250, 80);
    this.drawHill(hillGraphics, 600, GAME_HEIGHT - 120, 350, 120);
    this.drawHill(hillGraphics, 950, GAME_HEIGHT - 90, 400, 90);

    hillGraphics.fillStyle(0x66BB6A, 0.6);
    this.drawHill(hillGraphics, -50, GAME_HEIGHT - 60, 200, 60);
    this.drawHill(hillGraphics, 400, GAME_HEIGHT - 70, 280, 70);
    this.drawHill(hillGraphics, 800, GAME_HEIGHT - 50, 220, 50);
    this.drawHill(hillGraphics, 1100, GAME_HEIGHT - 80, 300, 80);
  }

  drawHill(graphics, x, y, width, height) {
    graphics.beginPath();
    graphics.moveTo(x, y);
    graphics.quadraticCurveTo(x + width / 2, y - height, x + width, y);
    graphics.closePath();
    graphics.fillPath();
  }

  createPlatforms() {
    LEVEL_1_PLATFORMS.forEach(platform => {
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
        tile.refreshBody();
      }
    });
  }

  createCoins() {
    this.totalCoins = LEVEL_1_COINS.length;
    LEVEL_1_COINS.forEach(coinPos => {
      const coin = new Coin(this, coinPos.x, coinPos.y);
      this.coins.add(coin);
    });
  }

  createEnemies() {
    LEVEL_1_ENEMIES.forEach(cfg => {
      const enemy = new Enemy(this, cfg.x, cfg.y, cfg);
      this.enemies.add(enemy);
    });
  }

  createSpikes() {
    LEVEL_1_SPIKES.forEach(pos => {
      const spike = new Spike(this, pos.x, pos.y);
      this.spikes.add(spike);
    });
  }

  // ---- Collision handlers ----

  handleCoinCollect(player, coin) {
    if (player.isDead) return;
    const points = coin.collect();
    this.score += points;
    this.collectedCoins++;

    StorageService.addCoins(1);
    this.events.emit('updateScore', this.score);
    player.collectCoin();
    this.showFloatingScore(coin.x, coin.y, points);

    if (this.collectedCoins >= this.totalCoins) {
      this.levelComplete();
    }
  }

  handleEnemyCollision(player, enemy) {
    if (player.isDead || !enemy.alive) return;

    // Stomp check: player is falling and player's feet are above enemy's center
    const isStomp = player.body.velocity.y > 0 &&
      player.body.bottom < enemy.body.center.y + 5;

    if (isStomp) {
      const points = enemy.stomp();
      this.score += points;
      this.events.emit('updateScore', this.score);
      this.showFloatingScore(enemy.x, enemy.y, points);

      // Bounce player up
      player.body.setVelocityY(-300);
    } else {
      // Player takes damage
      player.hit();
    }
  }

  handleSpikeHit(player, spike) {
    if (player.isDead) return;
    player.hit();
  }

  handleGameOver() {
    this.levelEnded = true;

    // Save high score
    StorageService.setHighScore(this.score);

    // Clean up touch controls
    if (this.touchControls) {
      this.touchControls.destroy();
      this.touchControls = null;
    }

    // Transition to game over scene
    this.cameras.main.fadeOut(500, 0, 0, 0);
    this.time.delayedCall(600, () => {
      this.scene.stop('UIScene');
      this.scene.stop();
      this.scene.start('GameOverScene', { score: this.score });
    });
  }

  // ---- UI helpers ----

  showFloatingScore(x, y, points) {
    const scoreText = this.add.text(x, y, `+${points}`, {
      fontFamily: 'Arial Black, Arial',
      fontSize: '24px',
      color: '#FFEB3B',
      stroke: '#000000',
      strokeThickness: 4
    }).setOrigin(0.5);

    this.tweens.add({
      targets: scoreText,
      y: y - 60,
      alpha: 0,
      duration: 800,
      ease: 'Power2',
      onComplete: () => scoreText.destroy()
    });
  }

  levelComplete() {
    this.levelEnded = true;

    const isNewHighScore = StorageService.setHighScore(this.score);
    const highScore = StorageService.getHighScore();

    const overlay = this.add.rectangle(
      GAME_WIDTH / 2, GAME_HEIGHT / 2,
      GAME_WIDTH, GAME_HEIGHT, 0x000000, 0
    );
    this.tweens.add({ targets: overlay, alpha: 0.5, duration: 500 });

    const completeText = this.add.text(
      GAME_WIDTH / 2, GAME_HEIGHT / 2 - 80,
      'LEVEL COMPLETE!',
      {
        fontFamily: 'Arial Black, Arial',
        fontSize: '64px',
        color: '#FFEB3B',
        stroke: '#FF9800',
        strokeThickness: 8
      }
    ).setOrigin(0.5).setAlpha(0);

    if (isNewHighScore) {
      const newHighText = this.add.text(
        GAME_WIDTH / 2, GAME_HEIGHT / 2 - 20,
        'NEW HIGH SCORE!',
        {
          fontFamily: 'Arial Black, Arial',
          fontSize: '32px',
          color: '#00FF00',
          stroke: '#000000',
          strokeThickness: 4
        }
      ).setOrigin(0.5).setAlpha(0);

      this.tweens.add({
        targets: newHighText,
        alpha: 1, scaleX: 1.2, scaleY: 1.2,
        duration: 300, delay: 500,
        yoyo: true, repeat: 2
      });
    }

    const scoreText = this.add.text(
      GAME_WIDTH / 2, GAME_HEIGHT / 2 + 30,
      `Score: ${this.score}`,
      { fontFamily: 'Arial', fontSize: '36px', color: '#FFFFFF', stroke: '#000000', strokeThickness: 4 }
    ).setOrigin(0.5).setAlpha(0);

    const highScoreText = this.add.text(
      GAME_WIDTH / 2, GAME_HEIGHT / 2 + 75,
      `High Score: ${highScore}`,
      { fontFamily: 'Arial', fontSize: '24px', color: '#FFD700', stroke: '#000000', strokeThickness: 3 }
    ).setOrigin(0.5).setAlpha(0);

    const isTouchDevice = this.sys.game.device.input.touch;
    const continueLabel = isTouchDevice ? 'Tap to play again' : 'Press SPACE to play again';

    const continueText = this.add.text(
      GAME_WIDTH / 2, GAME_HEIGHT / 2 + 130,
      continueLabel,
      { fontFamily: 'Arial', fontSize: '24px', color: '#FFFFFF', stroke: '#000000', strokeThickness: 3 }
    ).setOrigin(0.5).setAlpha(0);

    this.tweens.add({
      targets: [completeText, scoreText, highScoreText, continueText],
      alpha: 1, duration: 500, delay: 300
    });

    this.events.emit('updateHighScore', highScore);

    if (this.touchControls) {
      this.touchControls.destroy();
      this.touchControls = null;
    }

    const restart = () => {
      this.scene.stop('UIScene');
      this.scene.restart();
    };

    this.input.keyboard.once('keydown-SPACE', restart);
    this.time.delayedCall(800, () => {
      this.input.once('pointerdown', restart);
    });
  }

  // ---- Game loop ----

  update() {
    // Pause key checks
    if (Phaser.Input.Keyboard.JustDown(this.pauseKey) ||
        Phaser.Input.Keyboard.JustDown(this.pKey)) {
      this.pauseGame();
      return;
    }

    if (this.touchControls) {
      this.touchControls.update();
    }
    if (this.player && !this.player.isDead) {
      this.player.update();
    }

    // Update enemies
    this.enemies.getChildren().forEach(enemy => {
      if (enemy.active) enemy.update();
    });
  }
}
