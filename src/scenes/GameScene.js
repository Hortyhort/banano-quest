import Phaser from 'phaser';
import {
  GAME_WIDTH, GAME_HEIGHT, PLAYER, COIN, COMBO, ENEMY_STOMP_SCORE,
  LEVELS, WORLD_THEMES
} from '../config/gameConfig.js';
import { Player } from '../sprites/Player.js';
import { Coin } from '../sprites/Coin.js';
import { PatrolWalker, FlyingPest, Spike } from '../sprites/Enemy.js';
import { PowerUp } from '../sprites/PowerUp.js';
import { StorageService } from '../services/StorageService.js';
import { AudioManager } from '../services/AudioManager.js';
import { AchievementService } from '../services/AchievementService.js';

export class GameScene extends Phaser.Scene {
  constructor() {
    super({ key: 'GameScene' });
    this.score = 0;
    this.level = 0;
    this.totalCoins = 0;
    this.collectedCoins = 0;
    this.lives = 3;
    this.combo = 0;
    this.comboTimer = 0;
    this.levelTimer = 0;
    this.deaths = 0;
    this.audioManager = null;
    this.movingPlatforms = [];
    this.fallingPlatforms = [];
    this.gameActive = true;
  }

  init(data) {
    if (data && data.level !== undefined) this.level = data.level;
    if (data && data.lives !== undefined) this.lives = data.lives;
  }

  create() {
    this.score = 0;
    this.collectedCoins = 0;
    this.combo = 0;
    this.comboTimer = 0;
    this.levelTimer = 0;
    this.deaths = 0;
    this.stomps = 0;
    this.movingPlatforms = [];
    this.fallingPlatforms = [];
    this.gameActive = true;

    // Audio
    if (!this.audioManager) {
      this.audioManager = new AudioManager();
      this.audioManager.init();
    }
    this.audioManager.resume();

    const isMobile = !this.sys.game.device.os.desktop;
    const levelData = LEVELS[this.level] || LEVELS[0];
    const theme = WORLD_THEMES[levelData.world] || WORLD_THEMES.jungle;

    this.createBackground(theme);

    // Platforms
    this.platforms = this.physics.add.staticGroup();
    this.createPlatforms(levelData);

    // Player
    this.player = new Player(this, PLAYER.START_X, PLAYER.START_Y);

    // Coins
    this.coins = this.physics.add.group();
    this.createCoins(levelData);

    // Enemies
    this.enemies = this.physics.add.group();
    this.flyingEnemies = [];
    this.createEnemies(levelData);

    // Spikes
    this.spikeGroup = this.physics.add.group();
    this.createSpikes(levelData);

    // Power-ups
    this.powerUps = this.physics.add.group();
    this.createPowerUps(levelData);

    // Collisions
    this.physics.add.collider(this.player, this.platforms, this.handlePlatformCollision, null, this);
    this.physics.add.collider(this.enemies, this.platforms);
    this.physics.add.overlap(this.player, this.coins, this.handleCoinCollect, null, this);
    this.physics.add.overlap(this.player, this.enemies, this.handleEnemyCollision, null, this);
    this.physics.add.overlap(this.player, this.spikeGroup, this.handleSpikeCollision, null, this);
    this.physics.add.overlap(this.player, this.powerUps, this.handlePowerUpCollect, null, this);

    // Touch controls
    this.createTouchControls(isMobile);

    // UI scene
    this.scene.launch('UIScene', {
      gameScene: this,
      level: this.level,
      lives: this.lives,
      totalLevels: LEVELS.length
    });

    // Camera
    this.cameras.main.fadeIn(500);

    // Pause controls
    this.input.keyboard.on('keydown-ESC', () => this.togglePause());
    this.input.keyboard.on('keydown-P', () => this.togglePause());

    // Emit initial state
    this.events.emit('updateScore', this.score);
    this.events.emit('updateLevel', this.level + 1);
    this.events.emit('updateHighScore', StorageService.getHighScore());
    this.events.emit('updateLives', this.lives);
    this.events.emit('updateCombo', 0);
  }

  togglePause() {
    if (!this.gameActive) return;
    this.scene.pause();
    this.scene.launch('PauseScene', { parentScene: this });
  }

