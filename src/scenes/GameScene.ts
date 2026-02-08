import Phaser from 'phaser';
import { GAME_WIDTH, GAME_HEIGHT, LEVELS } from '../config/gameConfig.ts';
import type { LevelData } from '../config/gameConfig.ts';
import { Player } from '../sprites/Player.ts';
import { Coin } from '../sprites/Coin.ts';
import { Enemy } from '../sprites/Enemy.ts';
import { StorageService } from '../services/StorageService.ts';
import { AudioManager } from '../services/AudioManager.ts';

const RESPAWN_DELAY = 1500;
const PIT_DEATH_Y = 800;
const MAX_LIVES = 3;

export class GameScene extends Phaser.Scene {
  private score = 0;
  private levelIndex = 0;
  private totalCoins = 0;
  private collectedCoins = 0;
  private lives = MAX_LIVES;
  private player!: Player;
  private platforms!: Phaser.Physics.Arcade.StaticGroup;
  private coins!: Phaser.Physics.Arcade.Group;
  private enemies!: Phaser.Physics.Arcade.Group;
  private spikes!: Phaser.Physics.Arcade.StaticGroup;
  private levelData!: LevelData;
  private isRespawning = false;

  constructor() {
    super({ key: 'GameScene' });
  }

  init(data: { levelIndex?: number; score?: number; lives?: number }) {
    this.levelIndex = data.levelIndex ?? 0;
    this.score = data.score ?? 0;
    this.lives = data.lives ?? MAX_LIVES;
    this.collectedCoins = 0;
    this.isRespawning = false;
  }

  create() {
    this.levelData = LEVELS[this.levelIndex];

    // Set world bounds for scrolling
    this.physics.world.setBounds(0, 0, this.levelData.worldWidth, GAME_HEIGHT + 200);
    this.cameras.main.setBounds(0, 0, this.levelData.worldWidth, GAME_HEIGHT);

    this.createBackground();

    this.platforms = this.physics.add.staticGroup();
    this.createPlatforms();

    this.player = new Player(this, this.levelData.startX, this.levelData.startY);

    this.coins = this.physics.add.group();
    this.createCoins();

    this.enemies = this.physics.add.group();
    this.createEnemies();

    this.spikes = this.physics.add.staticGroup();
    this.createSpikes();

    // Collisions
    this.physics.add.collider(this.player, this.platforms);
    this.physics.add.collider(this.enemies, this.platforms);
    this.physics.add.overlap(
      this.player,
      this.coins,
      this.handleCoinCollect as Phaser.Types.Physics.Arcade.ArcadePhysicsCallback,
      undefined,
      this
    );
    this.physics.add.overlap(
      this.player,
      this.enemies,
      this.handleEnemyCollision as Phaser.Types.Physics.Arcade.ArcadePhysicsCallback,
      undefined,
      this
    );
    this.physics.add.overlap(
      this.player,
      this.spikes,
      this.handleSpikeDeath as Phaser.Types.Physics.Arcade.ArcadePhysicsCallback,
      undefined,
      this
    );

    // Camera follow
    this.cameras.main.startFollow(this.player, true, 0.1, 0.1);
    this.cameras.main.setDeadzone(100, 50);

    this.scene.launch('UIScene', { gameScene: this });
    this.cameras.main.fadeIn(500);

    AudioManager.startBgm('gameplay');
    AudioManager.resetCoinCombo();

    this.events.emit('updateScore', this.score);
    this.events.emit('updateLevel', this.levelIndex + 1);
    this.events.emit('updateHighScore', StorageService.getHighScore());
    this.events.emit('updateLives', this.lives);
  }

  private createBackground() {
    // Background layers that tile across the world
    const bg = this.add.graphics();
    bg.fillGradientStyle(0x87ceeb, 0x87ceeb, 0xb3e5fc, 0xb3e5fc, 1);
    bg.fillRect(0, 0, this.levelData.worldWidth, GAME_HEIGHT);

    this.createClouds();
    this.createHills();
  }

