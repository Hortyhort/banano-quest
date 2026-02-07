import Phaser from 'phaser';
import { PLAYER_SPEED, PLAYER_JUMP_VELOCITY, PLAYER, GAME_HEIGHT } from '../config/gameConfig.js';
import { AudioManager } from '../services/AudioManager.js';
import { AnalyticsService } from '../services/AnalyticsService.js';

export class Player extends Phaser.Physics.Arcade.Sprite {
  constructor(scene, x, y) {
    super(scene, x, y, 'monkey');

    scene.add.existing(this);
    scene.physics.add.existing(this);

    // Physics settings
    this.body.setCollideWorldBounds(false); // allow falling off bottom
    this.body.setSize(40, 60);
    this.body.setOffset(12, 18);

    // Spawn point
    this.spawnX = x;
    this.spawnY = y;

    // Movement state
    this.isJumping = false;
    this.walkFrame = 0;
    this.walkTimer = 0;

    // Lives & damage state
    this.lives = 3;
    this.isDead = false;
    this.isInvincible = false;
    this.invincibleTimer = null;
    this.flickerTween = null;

    // Touch controls reference (set externally)
    this.touchControls = null;

    // Moving platform velocity inheritance
    this.ridingPlatformVx = 0;

    // Power-up state
    this.activePowerUp = null;
    this.powerUpTimer = null;
    this.powerUpGlow = null;
    this.doubleJumpUsed = false;

    // Setup controls
    this.cursors = scene.input.keyboard.createCursorKeys();
    this.wasd = {
      up: scene.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.W),
      down: scene.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.S),
      left: scene.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.A),
      right: scene.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.D)
    };
    this.spaceKey = scene.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE);

    // Track previous space state for edge detection
    this.spaceWasPressed = false;
    this.wasInAir = false;
  }

  update() {
    if (this.isDead) return;

    // Fall death
    if (this.y > GAME_HEIGHT + 60) {
      this.die();
      return;
    }

    const onGround = this.body.blocked.down || this.body.touching.down;
    const tc = this.touchControls;

    // Reset jump state when landing
    if (onGround) {
      if (this.wasInAir) {
        AudioManager.playSound('land');
        // S4.2: Dust puff on landing
        if (this.scene.spawnDustPuff) {
          this.scene.spawnDustPuff(this.x, this.body.bottom);
        }
      }
      this.isJumping = false;
    }
    this.wasInAir = !onGround;

    // Horizontal movement (keyboard + touch)
    const leftDown = this.cursors.left.isDown || this.wasd.left.isDown || (tc && tc.left);
    const rightDown = this.cursors.right.isDown || this.wasd.right.isDown || (tc && tc.right);
    const speed = this.activePowerUp === 'speed' ? PLAYER_SPEED * 1.5 : PLAYER_SPEED;

    if (leftDown) {
      this.body.setVelocityX(-speed + this.ridingPlatformVx);
      this.setFlipX(true);
    } else if (rightDown) {
      this.body.setVelocityX(speed + this.ridingPlatformVx);
      this.setFlipX(false);
    } else {
      this.body.setVelocityX(this.ridingPlatformVx);
    }

    // Jump - edge detection for space key + touch
    const jumpPressed = this.cursors.up.isDown || this.wasd.up.isDown || this.spaceKey.isDown;
    const jumpJustPressed = (jumpPressed && !this.spaceWasPressed) || (tc && tc.jumpJustPressed);

    // Double jump: allow one extra jump in mid-air
    const canDoubleJump = this.activePowerUp === 'doubleJump' && !onGround && !this.doubleJumpUsed;

    if (jumpJustPressed && (onGround || canDoubleJump) && (!this.isJumping || canDoubleJump)) {
      if (!onGround && canDoubleJump) {
        this.doubleJumpUsed = true;
      }
      this.body.setVelocityY(PLAYER_JUMP_VELOCITY);
      this.isJumping = true;
      AudioManager.playSound('jump');
      AudioManager.vibrate(10);

      // Squash and stretch effect
      this.scene.tweens.add({
        targets: this,
        scaleX: 1.2,
        scaleY: 0.8,
        duration: 100,
        yoyo: true
      });
    }

    this.spaceWasPressed = jumpPressed;

    // Update power-up glow position
    if (this.powerUpGlow) {
      this.powerUpGlow.setPosition(this.x, this.y);
    }

    // Update sprite based on state
    this.updateSprite(onGround);
  }

  updateSprite(onGround) {
    // Jumping sprite
    if (!onGround) {
      this.setTexture('monkey-jump');
      return;
    }

    // Walking animation
    if (this.body.velocity.x !== 0) {
      this.walkTimer += 16;
      if (this.walkTimer > 150) {
        this.walkTimer = 0;
        this.walkFrame = (this.walkFrame + 1) % 2;
      }
      this.setTexture(this.walkFrame === 0 ? 'monkey-walk-1' : 'monkey-walk-2');
    } else {
      // Idle
      this.setTexture('monkey');
      this.walkTimer = 0;
      this.walkFrame = 0;
    }
  }

  hit() {
    if (this.isDead || this.isInvincible) return;
    this.die();
  }

  die() {
    if (this.isDead) return;
    this.isDead = true;
    this.lives--;

    AudioManager.playSound('player_death');
    AudioManager.vibrate([50, 30, 80]);

    // S8: Track death location for heatmap
    const level = this.scene.levelNum || 1;
    const cause = this.y > GAME_HEIGHT + 50 ? 'fall' : 'enemy';
    AnalyticsService.trackDeath(level, this.x, this.y, cause);

    // S4.2: Death particles
    if (this.scene.spawnDeathParticles) {
      this.scene.spawnDeathParticles(this.x, this.y);
    }

    // Stop movement
    this.body.setVelocity(0, 0);
    this.body.enable = false;

    // Screen shake
    this.scene.cameras.main.shake(200, 0.01);

    // Emit lives update
    this.scene.events.emit('updateLives', this.lives);

    if (this.lives <= 0) {
      // Game over — death animation then transition
      this.scene.tweens.add({
        targets: this,
        scaleX: 0,
        scaleY: 0,
        angle: 720,
        alpha: 0,
        duration: 600,
        ease: 'Power2',
        onComplete: () => {
          this.scene.events.emit('gameOver');
        }
      });
    } else {
      // Death animation then respawn
      this.setTint(0xFF0000);
      this.scene.tweens.add({
        targets: this,
        alpha: 0,
        scaleY: 0.3,
        duration: 400,
        ease: 'Power2',
        onComplete: () => {
          this.respawn();
        }
      });
    }
  }

  respawn() {
    // Reset position
    this.setPosition(this.spawnX, this.spawnY);
    this.setScale(1);
    this.setAlpha(1);
    this.setAngle(0);
    this.clearTint();

    // Clear active power-up on respawn
    this.clearPowerUp();

    // Reapply skin tint if set
    if (this.skinTint) {
      this.setTint(this.skinTint);
    }

    // Re-enable physics
    this.body.enable = true;
    this.body.setVelocity(0, 0);
    this.isDead = false;

    // Start invincibility
    this.isInvincible = true;

    // Flicker effect
    this.flickerTween = this.scene.tweens.add({
      targets: this,
      alpha: { from: 1, to: 0.3 },
      duration: 100,
      yoyo: true,
      repeat: 10
    });

    // End invincibility after 2 seconds
    this.invincibleTimer = this.scene.time.delayedCall(2000, () => {
      this.isInvincible = false;
      this.setAlpha(1);
      if (this.flickerTween) this.flickerTween.stop();
    });
  }

  collectCoin() {
    // Visual feedback on coin collection
    this.scene.tweens.add({
      targets: this,
      scaleX: 1.3,
      scaleY: 1.3,
      duration: 100,
      yoyo: true
    });
  }

  applyPowerUp(type) {
    // Clear existing power-up first
    this.clearPowerUp();

    this.activePowerUp = type;
    this.doubleJumpUsed = false;

    // Glow colors per type
    const glowColors = {
      speed: 0x42A5F5,
      doubleJump: 0xFFFFFF,
      magnet: 0xFFEB3B
    };

    // Create glow effect behind player
    this.powerUpGlow = this.scene.add.circle(this.x, this.y, 40, glowColors[type] || 0xFFFFFF, 0.25);
    this.powerUpGlow.setDepth(this.depth - 1);

    // Pulse glow
    this.scene.tweens.add({
      targets: this.powerUpGlow,
      alpha: { from: 0.25, to: 0.1 },
      scale: { from: 1, to: 1.3 },
      duration: 500,
      yoyo: true,
      repeat: -1
    });

    // 8 second duration
    this.powerUpTimer = this.scene.time.delayedCall(8000, () => {
      this.clearPowerUp();
      this.scene.events.emit('updatePowerUp', null, 0);
    });

    // Notify HUD
    this.scene.events.emit('updatePowerUp', type, 8000);
  }

  clearPowerUp() {
    this.activePowerUp = null;
    this.doubleJumpUsed = false;

    if (this.powerUpGlow) {
      this.powerUpGlow.destroy();
      this.powerUpGlow = null;
    }

    if (this.powerUpTimer) {
      this.powerUpTimer.remove(false);
      this.powerUpTimer = null;
    }
  }
}