  createBackground(theme) {
    // Sky gradient (layer 0 - static)
    const bg = this.add.graphics();
    bg.fillGradientStyle(theme.bgTop, theme.bgTop, theme.bgBottom, theme.bgBottom, 1);
    bg.fillRect(0, 0, GAME_WIDTH * 1.2, GAME_HEIGHT);

    // Clouds (layer 1 - slowest parallax drift)
    this.parallaxClouds = [];
    const cloudAlpha = theme.cloudColor === 0xFFFFFF ? 0.7 : 0.25;
    [
      { x: 80, y: 60, s: 1.1 }, { x: 350, y: 100, s: 0.8 },
      { x: 650, y: 50, s: 1.3 }, { x: 950, y: 90, s: 0.9 },
      { x: 1200, y: 70, s: 1.0 }, { x: 1400, y: 110, s: 0.7 }
    ].forEach(c => {
      const g = this.add.graphics();
      g.fillStyle(theme.cloudColor, cloudAlpha);
      g.fillCircle(0, 0, 28 * c.s);
      g.fillCircle(24 * c.s, -8 * c.s, 22 * c.s);
      g.fillCircle(48 * c.s, 0, 28 * c.s);
      g.fillCircle(24 * c.s, 10 * c.s, 18 * c.s);
      g.setPosition(c.x, c.y);
      this.parallaxClouds.push({ obj: g, baseX: c.x, speed: 0.15 + Math.random() * 0.1 });
      this.tweens.add({
        targets: g, y: c.y + 8,
        duration: 3000 + Math.random() * 2000,
        ease: 'Sine.easeInOut', yoyo: true, repeat: -1
      });
    });

    // Far hills (layer 2)
    this.parallaxFarHills = this.add.graphics();
    this.parallaxFarHills.fillStyle(theme.hillFar, 0.5);
    this.drawHill(this.parallaxFarHills, -30, GAME_HEIGHT - 100, 320, 110);
    this.drawHill(this.parallaxFarHills, 230, GAME_HEIGHT - 80, 280, 90);
    this.drawHill(this.parallaxFarHills, 560, GAME_HEIGHT - 130, 380, 130);
    this.drawHill(this.parallaxFarHills, 920, GAME_HEIGHT - 95, 420, 95);
    this.drawHill(this.parallaxFarHills, 1250, GAME_HEIGHT - 85, 300, 85);

    // Near hills (layer 3)
    this.parallaxNearHills = this.add.graphics();
    this.parallaxNearHills.fillStyle(theme.hillNear, 0.6);
    this.drawHill(this.parallaxNearHills, -60, GAME_HEIGHT - 60, 220, 65);
    this.drawHill(this.parallaxNearHills, 380, GAME_HEIGHT - 75, 300, 75);
    this.drawHill(this.parallaxNearHills, 770, GAME_HEIGHT - 55, 240, 55);
    this.drawHill(this.parallaxNearHills, 1080, GAME_HEIGHT - 85, 320, 85);

    // Decorative particles for cave/sky worlds
    if (theme === WORLD_THEMES.cave) {
      // Crystal shimmer particles
      for (let i = 0; i < 15; i++) {
        const spark = this.add.circle(
          Phaser.Math.Between(50, GAME_WIDTH - 50),
          Phaser.Math.Between(30, GAME_HEIGHT - 100),
          Phaser.Math.Between(1, 3), 0x4FC3F7, 0
        );
        this.tweens.add({
          targets: spark,
          alpha: { from: 0, to: 0.8 },
          duration: Phaser.Math.Between(1500, 3000),
          yoyo: true, repeat: -1,
          delay: Phaser.Math.Between(0, 2000)
        });
      }
    } else if (theme === WORLD_THEMES.sky) {
      // Floating feather/petal particles
      for (let i = 0; i < 10; i++) {
        const petal = this.add.circle(
          Phaser.Math.Between(0, GAME_WIDTH),
          Phaser.Math.Between(0, GAME_HEIGHT),
          Phaser.Math.Between(2, 4), 0xFFFFFF, 0.4
        );
        this.tweens.add({
          targets: petal,
          y: GAME_HEIGHT + 20,
          x: petal.x + Phaser.Math.Between(-100, 100),
          duration: Phaser.Math.Between(6000, 12000),
          repeat: -1,
          delay: Phaser.Math.Between(0, 5000),
          onRepeat: () => {
            petal.y = -10;
            petal.x = Phaser.Math.Between(0, GAME_WIDTH);
          }
        });
      }
    }
  }