  private createClouds() {
    const cloudCount = Math.ceil(this.levelData.worldWidth / 300);
    for (let i = 0; i < cloudCount; i++) {
      const x = 100 + i * 300 + Phaser.Math.Between(-50, 50);
      const y = Phaser.Math.Between(40, 140);
      const scale = 0.7 + Math.random() * 0.6;

      const g = this.add.graphics();
      g.fillStyle(0xffffff, 0.8);
      g.fillCircle(0, 0, 30 * scale);
      g.fillCircle(25 * scale, -10 * scale, 25 * scale);
      g.fillCircle(50 * scale, 0, 30 * scale);
      g.fillCircle(25 * scale, 10 * scale, 20 * scale);
      g.setPosition(x, y);

      this.tweens.add({
        targets: g,
        x: g.x + 30,
        duration: 4000 + Math.random() * 2000,
        ease: 'Sine.easeInOut',
        yoyo: true,
        repeat: -1,
      });
    }
  }

  private createHills() {
    const hillGraphics = this.add.graphics();
    const hillCount = Math.ceil(this.levelData.worldWidth / 250);

    hillGraphics.fillStyle(0x81c784, 0.5);
    for (let i = 0; i < hillCount; i++) {
      const x = i * 250 + Phaser.Math.Between(-30, 30);
      const h = Phaser.Math.Between(60, 130);
      const w = Phaser.Math.Between(200, 400);
      this.drawHill(hillGraphics, x, GAME_HEIGHT - h, w, h);
    }

    hillGraphics.fillStyle(0x66bb6a, 0.6);
    for (let i = 0; i < hillCount; i++) {
      const x = i * 250 + 100 + Phaser.Math.Between(-30, 30);
      const h = Phaser.Math.Between(40, 80);
      const w = Phaser.Math.Between(150, 300);
      this.drawHill(hillGraphics, x, GAME_HEIGHT - h, w, h);
    }
  }

