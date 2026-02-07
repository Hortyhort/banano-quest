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

    // Emit initial state
    this.events.emit('updateScore', this.score);
    this.events.emit('updateLevel', this.level + 1);
    this.events.emit('updateHighScore', StorageService.getHighScore());
    this.events.emit('updateLives', this.lives);
    this.events.emit('updateCombo', 0);
  }

  createBackground(theme) {
    const bg = this.add.graphics();
    bg.fillGradientStyle(theme.bgTop, theme.bgTop, theme.bgBottom, theme.bgBottom, 1);
    bg.fillRect(0, 0, GAME_WIDTH, GAME_HEIGHT);

    const cloudPositions = [
      { x: 100, y: 80, scale: 1 }, { x: 400, y: 120, scale: 0.8 },
      { x: 700, y: 60, scale: 1.2 }, { x: 1000, y: 100, scale: 0.9 },
      { x: 1200, y: 70, scale: 1.1 }
    ];
    cloudPositions.forEach(cloud => {
      const g = this.add.graphics();
      g.fillStyle(theme.cloudColor, theme.cloudColor === 0xFFFFFF ? 0.8 : 0.3);
      g.fillCircle(0, 0, 30 * cloud.scale);
      g.fillCircle(25 * cloud.scale, -10 * cloud.scale, 25 * cloud.scale);
      g.fillCircle(50 * cloud.scale, 0, 30 * cloud.scale);
      g.fillCircle(25 * cloud.scale, 10 * cloud.scale, 20 * cloud.scale);
      g.setPosition(cloud.x, cloud.y);
      this.tweens.add({
        targets: g, x: g.x + 30,
        duration: 4000 + Math.random() * 2000,
        ease: 'Sine.easeInOut', yoyo: true, repeat: -1
      });
    });

    const hillGraphics = this.add.graphics();
    hillGraphics.fillStyle(theme.hillFar, 0.5);
    this.drawHill(hillGraphics, 0, GAME_HEIGHT - 100, 300, 100);
    this.drawHill(hillGraphics, 250, GAME_HEIGHT - 80, 250, 80);
    this.drawHill(hillGraphics, 600, GAME_HEIGHT - 120, 350, 120);
    this.drawHill(hillGraphics, 950, GAME_HEIGHT - 90, 400, 90);
    hillGraphics.fillStyle(theme.hillNear, 0.6);
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

  createPlatforms(levelData) {
    levelData.platforms.forEach(platform => {
      const isGround = platform.height > 32;
      const texture = isGround ? 'ground' : 'platform';
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
    const y = GAME_HEIGHT - 80;

    this.touchLeftBtn = this.add.circle(80, y, 40, 0xFFFFFF, alpha)
      .setScrollFactor(0).setDepth(1000).setInteractive();
    this.add.text(80, y, '\u25C0', { fontSize: '28px', color: '#333' })
      .setOrigin(0.5).setScrollFactor(0).setDepth(1001).setAlpha(alpha);

    this.touchRightBtn = this.add.circle(180, y, 40, 0xFFFFFF, alpha)
      .setScrollFactor(0).setDepth(1000).setInteractive();
    this.add.text(180, y, '\u25B6', { fontSize: '28px', color: '#333' })
      .setOrigin(0.5).setScrollFactor(0).setDepth(1001).setAlpha(alpha);

    this.touchJumpBtn = this.add.circle(GAME_WIDTH - 100, y, 50, 0xFFEB3B, alpha)
      .setScrollFactor(0).setDepth(1000).setInteractive();
    this.add.text(GAME_WIDTH - 100, y, '\u25B2', { fontSize: '24px', color: '#333' })
      .setOrigin(0.5).setScrollFactor(0).setDepth(1001).setAlpha(alpha);

    this.touchLeftBtn.on('pointerdown', () => { if (this.player) this.player.touchMoveX = -1; });
    this.touchLeftBtn.on('pointerup', () => { if (this.player) this.player.touchMoveX = 0; });
    this.touchLeftBtn.on('pointerout', () => { if (this.player) this.player.touchMoveX = 0; });

    this.touchRightBtn.on('pointerdown', () => { if (this.player) this.player.touchMoveX = 1; });
    this.touchRightBtn.on('pointerup', () => { if (this.player) this.player.touchMoveX = 0; });
    this.touchRightBtn.on('pointerout', () => { if (this.player) this.player.touchMoveX = 0; });

    this.touchJumpBtn.on('pointerdown', () => {
      if (this.player) {
        this.player.touchJump = true;
        this.player.touchJumpConsumed = false;
      }
    });
    this.touchJumpBtn.on('pointerup', () => { if (this.player) this.player.touchJump = false; });
    this.touchJumpBtn.on('pointerout', () => { if (this.player) this.player.touchJump = false; });
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

    if (this.combo === 3 || this.combo === 5 || this.combo === 8) {
      this.screenShake(2, 80);
      if (this.audioManager) this.audioManager.playComboMilestone(this.combo);
    }

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
      this.events.emit('updateScore', this.score);
      this.showFloatingScore(enemy.x, enemy.y, `+${ENEMY_STOMP_SCORE}`, '#00FF00');
      this.screenShake(3, 100);
      if (this.audioManager) this.audioManager.playEnemyStomp();
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
  }
}