  drawHill(graphics, x, y, width, height) {
    graphics.beginPath();
    graphics.moveTo(x, y);
    graphics.quadraticCurveTo(x + width / 2, y - height, x + width, y);
    graphics.closePath();
    graphics.fillPath();
  }

  createPlatforms(levelData) {
    const world = levelData.world || 'jungle';
    const suffix = world === 'jungle' ? '' : `-${world}`;

    levelData.platforms.forEach(platform => {
      const isGround = platform.height > 32;
      const baseTexture = isGround ? 'ground' : 'platform';
      const texture = this.textures.exists(`${baseTexture}${suffix}`) ? `${baseTexture}${suffix}` : baseTexture;
      const tileWidth = 64;
      const tileHeight = isGround ? 64 : 32;
      const tilesX = Math.ceil(platform.width / tileWidth);
      const startX = platform.x - platform.width / 2;
      const startY = platform.y - platform.height / 2;

      if (platform.moving) {
        for (let i = 0; i < tilesX; i++) {
          const tx = startX + i * tileWidth + tileWidth / 2;
          const ty = startY + tileHeight / 2;
          const tile = this.physics.add.image(tx, ty, texture);
          tile.setDisplaySize(tileWidth, tileHeight);
          tile.body.setImmovable(true);
          tile.body.setAllowGravity(false);
          tile.body.moves = false;
          this.physics.add.collider(this.player, tile);
          this.movingPlatforms.push({
            sprite: tile, startX: tx, startY: ty,
            axis: platform.moveAxis, range: platform.moveRange,
            speed: platform.moveSpeed, timer: 0
          });
        }
      } else if (platform.falling) {
        for (let i = 0; i < tilesX; i++) {
          const tile = this.platforms.create(
            startX + i * tileWidth + tileWidth / 2,
            startY + tileHeight / 2, texture
          );
          tile.setDisplaySize(tileWidth, tileHeight);
          tile.refreshBody();
          tile.isFalling = false;
          tile.fallTimer = 0;
          tile.originalY = startY + tileHeight / 2;
          tile.setTint(0xFFCCCC);
          this.fallingPlatforms.push(tile);
        }
      } else {
        for (let i = 0; i < tilesX; i++) {
          const tile = this.platforms.create(
            startX + i * tileWidth + tileWidth / 2,
            startY + tileHeight / 2, texture
          );
          tile.setDisplaySize(tileWidth, tileHeight);
          tile.refreshBody();
        }
      }
    });
  }

  createCoins(levelData) {
    this.totalCoins = levelData.coins.length;
    levelData.coins.forEach(coinPos => {
      const coin = new Coin(this, coinPos.x, coinPos.y);
      this.coins.add(coin);
    });
  }

  createEnemies(levelData) {
    if (!levelData.enemies) return;
    levelData.enemies.forEach(e => {
      if (e.type === 'walker') {
        const walker = new PatrolWalker(this, e.x, e.y, e.patrolDistance || 100);
        this.enemies.add(walker);
      } else if (e.type === 'flyer') {
        const flyer = new FlyingPest(this, e.x, e.y, e.amplitude || 60, e.speed || 80);
        this.enemies.add(flyer);
        this.flyingEnemies.push(flyer);
      }
    });
  }

  createSpikes(levelData) {
    if (!levelData.spikes) return;
    levelData.spikes.forEach(s => {
      const spike = new Spike(this, s.x, s.y);
      this.spikeGroup.add(spike);
    });
  }

  createPowerUps(levelData) {
    if (!levelData.powerUps) return;
    levelData.powerUps.forEach(p => {
      const pu = new PowerUp(this, p.x, p.y, p.type);
      this.powerUps.add(pu);
    });
  }