  private drawHill(
    graphics: Phaser.GameObjects.Graphics,
    x: number,
    y: number,
    width: number,
    height: number
  ) {
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
    this.levelData.platforms.forEach((platform) => {
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
    this.totalCoins = this.levelData.coins.length;

    this.levelData.coins.forEach((coinPos) => {
      const coin = new Coin(this, coinPos.x, coinPos.y);
      this.coins.add(coin);
    });
  }

  private createEnemies() {
    this.levelData.enemies.forEach((enemyData) => {
      const enemy = new Enemy(
        this,
        enemyData.x,
        enemyData.y,
        enemyData.type,
        enemyData.patrolWidth
      );
      this.enemies.add(enemy);
    });
  }

  private createSpikes() {
    this.levelData.spikes.forEach((spikeData) => {
      const tilesX = Math.ceil(spikeData.width / 64);
      const startX = spikeData.x - spikeData.width / 2;

      for (let i = 0; i < tilesX; i++) {
        const spike = this.spikes.create(
          startX + i * 64 + 32,
          spikeData.y,
          'spike'
        ) as Phaser.Physics.Arcade.Sprite;
        spike.setDisplaySize(64, 32);
        spike.refreshBody();
      }
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

  private handleEnemyCollision(
    playerObj: Phaser.Types.Physics.Arcade.GameObjectWithBody,
    enemyObj: Phaser.Types.Physics.Arcade.GameObjectWithBody
  ) {
    const player = playerObj as Player;
    const enemy = enemyObj as Enemy;

    if (player.getIsDead() || enemy.getIsDead()) return;

    // Check if player is falling onto enemy (stomp)
    const playerBody = player.body as Phaser.Physics.Arcade.Body;
    if (playerBody.velocity.y > 0 && player.y < enemy.y - 10) {
      const points = enemy.stomp();
      this.score += points;
      this.events.emit('updateScore', this.score);
      player.stompEnemy();
      this.showFloatingScore(enemy.x, enemy.y, points);
    } else {
      this.playerDeath();
    }
  }

  private handleSpikeDeath(
    _playerObj: Phaser.Types.Physics.Arcade.GameObjectWithBody,
    _spikeObj: Phaser.Types.Physics.Arcade.GameObjectWithBody
  ) {
    if (this.player.getIsDead()) return;
    AudioManager.playSfx('spike');
    this.playerDeath();
  }

  private playerDeath() {
    if (this.isRespawning) return;
    this.isRespawning = true;
    this.lives--;
    this.events.emit('updateLives', this.lives);
    this.player.die();

    if (this.lives <= 0) {
      this.time.delayedCall(RESPAWN_DELAY, () => {
        this.gameOver();
      });
    } else {
      this.time.delayedCall(RESPAWN_DELAY, () => {
        this.respawn();
      });
    }
  }

  private respawn() {
    this.scene.stop('UIScene');
    this.scene.restart({
      levelIndex: this.levelIndex,
      score: this.score,
      lives: this.lives,
    });
  }

  private gameOver() {
    AudioManager.stopBgm();
    AudioManager.playSfx('gameOver');
    const isNewHighScore = StorageService.setHighScore(this.score);
    const highScore = StorageService.getHighScore();

    const cam = this.cameras.main;
    const centerX = cam.scrollX + GAME_WIDTH / 2;
    const centerY = cam.scrollY + GAME_HEIGHT / 2;

    const overlay = this.add.rectangle(centerX, centerY, GAME_WIDTH, GAME_HEIGHT, 0x000000, 0);
    overlay.setScrollFactor(0);
    overlay.setPosition(GAME_WIDTH / 2, GAME_HEIGHT / 2);

    this.tweens.add({ targets: overlay, alpha: 0.7, duration: 500 });

    const gameOverText = this.add
      .text(GAME_WIDTH / 2, GAME_HEIGHT / 2 - 80, 'GAME OVER', {
        fontFamily: 'Arial Black, Arial',
        fontSize: '64px',
        color: '#FF1744',
        stroke: '#000000',
        strokeThickness: 8,
      })
      .setOrigin(0.5)
      .setScrollFactor(0)
      .setAlpha(0);

    const scoreText = this.add
      .text(GAME_WIDTH / 2, GAME_HEIGHT / 2, `Score: ${this.score}`, {
        fontFamily: 'Arial',
        fontSize: '36px',
        color: '#FFFFFF',
        stroke: '#000000',
        strokeThickness: 4,
      })
      .setOrigin(0.5)
      .setScrollFactor(0)
      .setAlpha(0);

    const texts: Phaser.GameObjects.Text[] = [gameOverText, scoreText];

    if (isNewHighScore) {
      const newHighText = this.add
        .text(GAME_WIDTH / 2, GAME_HEIGHT / 2 + 40, 'NEW HIGH SCORE!', {
          fontFamily: 'Arial Black, Arial',
          fontSize: '32px',
          color: '#00FF00',
          stroke: '#000000',
          strokeThickness: 4,
        })
        .setOrigin(0.5)
        .setScrollFactor(0)
        .setAlpha(0);
      texts.push(newHighText);
    }

    const highScoreText = this.add
      .text(GAME_WIDTH / 2, GAME_HEIGHT / 2 + 80, `High Score: ${highScore}`, {
        fontFamily: 'Arial',
        fontSize: '24px',
        color: '#FFD700',
        stroke: '#000000',
        strokeThickness: 3,
      })
      .setOrigin(0.5)
      .setScrollFactor(0)
      .setAlpha(0);
    texts.push(highScoreText);

    const continueText = this.add
      .text(GAME_WIDTH / 2, GAME_HEIGHT / 2 + 130, 'Press SPACE to try again', {
        fontFamily: 'Arial',
        fontSize: '24px',
        color: '#FFFFFF',
        stroke: '#000000',
        strokeThickness: 3,
      })
      .setOrigin(0.5)
      .setScrollFactor(0)
      .setAlpha(0);
    texts.push(continueText);

    this.tweens.add({
      targets: texts,
      alpha: 1,
      duration: 500,
      delay: 300,
    });

    this.events.emit('updateHighScore', highScore);

    this.input.keyboard!.once('keydown-SPACE', () => {
      this.scene.stop('UIScene');
      this.scene.restart({ levelIndex: 0, score: 0, lives: MAX_LIVES });
    });
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
    AudioManager.stopBgm();
    AudioManager.playSfx('levelComplete');
    const nextLevelIndex = this.levelIndex + 1;
    const hasNextLevel = nextLevelIndex < LEVELS.length;

    const isNewHighScore = StorageService.setHighScore(this.score);
    const highScore = StorageService.getHighScore();

    const overlay = this.add
      .rectangle(GAME_WIDTH / 2, GAME_HEIGHT / 2, GAME_WIDTH, GAME_HEIGHT, 0x000000, 0)
      .setScrollFactor(0);

    this.tweens.add({ targets: overlay, alpha: 0.5, duration: 500 });

    const titleMessage = hasNextLevel ? 'LEVEL COMPLETE!' : 'YOU WIN!';
    const completeText = this.add
      .text(GAME_WIDTH / 2, GAME_HEIGHT / 2 - 80, titleMessage, {
        fontFamily: 'Arial Black, Arial',
        fontSize: '64px',
        color: '#FFEB3B',
        stroke: '#FF9800',
        strokeThickness: 8,
      })
      .setOrigin(0.5)
      .setScrollFactor(0)
      .setAlpha(0);

    const texts: Phaser.GameObjects.Text[] = [completeText];

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
        .setScrollFactor(0)
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
      .setScrollFactor(0)
      .setAlpha(0);
    texts.push(scoreText);

    const highScoreText = this.add
      .text(GAME_WIDTH / 2, GAME_HEIGHT / 2 + 75, `High Score: ${highScore}`, {
        fontFamily: 'Arial',
        fontSize: '24px',
        color: '#FFD700',
        stroke: '#000000',
        strokeThickness: 3,
      })
      .setOrigin(0.5)
      .setScrollFactor(0)
      .setAlpha(0);
    texts.push(highScoreText);

    const continueMessage = hasNextLevel
      ? 'Press SPACE for next level'
      : 'Press SPACE to play again';
    const continueText = this.add
      .text(GAME_WIDTH / 2, GAME_HEIGHT / 2 + 130, continueMessage, {
        fontFamily: 'Arial',
        fontSize: '24px',
        color: '#FFFFFF',
        stroke: '#000000',
        strokeThickness: 3,
      })
      .setOrigin(0.5)
      .setScrollFactor(0)
      .setAlpha(0);
    texts.push(continueText);

    this.tweens.add({
      targets: texts,
      alpha: 1,
      duration: 500,
      delay: 300,
    });

    this.events.emit('updateHighScore', highScore);

    this.input.keyboard!.once('keydown-SPACE', () => {
      this.scene.stop('UIScene');
      if (hasNextLevel) {
        this.scene.restart({
          levelIndex: nextLevelIndex,
          score: this.score,
          lives: this.lives,
        });
      } else {
        this.scene.restart({ levelIndex: 0, score: 0, lives: MAX_LIVES });
      }
    });
  }

  update(time: number, delta: number) {
    if (this.player && !this.player.getIsDead()) {
      this.player.update(time, delta);

      // Pit death
      if (this.player.y > PIT_DEATH_Y) {
        this.playerDeath();
      }
    }

    // Update enemies
    this.enemies.getChildren().forEach((child) => {
      const enemy = child as Enemy;
      enemy.update(time, delta);
    });
  }
}
