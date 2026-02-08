import Phaser from 'phaser';
import { GAME_WIDTH, GAME_HEIGHT, WORLDS } from '../config/gameConfig.ts';
import type { LevelData, WorldTheme, WindZoneData } from '../config/gameConfig.ts';
import { Player } from '../sprites/Player.ts';
import { Coin } from '../sprites/Coin.ts';
import { Enemy } from '../sprites/Enemy.ts';
import { StorageService } from '../services/StorageService.ts';
import { AudioManager } from '../services/AudioManager.ts';

const RESPAWN_DELAY = 1500;
const PIT_DEATH_Y = 800;
const MAX_LIVES = 3;
const CRUMBLE_DELAY = 500;
const CRUMBLE_FALL_DELAY = 300;

export interface GameSceneData {
  worldIndex?: number;
  levelIndex?: number;
  score?: number;
  lives?: number;
}

export class GameScene extends Phaser.Scene {
  private score = 0;
  private worldIndex = 0;
  private levelIndex = 0;
  private totalCoins = 0;
  private collectedCoins = 0;
  private lives = MAX_LIVES;
  private elapsedTime = 0;
  private levelActive = false;
  private player!: Player;
  private platforms!: Phaser.Physics.Arcade.StaticGroup;
  private coins!: Phaser.Physics.Arcade.Group;
  private enemies!: Phaser.Physics.Arcade.Group;
  private spikes!: Phaser.Physics.Arcade.StaticGroup;
  private levelData!: LevelData;
  private theme!: WorldTheme;
  private isRespawning = false;
  private crumblingSet = new Set<Phaser.Physics.Arcade.Sprite>();
  private windZones: WindZoneData[] = [];

  constructor() {
    super({ key: 'GameScene' });
  }

  init(data: GameSceneData) {
    this.worldIndex = data.worldIndex ?? 0;
    this.levelIndex = data.levelIndex ?? 0;
    this.score = data.score ?? 0;
    this.lives = data.lives ?? MAX_LIVES;
    this.collectedCoins = 0;
    this.elapsedTime = 0;
    this.levelActive = true;
    this.isRespawning = false;
    this.crumblingSet.clear();
  }

  create() {
    const world = WORLDS[this.worldIndex];
    this.theme = world.theme;
    this.levelData = world.levels[this.levelIndex];
    this.windZones = this.levelData.windZones ?? [];

    this.physics.world.setBounds(0, 0, this.levelData.worldWidth, GAME_HEIGHT + 200);
    this.cameras.main.setBounds(0, 0, this.levelData.worldWidth, GAME_HEIGHT);

    this.createBackground();

    this.platforms = this.physics.add.staticGroup();
    this.createPlatforms();

    this.player = new Player(this, this.levelData.startX, this.levelData.startY);
    this.player.setSurfaceFriction(this.theme.friction);

    this.coins = this.physics.add.group();
    this.createCoins();

    this.enemies = this.physics.add.group();
    this.createEnemies();

    this.spikes = this.physics.add.staticGroup();
    this.createSpikes();

    this.createWindVisuals();

    // Collisions
    this.physics.add.collider(
      this.player,
      this.platforms,
      this.handlePlatformCollision as Phaser.Types.Physics.Arcade.ArcadePhysicsCallback,
      undefined,
      this
    );
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

    this.cameras.main.startFollow(this.player, true, 0.1, 0.1);
    this.cameras.main.setDeadzone(100, 50);

    this.scene.launch('UIScene', { gameScene: this });
    this.cameras.main.fadeIn(500);

    AudioManager.startBgm('gameplay');
    AudioManager.resetCoinCombo();

    this.events.emit('updateScore', this.score);
    this.events.emit('updateLevel', `${this.theme.name} ${this.levelIndex + 1}`);
    this.events.emit('updateHighScore', StorageService.getHighScore());
    this.events.emit('updateLives', this.lives);
    this.events.emit('updateTimer', 0);
  }

  // ─── Background ───