  createTouchControls(isMobile) {
    const alpha = isMobile ? 0.5 : 0;
    const pressAlpha = isMobile ? 0.8 : 0;
    const y = GAME_HEIGHT - 80;

    // Left button - larger hitbox for mobile
    this.touchLeftBtn = this.add.circle(80, y, 44, 0xFFFFFF, alpha)
      .setScrollFactor(0).setDepth(1000).setInteractive();
    const leftLabel = this.add.text(80, y, '\u25C0', { fontSize: '30px', color: '#333' })
      .setOrigin(0.5).setScrollFactor(0).setDepth(1001).setAlpha(alpha);

    // Right button
    this.touchRightBtn = this.add.circle(190, y, 44, 0xFFFFFF, alpha)
      .setScrollFactor(0).setDepth(1000).setInteractive();
    const rightLabel = this.add.text(190, y, '\u25B6', { fontSize: '30px', color: '#333' })
      .setOrigin(0.5).setScrollFactor(0).setDepth(1001).setAlpha(alpha);

    // Jump button - bigger for easy thumb access
    this.touchJumpBtn = this.add.circle(GAME_WIDTH - 90, y, 54, 0xFFEB3B, alpha)
      .setScrollFactor(0).setDepth(1000).setInteractive();
    const jumpLabel = this.add.text(GAME_WIDTH - 90, y, '\u25B2', { fontSize: '28px', color: '#333' })
      .setOrigin(0.5).setScrollFactor(0).setDepth(1001).setAlpha(alpha);

    // Left
    this.touchLeftBtn.on('pointerdown', () => {
      if (this.player) this.player.touchMoveX = -1;
      this.touchLeftBtn.setAlpha(pressAlpha);
    });
    this.touchLeftBtn.on('pointerup', () => {
      if (this.player) this.player.touchMoveX = 0;
      this.touchLeftBtn.setAlpha(alpha);
    });
    this.touchLeftBtn.on('pointerout', () => {
      if (this.player) this.player.touchMoveX = 0;
      this.touchLeftBtn.setAlpha(alpha);
    });

    // Right
    this.touchRightBtn.on('pointerdown', () => {
      if (this.player) this.player.touchMoveX = 1;
      this.touchRightBtn.setAlpha(pressAlpha);
    });
    this.touchRightBtn.on('pointerup', () => {
      if (this.player) this.player.touchMoveX = 0;
      this.touchRightBtn.setAlpha(alpha);
    });
    this.touchRightBtn.on('pointerout', () => {
      if (this.player) this.player.touchMoveX = 0;
      this.touchRightBtn.setAlpha(alpha);
    });

    // Jump
    this.touchJumpBtn.on('pointerdown', () => {
      if (this.player) {
        this.player.touchJump = true;
        this.player.touchJumpConsumed = false;
      }
      this.touchJumpBtn.setAlpha(pressAlpha);
    });
    this.touchJumpBtn.on('pointerup', () => {
      if (this.player) this.player.touchJump = false;
      this.touchJumpBtn.setAlpha(alpha);
    });
    this.touchJumpBtn.on('pointerout', () => {
      if (this.player) this.player.touchJump = false;
      this.touchJumpBtn.setAlpha(alpha);
    });
  }

  handlePlatformCollision(player, platform) {
    if (platform.isFalling === false && player.body.blocked.down) {
      platform.isFalling = true;
      platform.fallTimer = 500;
      this.tweens.add({
        targets: platform, x: platform.x + 2,
        duration: 50, yoyo: true, repeat: 4,
        onComplete: () => { if (platform.isFalling) platform.setTint(0xFF6666); }
      });
    }
  }

  handleCoinCollect(player, coin) {
    if (!player.alive || !this.gameActive) return;

    const points = coin.collect();
    this.combo++;
    this.comboTimer = COMBO.WINDOW;
    const multiplierIdx = Math.min(this.combo - 1, COMBO.MULTIPLIERS.length - 1);
    const multiplier = COMBO.MULTIPLIERS[multiplierIdx];
    const totalPoints = Math.round(points * multiplier);

    this.score += totalPoints;
    this.collectedCoins++;
    StorageService.addCoins(1);

    if (this.audioManager) this.audioManager.playCoinCollect(this.combo);

    this.events.emit('updateScore', this.score);
    this.events.emit('updateCombo', this.combo);
    player.collectCoin();

    const comboText = multiplier > 1 ? ` x${multiplier}` : '';
    this.showFloatingScore(coin.x, coin.y, `+${totalPoints}${comboText}`,
      multiplier > 1 ? '#FF9800' : '#FFEB3B');
    this.emitCoinParticles(coin.x, coin.y);

    if (this.combo === 3 || this.combo === 5 || this.combo === 8) {
      this.screenShake(2, 80);
      if (this.audioManager) this.audioManager.playComboMilestone(this.combo);
    }

    // Check achievements on coin collect
    AchievementService.check({
      score: this.score,
      combo: this.combo,
      stomps: this.stomps,
      deaths: this.deaths,
      levelComplete: false
    });
    this.events.emit('checkAchievements');

    if (this.collectedCoins >= this.totalCoins) {
      this.gameActive = false;
      this.levelComplete();
    }
  }

