import Phaser from 'phaser';
import {
  GAME_WIDTH,
  GAME_HEIGHT,
  PLAYER,
  LEVEL_1_PLATFORMS,
  LEVEL_1_COINS,
} from '../config/gameConfig.ts';
import { Player } from '../sprites/Player.ts';
import { Coin } from '../sprites/Coin.ts';
import { StorageService } from '../services/StorageService.ts';

export class GameScene extends Phaser.Scene {
  private score = 0;
  private level = 1;
  private totalCoins = 0;
  private collectedCoins = 0;
  private player!: Player;
  private platforms!: Phaser.Physics.Arcade.StaticGroup;
  private coins!: Phaser.Physics.Arcade.Group;

  constructor() {
    super({ key: 'GameScene' });
  }

  create() {
    this.score = 0;
    this.collectedCoins = 0;

    this.createBackground();

    this.platforms = this.physics.add.staticGroup();
    this.createPlatforms();

    this.player = new Player(this, PLAYER.START_X, PLAYER.START_Y);

    this.coins = this.physics.add.group();
    this.createCoins();

    this.physics.add.collider(this.player, this.platforms);
    this.physics.add.overlap(
      this.player,
      this.coins,
      this.handleCoinCollect as Phaser.Types.Physics.Arcade.ArcadePhysicsCallback,
      undefined,
      this
    );

    this.scene.launch('UIScene', { gameScene: this });
    this.cameras.main.fadeIn(500);

    this.events.emit('updateScore', this.score);
    this.events.emit('updateLevel', this.level);
    this.events.emit('updateHighScore', StorageService.getHighScore());
  }

  private createBackground() {
    const bg = this.add.graphics();
    bg.fillGradientStyle(0x87ceeb, 0x87ceeb, 0xb3e5fc, 0xb3e5fc, 1);
    bg.fillRect(0, 0, GAME_WIDTH, GAME_HEIGHT);

    this.createClouds();
    this.createHills();
  }

