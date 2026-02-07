import Phaser from 'phaser';
import {
  GAME_WIDTH,
  GAME_HEIGHT,
  COLORS,
  PLAYER,
  LEVEL_1_PLATFORMS,
  LEVEL_1_COINS
} from '../config/gameConfig.js';
import { Player } from '../sprites/Player.js';
import { Coin } from '../sprites/Coin.js';
import { StorageService } from '../services/StorageService.js';
import { TouchControls } from '../ui/TouchControls.js';

export class GameScene extends Phaser.Scene {
  constructor() {
    super({ key: 'GameScene' });
    this.score = 0;
    this.level = 1;
    this.totalCoins = 0;
    this.collectedCoins = 0;
  }

  create() {
    // Reset state
    this.score = 0;
    this.collectedCoins = 0;

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

    // Setup collisions
    this.physics.add.collider(this.player, this.platforms);
    this.physics.add.overlap(
      this.player,
      this.coins,
      this.handleCoinCollect,
      null,
      this
    );

    // Launch UI scene
    this.scene.launch('UIScene', { gameScene: this });

    // Camera fade in
    this.cameras.main.fadeIn(500);

    // Emit initial score and high score
    this.events.emit('updateScore', this.score);
    this.events.emit('updateLevel', this.level);
    this.events.emit('updateHighScore', StorageService.getHighScore());
  }

  createBackground() {
    // Sky gradient
    const bg = this.add.graphics();
    bg.fillGradientStyle(0x87CEEB, 0x87CEEB, 0xB3E5FC, 0xB3E5FC, 1);
    bg.fillRect(0, 0, GAME_WIDTH, GAME_HEIGHT);

    // Decorative clouds
    this.createClouds();

    // Decorative hills in background
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

      // Cloud shape (overlapping circles)
      g.fillCircle(0, 0, 30 * cloud.scale);
      g.fillCircle(25 * cloud.scale, -10 * cloud.scale, 25 * cloud.scale);
      g.fillCircle(50 * cloud.scale, 0, 30 * cloud.scale);
      g.fillCircle(25 * cloud.scale, 10 * cloud.scale, 20 * cloud.scale);

      g.setPosition(cloud.x, cloud.y);

      // Slow floating animation
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

    // Far hills (darker, smaller)
    hillGraphics.fillStyle(0x81C784, 0.5);
    this.drawHill(hillGraphics, 0, GAME_HEIGHT - 100, 300, 100);
    this.drawHill(hillGraphics, 250, GAME_HEIGHT - 80, 250, 80);
    this.drawHill(hillGraphics, 600, GAME_HEIGHT - 120, 350, 120);
    this.drawHill(hillGraphics, 950, GAME_HEIGHT - 90, 400, 90);

    // Near hills (brighter, larger)
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

      // Create tiled platform
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
      new Coin(this, coinPos.x, coinPos.y);
      this.coins.add(this.coins.getLast(true));
    });
  }

  handleCoinCollect(player, coin) {
    const points = coin.collect();
    this.score += points;
    this.collectedCoins++;

    // Track total coins collected (lifetime stat)
    StorageService.addCoins(1);

    // Update UI
    this.events.emit('updateScore', this.score);

    // Player feedback
    player.collectCoin();

    // Show floating score text
    this.showFloatingScore(coin.x, coin.y, points);

    // Check for level complete
    if (this.collectedCoins >= this.totalCoins) {
      this.levelComplete();
    }
  }

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
    // Check for new high score
    const isNewHighScore = StorageService.setHighScore(this.score);
    const highScore = StorageService.getHighScore();

    // Show completion message
    const overlay = this.add.rectangle(
      GAME_WIDTH / 2,
      GAME_HEIGHT / 2,
      GAME_WIDTH,
      GAME_HEIGHT,
      0x000000,
      0
    );

    this.tweens.add({
      targets: overlay,
      alpha: 0.5,
      duration: 500
    });

    const completeText = this.add.text(
      GAME_WIDTH / 2,
      GAME_HEIGHT / 2 - 80,
      'LEVEL COMPLETE!',
      {
        fontFamily: 'Arial Black, Arial',
        fontSize: '64px',
        color: '#FFEB3B',
        stroke: '#FF9800',
        strokeThickness: 8
      }
    ).setOrigin(0.5).setAlpha(0);

    // New high score celebration
    if (isNewHighScore) {
      const newHighText = this.add.text(
        GAME_WIDTH / 2,
        GAME_HEIGHT / 2 - 20,
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
        alpha: 1,
        scaleX: 1.2,
        scaleY: 1.2,
        duration: 300,
        delay: 500,
        yoyo: true,
        repeat: 2
      });
    }

    const scoreText = this.add.text(
      GAME_WIDTH / 2,
      GAME_HEIGHT / 2 + 30,
      `Score: ${this.score}`,
      {
        fontFamily: 'Arial',
        fontSize: '36px',
        color: '#FFFFFF',
        stroke: '#000000',
        strokeThickness: 4
      }
    ).setOrigin(0.5).setAlpha(0);

    const highScoreText = this.add.text(
      GAME_WIDTH / 2,
      GAME_HEIGHT / 2 + 75,
      `High Score: ${highScore}`,
      {
        fontFamily: 'Arial',
        fontSize: '24px',
        color: '#FFD700',
        stroke: '#000000',
        strokeThickness: 3
      }
    ).setOrigin(0.5).setAlpha(0);

    const isTouchDevice = this.sys.game.device.input.touch;
    const continueLabel = isTouchDevice ? 'Tap to play again' : 'Press SPACE to play again';

    const continueText = this.add.text(
      GAME_WIDTH / 2,
      GAME_HEIGHT / 2 + 130,
      continueLabel,
      {
        fontFamily: 'Arial',
        fontSize: '24px',
        color: '#FFFFFF',
        stroke: '#000000',
        strokeThickness: 3
      }
    ).setOrigin(0.5).setAlpha(0);

    this.tweens.add({
      targets: [completeText, scoreText, highScoreText, continueText],
      alpha: 1,
      duration: 500,
      delay: 300
    });

    // Update UI with new high score
    this.events.emit('updateHighScore', highScore);

    // Hide touch controls during level-complete overlay
    if (this.touchControls) {
      this.touchControls.destroy();
      this.touchControls = null;
    }

    const restart = () => {
      this.scene.stop('UIScene');
      this.scene.restart();
    };

    // Wait for space or tap to restart
    this.input.keyboard.once('keydown-SPACE', restart);
    this.time.delayedCall(800, () => {
      this.input.once('pointerdown', restart);
    });
  }

  update() {
    if (this.touchControls) {
      this.touchControls.update();
    }
    if (this.player) {
      this.player.update();
    }
  }
}