  handleEnemyCollision(player, enemy) {
    if (!player.alive || !enemy.alive) return;

    if (player.body.velocity.y > 0 && player.y < enemy.y - 10) {
      enemy.stomp();
      player.body.setVelocityY(-300);
      this.score += ENEMY_STOMP_SCORE;
      this.stomps++;
      this.events.emit('updateScore', this.score);
      this.showFloatingScore(enemy.x, enemy.y, `+${ENEMY_STOMP_SCORE}`, '#00FF00');
      this.screenShake(3, 100);
      this.emitStompParticles(enemy.x, enemy.y);
      if (this.audioManager) this.audioManager.playEnemyStomp();

      // Check achievements on stomp
      AchievementService.check({
        score: this.score,
        combo: this.combo,
        stomps: this.stomps,
        deaths: this.deaths,
        levelComplete: false
      });
      this.events.emit('checkAchievements');
    } else {
      this.playerHit();
    }
  }

  handleSpikeCollision(player) {
    if (!player.alive) return;
    this.playerHit();
  }

  handlePowerUpCollect(player, powerUp) {
    if (!player.alive) return;
    powerUp.collect(player);
    this.screenShake(2, 60);
  }

  playerHit() {
    const died = this.player.die();
    if (!died) return;

    this.lives--;
    this.deaths++;
    this.combo = 0;
    this.events.emit('updateLives', this.lives);
    this.events.emit('updateCombo', 0);
    this.screenShake(5, 200);

    if (this.lives <= 0) {
      this.gameActive = false;
      this.time.delayedCall(1000, () => this.gameOver());
    } else {
      this.time.delayedCall(1000, () => {
        if (this.player) this.player.respawn(PLAYER.START_X, PLAYER.START_Y);
      });
    }
  }

  showFloatingScore(x, y, text, color = '#FFEB3B') {
    const scoreText = this.add.text(x, y, text, {
      fontFamily: 'Arial Black, Arial', fontSize: '24px',
      color: color, stroke: '#000000', strokeThickness: 4
    }).setOrigin(0.5);

    this.tweens.add({
      targets: scoreText, y: y - 60, alpha: 0,
      duration: 800, ease: 'Power2',
      onComplete: () => scoreText.destroy()
    });
  }

  emitCoinParticles(x, y) {
    for (let i = 0; i < 8; i++) {
      const angle = (i / 8) * Math.PI * 2;
      const p = this.add.circle(x, y, Phaser.Math.Between(2, 4), 0xFFEB3B, 0.9);
      this.tweens.add({
        targets: p,
        x: x + Math.cos(angle) * Phaser.Math.Between(20, 40),
        y: y + Math.sin(angle) * Phaser.Math.Between(20, 40),
        alpha: 0, scale: 0,
        duration: Phaser.Math.Between(200, 400),
        ease: 'Power2',
        onComplete: () => p.destroy()
      });
    }
  }

  emitStompParticles(x, y) {
    for (let i = 0; i < 10; i++) {
      const p = this.add.circle(
        x + Phaser.Math.Between(-15, 15),
        y + Phaser.Math.Between(-10, 10),
        Phaser.Math.Between(2, 5),
        Phaser.Math.RND.pick([0xFF5722, 0xFFEB3B, 0xFF9800]), 0.9
      );
      this.tweens.add({
        targets: p,
        y: p.y - Phaser.Math.Between(20, 50),
        x: p.x + Phaser.Math.Between(-30, 30),
        alpha: 0, scale: 0.2,
        duration: Phaser.Math.Between(300, 500),
        ease: 'Power2',
        onComplete: () => p.destroy()
      });
    }
  }

  screenShake(intensity = 3, duration = 100) {
    this.cameras.main.shake(duration, intensity / 1000);
  }