  private createClouds() {
    const cloudPositions = [
      { x: 100, y: 80, scale: 1 },
      { x: 400, y: 120, scale: 0.8 },
      { x: 700, y: 60, scale: 1.2 },
      { x: 1000, y: 100, scale: 0.9 },
      { x: 1200, y: 70, scale: 1.1 },
    ];

    cloudPositions.forEach((cloud) => {
      const g = this.add.graphics();
      g.fillStyle(0xffffff, 0.8);
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
        repeat: -1,
      });
    });
  }

  private createHills() {
    const hillGraphics = this.add.graphics();

    hillGraphics.fillStyle(0x81c784, 0.5);
    this.drawHill(hillGraphics, 0, GAME_HEIGHT - 100, 300, 100);
    this.drawHill(hillGraphics, 250, GAME_HEIGHT - 80, 250, 80);
    this.drawHill(hillGraphics, 600, GAME_HEIGHT - 120, 350, 120);
    this.drawHill(hillGraphics, 950, GAME_HEIGHT - 90, 400, 90);

    hillGraphics.fillStyle(0x66bb6a, 0.6);
    this.drawHill(hillGraphics, -50, GAME_HEIGHT - 60, 200, 60);
    this.drawHill(hillGraphics, 400, GAME_HEIGHT - 70, 280, 70);
    this.drawHill(hillGraphics, 800, GAME_HEIGHT - 50, 220, 50);
    this.drawHill(hillGraphics, 1100, GAME_HEIGHT - 80, 300, 80);
  }

  private drawHill(
    graphics: Phaser.GameObjects.Graphics,
    x: number,
    y: number,
    width: number,
    height: number
  ) {
    // Approximate quadratic curve with an ellipse-based hill shape
    const steps = 20;
    graphics.beginPath();
    graphics.moveTo(x, y);
    for (let i = 0; i <= steps; i++) {
      const t = i / steps;
      const px = x + t * width;
      const py = y - Math.sin(t * Math.PI) * height;
      graphics.lineTo(px, py);
    }
    graphics.lineTo(x + width, y);
    graphics.closePath();
    graphics.fillPath();
  }

  private createPlatforms() {
    LEVEL_1_PLATFORMS.forEach((platform) => {
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
        ) as Phaser.Physics.Arcade.Sprite;
        tile.setDisplaySize(tileWidth, tileHeight);
        tile.refreshBody();
      }
    });
  }

  private createCoins() {
    this.totalCoins = LEVEL_1_COINS.length;

    LEVEL_1_COINS.forEach((coinPos) => {
      const coin = new Coin(this, coinPos.x, coinPos.y);
      this.coins.add(coin);
    });
  }

  private handleCoinCollect(
    playerObj: Phaser.Types.Physics.Arcade.GameObjectWithBody,
    coinObj: Phaser.Types.Physics.Arcade.GameObjectWithBody
  ) {
    const player = playerObj as Player;
    const coin = coinObj as Coin;
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

  private showFloatingScore(x: number, y: number, points: number) {
    const scoreText = this.add
      .text(x, y, `+${points}`, {
        fontFamily: 'Arial Black, Arial',
        fontSize: '24px',
        color: '#FFEB3B',
        stroke: '#000000',
        strokeThickness: 4,
      })
      .setOrigin(0.5);

    this.tweens.add({
      targets: scoreText,
      y: y - 60,
      alpha: 0,
      duration: 800,
      ease: 'Power2',
      onComplete: () => scoreText.destroy(),
    });
  }

  private levelComplete() {
    const isNewHighScore = StorageService.setHighScore(this.score);
    const highScore = StorageService.getHighScore();

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
      duration: 500,
    });

    const completeText = this.add
      .text(GAME_WIDTH / 2, GAME_HEIGHT / 2 - 80, 'LEVEL COMPLETE!', {
        fontFamily: 'Arial Black, Arial',
        fontSize: '64px',
        color: '#FFEB3B',
        stroke: '#FF9800',
        strokeThickness: 8,
      })
      .setOrigin(0.5)
      .setAlpha(0);

    if (isNewHighScore) {
      const newHighText = this.add
        .text(GAME_WIDTH / 2, GAME_HEIGHT / 2 - 20, 'NEW HIGH SCORE!', {
          fontFamily: 'Arial Black, Arial',
          fontSize: '32px',
          color: '#00FF00',
          stroke: '#000000',
          strokeThickness: 4,
        })
        .setOrigin(0.5)
        .setAlpha(0);

      this.tweens.add({
        targets: newHighText,
        alpha: 1,
        scaleX: 1.2,
        scaleY: 1.2,
        duration: 300,
        delay: 500,
        yoyo: true,
        repeat: 2,
      });
    }

    const scoreText = this.add
      .text(GAME_WIDTH / 2, GAME_HEIGHT / 2 + 30, `Score: ${this.score}`, {
        fontFamily: 'Arial',
        fontSize: '36px',
        color: '#FFFFFF',
        stroke: '#000000',
        strokeThickness: 4,
      })
      .setOrigin(0.5)
      .setAlpha(0);

    const highScoreText = this.add
      .text(GAME_WIDTH / 2, GAME_HEIGHT / 2 + 75, `High Score: ${highScore}`, {
        fontFamily: 'Arial',
        fontSize: '24px',
        color: '#FFD700',
        stroke: '#000000',
        strokeThickness: 3,
      })
      .setOrigin(0.5)
      .setAlpha(0);

    const continueText = this.add
      .text(GAME_WIDTH / 2, GAME_HEIGHT / 2 + 130, 'Press SPACE to play again', {
        fontFamily: 'Arial',
        fontSize: '24px',
        color: '#FFFFFF',
        stroke: '#000000',
        strokeThickness: 3,
      })
      .setOrigin(0.5)
      .setAlpha(0);

    this.tweens.add({
      targets: [completeText, scoreText, highScoreText, continueText],
      alpha: 1,
      duration: 500,
      delay: 300,
    });

    this.events.emit('updateHighScore', highScore);

    this.input.keyboard!.once('keydown-SPACE', () => {
      this.scene.stop('UIScene');
      this.scene.restart();
    });
  }

  update(time: number, delta: number) {
    if (this.player) {
      this.player.update(time, delta);
    }
  }
}