  private createBackground() {
    const bg = this.add.graphics();
    bg.fillGradientStyle(
      this.theme.skyGradientTop,
      this.theme.skyGradientTop,
      this.theme.skyGradientBottom,
      this.theme.skyGradientBottom,
      1
    );
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
      g.fillStyle(0xffffff, this.theme.id === 'ice' ? 0.4 : 0.8);
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

    hillGraphics.fillStyle(this.theme.hillColorA, 0.5);
    for (let i = 0; i < hillCount; i++) {
      const x = i * 250 + Phaser.Math.Between(-30, 30);
      const h = Phaser.Math.Between(60, 130);
      const w = Phaser.Math.Between(200, 400);
      this.drawHill(hillGraphics, x, GAME_HEIGHT - h, w, h);
    }

    hillGraphics.fillStyle(this.theme.hillColorB, 0.6);
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

  // ─── Level objects ───

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

        if (platform.crumbling) {
          tile.setData('crumbling', true);
          tile.setTint(0xddccbb);
        }
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

  private createWindVisuals() {
    this.windZones.forEach((wz) => {
      // Translucent overlay showing wind direction
      const g = this.add.graphics();
      g.fillStyle(0xffffff, 0.05);
      g.fillRect(wz.x, wz.y, wz.width, wz.height);

      // Animated wind streaks
      for (let i = 0; i < 5; i++) {
        const streak = this.add.rectangle(
          wz.x + Math.random() * wz.width,
          wz.y + Math.random() * wz.height,
          Phaser.Math.Between(30, 60),
          2,
          0xffffff,
          0.3
        );
        this.tweens.add({
          targets: streak,
          x: wz.forceX > 0 ? wz.x + wz.width + 30 : wz.x - 30,
          y: streak.y + (wz.forceY < 0 ? -50 : 20),
          alpha: 0,
          duration: Phaser.Math.Between(1000, 2000),
          repeat: -1,
          onRepeat: () => {
            streak.x = wz.x + Math.random() * wz.width;
            streak.y = wz.y + Math.random() * wz.height;
            streak.alpha = 0.3;
          },
        });
      }
    });
  }

  // ─── Collisions ───

  private handlePlatformCollision(
    _playerObj: Phaser.Types.Physics.Arcade.GameObjectWithBody | Phaser.Tilemaps.Tile,
    platformObj: Phaser.Types.Physics.Arcade.GameObjectWithBody | Phaser.Tilemaps.Tile
  ) {
    const tile = platformObj as Phaser.Physics.Arcade.Sprite;
    if (tile.getData('crumbling') && !this.crumblingSet.has(tile)) {
      this.crumblingSet.add(tile);
      // Shake the tile
      this.tweens.add({
        targets: tile,
        x: tile.x + 2,
        duration: 50,
        yoyo: true,
        repeat: 4,
      });
      // Then fall
      this.time.delayedCall(CRUMBLE_DELAY, () => {
        const body = tile.body as Phaser.Physics.Arcade.StaticBody;
        body.enable = false;
        this.tweens.add({
          targets: tile,
          y: tile.y + 400,
          alpha: 0,
          duration: CRUMBLE_FALL_DELAY,
          onComplete: () => tile.destroy(),
        });
      });
    }
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

  // ─── Death & respawn ───

  private playerDeath() {
    if (this.isRespawning) return;
    this.isRespawning = true;
    this.levelActive = false;
    this.lives--;
    this.events.emit('updateLives', this.lives);
    this.player.die();

    if (this.lives <= 0) {
      this.time.delayedCall(RESPAWN_DELAY, () => this.gameOver());
    } else {
      this.time.delayedCall(RESPAWN_DELAY, () => this.respawn());
    }
  }

  private respawn() {
    this.scene.stop('UIScene');
    this.scene.restart({
      worldIndex: this.worldIndex,
      levelIndex: this.levelIndex,
      score: this.score,
      lives: this.lives,
    });
  }

  private gameOver() {
    AudioManager.stopBgm();
    AudioManager.playSfx('gameOver');
    StorageService.setHighScore(this.score);
    const highScore = StorageService.getHighScore();

    const overlay = this.add.rectangle(
      GAME_WIDTH / 2,
      GAME_HEIGHT / 2,
      GAME_WIDTH,
      GAME_HEIGHT,
      0x000000,
      0
    );
    overlay.setScrollFactor(0);
    this.tweens.add({ targets: overlay, alpha: 0.7, duration: 500 });

    const texts: Phaser.GameObjects.Text[] = [];

    texts.push(
      this.add
        .text(GAME_WIDTH / 2, GAME_HEIGHT / 2 - 60, 'GAME OVER', {
          fontFamily: 'Arial Black, Arial',
          fontSize: '64px',
          color: '#FF1744',
          stroke: '#000000',
          strokeThickness: 8,
        })
        .setOrigin(0.5)
        .setScrollFactor(0)
        .setAlpha(0)
    );

    texts.push(
      this.add
        .text(GAME_WIDTH / 2, GAME_HEIGHT / 2 + 20, `Score: ${this.score}  |  Best: ${highScore}`, {
          fontFamily: 'Arial',
          fontSize: '28px',
          color: '#FFD700',
          stroke: '#000000',
          strokeThickness: 4,
        })
        .setOrigin(0.5)
        .setScrollFactor(0)
        .setAlpha(0)
    );

    texts.push(
      this.add
        .text(GAME_WIDTH / 2, GAME_HEIGHT / 2 + 80, 'SPACE = retry  |  ESC = level select', {
          fontFamily: 'Arial',
          fontSize: '22px',
          color: '#FFFFFF',
          stroke: '#000000',
          strokeThickness: 3,
        })
        .setOrigin(0.5)
        .setScrollFactor(0)
        .setAlpha(0)
    );

    this.tweens.add({ targets: texts, alpha: 1, duration: 500, delay: 300 });

    this.input.keyboard!.once('keydown-SPACE', () => {
      this.scene.stop('UIScene');
      this.scene.restart({
        worldIndex: this.worldIndex,
        levelIndex: this.levelIndex,
        score: 0,
        lives: MAX_LIVES,
      });
    });
    this.input.keyboard!.once('keydown-ESC', () => {
      this.scene.stop('UIScene');
      this.scene.start('LevelSelectScene');
    });
  }

  // ─── Level complete & stars ───

  private levelComplete() {
    AudioManager.stopBgm();
    AudioManager.playSfx('levelComplete');
    this.levelActive = false;

    StorageService.setHighScore(this.score);

    // Star calculation
    const gotAllCoins = this.collectedCoins >= this.totalCoins;
    const underPar = this.elapsedTime <= this.levelData.parTime;
    let stars = 1; // completed
    if (gotAllCoins) stars = 2;
    if (gotAllCoins && underPar) stars = 3;

    StorageService.setLevelStars(this.worldIndex, this.levelIndex, stars);

    // Unlock next level
    const isLastInWorld = this.levelIndex >= WORLDS[this.worldIndex].levels.length - 1;
    const isLastWorld = this.worldIndex >= WORLDS.length - 1;

    if (!isLastInWorld) {
      // Next level in same world
      const flatIndex = this.getFlatLevelIndex(this.worldIndex, this.levelIndex + 1);
      StorageService.unlockLevel(flatIndex + 1);
    } else if (!isLastWorld) {
      // First level of next world
      const flatIndex = this.getFlatLevelIndex(this.worldIndex + 1, 0);
      StorageService.unlockLevel(flatIndex + 1);
    }

    // Display
    const overlay = this.add
      .rectangle(GAME_WIDTH / 2, GAME_HEIGHT / 2, GAME_WIDTH, GAME_HEIGHT, 0x000000, 0)
      .setScrollFactor(0);
    this.tweens.add({ targets: overlay, alpha: 0.5, duration: 500 });

    const texts: Phaser.GameObjects.Text[] = [];

    const hasNext = !isLastInWorld || !isLastWorld;
    const title = hasNext ? 'LEVEL COMPLETE!' : 'YOU WIN!';
    texts.push(
      this.add
        .text(GAME_WIDTH / 2, GAME_HEIGHT / 2 - 90, title, {
          fontFamily: 'Arial Black, Arial',
          fontSize: '56px',
          color: '#FFEB3B',
          stroke: '#FF9800',
          strokeThickness: 8,
        })
        .setOrigin(0.5)
        .setScrollFactor(0)
        .setAlpha(0)
    );

    // Star display
    const starStr = '\u2605'.repeat(stars) + '\u2606'.repeat(3 - stars);
    texts.push(
      this.add
        .text(GAME_WIDTH / 2, GAME_HEIGHT / 2 - 30, starStr, {
          fontFamily: 'Arial',
          fontSize: '48px',
          color: '#FFD700',
        })
        .setOrigin(0.5)
        .setScrollFactor(0)
        .setAlpha(0)
    );

    const timeStr = `Time: ${Math.floor(this.elapsedTime)}s  (Par: ${this.levelData.parTime}s)`;
    texts.push(
      this.add
        .text(GAME_WIDTH / 2, GAME_HEIGHT / 2 + 20, timeStr, {
          fontFamily: 'Arial',
          fontSize: '24px',
          color: underPar ? '#00FF00' : '#FFFFFF',
          stroke: '#000000',
          strokeThickness: 3,
        })
        .setOrigin(0.5)
        .setScrollFactor(0)
        .setAlpha(0)
    );

    texts.push(
      this.add
        .text(GAME_WIDTH / 2, GAME_HEIGHT / 2 + 55, `Score: ${this.score}`, {
          fontFamily: 'Arial',
          fontSize: '28px',
          color: '#FFFFFF',
          stroke: '#000000',
          strokeThickness: 4,
        })
        .setOrigin(0.5)
        .setScrollFactor(0)
        .setAlpha(0)
    );

    const nextMsg = hasNext ? 'SPACE = next level  |  ESC = level select' : 'SPACE = play again';
    texts.push(
      this.add
        .text(GAME_WIDTH / 2, GAME_HEIGHT / 2 + 110, nextMsg, {
          fontFamily: 'Arial',
          fontSize: '22px',
          color: '#FFFFFF',
          stroke: '#000000',
          strokeThickness: 3,
        })
        .setOrigin(0.5)
        .setScrollFactor(0)
        .setAlpha(0)
    );

    this.tweens.add({ targets: texts, alpha: 1, duration: 500, delay: 300 });

    this.input.keyboard!.once('keydown-SPACE', () => {
      this.scene.stop('UIScene');
      if (hasNext) {
        let nextWorld = this.worldIndex;
        let nextLevel = this.levelIndex + 1;
        if (nextLevel >= WORLDS[nextWorld].levels.length) {
          nextWorld++;
          nextLevel = 0;
        }
        this.scene.restart({
          worldIndex: nextWorld,
          levelIndex: nextLevel,
          score: this.score,
          lives: this.lives,
        });
      } else {
        this.scene.start('LevelSelectScene');
      }
    });
    this.input.keyboard!.once('keydown-ESC', () => {
      this.scene.stop('UIScene');
      this.scene.start('LevelSelectScene');
    });
  }

  private getFlatLevelIndex(worldIdx: number, levelIdx: number): number {
    let flat = 0;
    for (let w = 0; w < worldIdx; w++) {
      flat += WORLDS[w].levels.length;
    }
    return flat + levelIdx;
  }

  // ─── UI helpers ───

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

  // ─── Update loop ───

  update(time: number, delta: number) {
    if (this.player && !this.player.getIsDead()) {
      this.player.update(time, delta);

      // Wind zones
      this.windZones.forEach((wz) => {
        if (
          this.player.x >= wz.x &&
          this.player.x <= wz.x + wz.width &&
          this.player.y >= wz.y &&
          this.player.y <= wz.y + wz.height
        ) {
          const body = this.player.body as Phaser.Physics.Arcade.Body;
          body.setVelocityX(body.velocity.x + (wz.forceX * delta) / 1000);
          body.setVelocityY(body.velocity.y + (wz.forceY * delta) / 1000);
        }
      });

      if (this.player.y > PIT_DEATH_Y) {
        this.playerDeath();
      }
    }

    if (this.levelActive) {
      this.elapsedTime += delta / 1000;
      this.events.emit('updateTimer', Math.floor(this.elapsedTime));
    }

    this.enemies.getChildren().forEach((child) => {
      const enemy = child as Enemy;
      enemy.update(time, delta);
    });
  }
}