  levelComplete() {
    const isNewHighScore = StorageService.setHighScore(this.score);
    const highScore = StorageService.getHighScore();
    const levelData = LEVELS[this.level];
    const timeElapsed = Math.floor(this.levelTimer / 1000);

    let stars = 1;
    if (this.deaths === 0) stars = 2;
    if (this.deaths === 0 && levelData.par && timeElapsed <= levelData.par) stars = 3;

    StorageService.unlockLevel(this.level + 2);
    StorageService.setLevelStars(this.level, stars);

    // Check achievements on level complete
    AchievementService.check({
      score: this.score,
      combo: this.combo,
      stomps: this.stomps,
      deaths: this.deaths,
      levelComplete: true
    });
    this.events.emit('checkAchievements');

    if (this.audioManager) this.audioManager.playLevelComplete();
    this.screenShake(4, 200);

    const overlay = this.add.rectangle(
      GAME_WIDTH / 2, GAME_HEIGHT / 2, GAME_WIDTH, GAME_HEIGHT, 0x000000, 0
    );
    this.tweens.add({ targets: overlay, alpha: 0.6, duration: 500 });

    const completeText = this.add.text(
      GAME_WIDTH / 2, GAME_HEIGHT / 2 - 120, 'LEVEL COMPLETE!',
      { fontFamily: 'Arial Black, Arial', fontSize: '56px', color: '#FFEB3B', stroke: '#FF9800', strokeThickness: 8 }
    ).setOrigin(0.5).setAlpha(0);

    const starY = GAME_HEIGHT / 2 - 50;
    const starObjs = [];
    for (let i = 0; i < 3; i++) {
      const star = this.add.text(
        GAME_WIDTH / 2 - 50 + i * 50, starY,
        i < stars ? '\u2605' : '\u2606',
        { fontSize: '40px', color: i < stars ? '#FFD700' : '#666666' }
      ).setOrigin(0.5).setAlpha(0);
      starObjs.push(star);
    }

    const scoreDisp = this.add.text(
      GAME_WIDTH / 2, GAME_HEIGHT / 2 + 10, `Score: ${this.score}`,
      { fontFamily: 'Arial', fontSize: '32px', color: '#FFFFFF', stroke: '#000000', strokeThickness: 4 }
    ).setOrigin(0.5).setAlpha(0);

    const timeDisp = this.add.text(
      GAME_WIDTH / 2, GAME_HEIGHT / 2 + 50,
      `Time: ${timeElapsed}s${levelData.par ? ` (Par: ${levelData.par}s)` : ''}`,
      { fontFamily: 'Arial', fontSize: '24px', color: '#B0BEC5', stroke: '#000000', strokeThickness: 3 }
    ).setOrigin(0.5).setAlpha(0);

    if (isNewHighScore) {
      const nhText = this.add.text(
        GAME_WIDTH / 2, GAME_HEIGHT / 2 + 90, 'NEW HIGH SCORE!',
        { fontFamily: 'Arial Black', fontSize: '28px', color: '#00FF00', stroke: '#000000', strokeThickness: 4 }
      ).setOrigin(0.5).setAlpha(0);
      this.tweens.add({
        targets: nhText, alpha: 1, scaleX: 1.2, scaleY: 1.2,
        duration: 300, delay: 600, yoyo: true, repeat: 2
      });
    }

    const hasNextLevel = this.level + 1 < LEVELS.length;
    const continueText = this.add.text(
      GAME_WIDTH / 2, GAME_HEIGHT / 2 + 140,
      hasNextLevel ? 'Tap or SPACE for next level' : 'Tap or SPACE to return to menu',
      { fontFamily: 'Arial', fontSize: '22px', color: '#FFFFFF', stroke: '#000000', strokeThickness: 3 }
    ).setOrigin(0.5).setAlpha(0);

    this.tweens.add({
      targets: [completeText, scoreDisp, timeDisp, continueText, ...starObjs],
      alpha: 1, duration: 500, delay: 300
    });

    this.events.emit('updateHighScore', highScore);

    const proceed = () => {
      if (hasNextLevel) {
        this.scene.stop('UIScene');
        this.scene.restart({ level: this.level + 1, lives: this.lives });
      } else {
        this.scene.stop('UIScene');
        this.scene.start('MenuScene');
      }
    };
    this.input.keyboard.once('keydown-SPACE', proceed);
    this.time.delayedCall(500, () => {
      this.input.once('pointerdown', () => this.time.delayedCall(100, proceed));
    });
  }

