import Phaser from 'phaser';
import { PLAYER_SPEED, PLAYER_JUMP_VELOCITY, PLAYER, GAME_HEIGHT } from '../config/gameConfig.js';
import { AudioManager } from '../services/AudioManager.js';

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

    if (leftDown) {
      this.body.setVelocityX(-PLAYER_SPEED + this.ridingPlatformVx);
      this.setFlipX(true);
    } else if (rightDown) {
      this.body.setVelocityX(PLAYER_SPEED + this.ridingPlatformVx);
      this.setFlipX(false);
    } else {
      this.body.setVelocityX(this.ridingPlatformVx);
    }

    // Jump - edge detection for space key + touch
    const jumpPressed = this.cursors.up.isDown || this.wasd.up.isDown || this.spaceKey.isDown;
    const jumpJustPressed = (jumpPressed && !this.spaceWasPressed) || (tc && tc.jumpJustPressed);

    if (jumpJustPressed && onGround && !this.isJumping) {
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
}