  gameOver() {
    if (this.audioManager) this.audioManager.playDeath();

    const overlay = this.add.rectangle(
      GAME_WIDTH / 2, GAME_HEIGHT / 2, GAME_WIDTH, GAME_HEIGHT, 0x000000, 0
    );
    this.tweens.add({ targets: overlay, alpha: 0.7, duration: 500 });

    this.add.text(
      GAME_WIDTH / 2, GAME_HEIGHT / 2 - 60, 'GAME OVER',
      { fontFamily: 'Arial Black', fontSize: '64px', color: '#FF5252', stroke: '#000000', strokeThickness: 8 }
    ).setOrigin(0.5).setAlpha(0).setName('goText');

    this.add.text(
      GAME_WIDTH / 2, GAME_HEIGHT / 2 + 10, `Final Score: ${this.score}`,
      { fontFamily: 'Arial', fontSize: '28px', color: '#FFFFFF', stroke: '#000000', strokeThickness: 4 }
    ).setOrigin(0.5).setAlpha(0).setName('goScore');

    StorageService.setHighScore(this.score);

    this.add.text(
      GAME_WIDTH / 2, GAME_HEIGHT / 2 + 70, 'Tap or SPACE to retry',
      { fontFamily: 'Arial', fontSize: '22px', color: '#FFFFFF', stroke: '#000000', strokeThickness: 3 }
    ).setOrigin(0.5).setAlpha(0).setName('goRetry');

    const goElements = [
      this.children.getByName('goText'),
      this.children.getByName('goScore'),
      this.children.getByName('goRetry')
    ].filter(Boolean);

    this.tweens.add({ targets: goElements, alpha: 1, duration: 500, delay: 300 });

    const retry = () => {
      this.scene.stop('UIScene');
      this.scene.restart({ level: this.level, lives: 3 });
    };
    this.input.keyboard.once('keydown-SPACE', retry);
    this.time.delayedCall(500, () => {
      this.input.once('pointerdown', () => this.time.delayedCall(100, retry));
    });
  }

  update(time, delta) {
    const dt = delta || 16.67;

    if (this.player && this.player.alive && this.gameActive) {
      this.player.update(time, dt);
      this.levelTimer += dt;

      if (this.combo > 0) {
        this.comboTimer -= dt;
        if (this.comboTimer <= 0) {
          this.combo = 0;
          this.events.emit('updateCombo', 0);
        }
      }

      if (this.player.y > GAME_HEIGHT + 50) {
        this.playerHit();
      }
    }

    this.enemies.getChildren().forEach(enemy => {
      if (enemy.update) enemy.update(time, dt);
    });

    this.movingPlatforms.forEach(mp => {
      mp.timer += dt / 1000;
      if (mp.axis === 'x') {
        mp.sprite.x = mp.startX + Math.sin(mp.timer * (mp.speed / 30)) * mp.range;
      } else {
        mp.sprite.y = mp.startY + Math.sin(mp.timer * (mp.speed / 30)) * mp.range;
      }
      mp.sprite.body.updateFromGameObject();
    });

    this.fallingPlatforms.forEach(fp => {
      if (fp.isFalling && fp.fallTimer > 0) {
        fp.fallTimer -= dt;
        if (fp.fallTimer <= 0) {
          fp.body.enable = false;
          this.tweens.add({
            targets: fp, y: GAME_HEIGHT + 100, alpha: 0,
            duration: 600, ease: 'Power2',
            onComplete: () => {
              this.time.delayedCall(3000, () => {
                if (fp.scene) {
                  fp.setPosition(fp.x, fp.originalY);
                  fp.setAlpha(1);
                  fp.body.enable = true;
                  fp.isFalling = false;
                  fp.fallTimer = 0;
                  fp.setTint(0xFFCCCC);
                  fp.refreshBody();
                }
              });
            }
          });
        }
      }
    });

    this.events.emit('updateTimer', Math.floor(this.levelTimer / 1000));

    // Parallax effect based on player horizontal position
    if (this.player && this.player.alive) {
      const px = this.player.x / GAME_WIDTH; // 0 to 1
      const offset = (px - 0.5) * 2; // -1 to 1

      if (this.parallaxClouds) {
        this.parallaxClouds.forEach(c => {
          c.obj.x = c.baseX - offset * 20 * c.speed;
        });
      }
      if (this.parallaxFarHills) {
        this.parallaxFarHills.x = -offset * 15;
      }
      if (this.parallaxNearHills) {
        this.parallaxNearHills.x = -offset * 30;
      }
    }
  }
}
