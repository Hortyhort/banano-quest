import Phaser from 'phaser';
import { PLAYER_SPEED, PLAYER_JUMP_VELOCITY } from '../config/gameConfig.js';

export class Player extends Phaser.Physics.Arcade.Sprite {
  constructor(scene, x, y) {
    super(scene, x, y, 'monkey');

    scene.add.existing(this);
    scene.physics.add.existing(this);

    // Physics settings
    this.body.setCollideWorldBounds(true);
    this.body.setSize(40, 60);
    this.body.setOffset(12, 18);

    // Movement state
    this.isJumping = false;
    this.walkFrame = 0;
    this.walkTimer = 0;
    this.alive = true;

    // Game feel: coyote time & jump buffering
    this.coyoteTimer = 0;
    this.coyoteTime = 80;
    this.jumpBufferTimer = 0;
    this.jumpBufferTime = 100;
    this.wasOnGround = false;

    // Variable jump height
    this.jumpHeld = false;
    this.jumpCutMultiplier = 0.4;
    this.minJumpVelocity = PLAYER_JUMP_VELOCITY * this.jumpCutMultiplier;

    // Acceleration / deceleration
    this.groundAccel = 1800;
    this.groundDecel = 2400;
    this.airAccel = 1200;
    this.airDecel = 600;

    // Power-up state
    this.hasDoubleJump = false;
    this.doubleJumpUsed = false;
    this.hasShield = false;
    this.hasSpeedBoost = false;
    this.hasMagnet = false;
    this.magnetRange = 150;
    this.shieldGraphic = null;

    // Setup controls
    this.cursors = scene.input.keyboard.createCursorKeys();
    this.wasd = {
      up: scene.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.W),
      down: scene.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.S),
      left: scene.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.A),
      right: scene.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.D)
    };
    this.spaceKey = scene.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE);

    // Touch control state (set by GameScene touch controls)
    this.touchMoveX = 0;
    this.touchJump = false;
    this.touchJumpConsumed = false;
  }

  update(time, delta) {
    if (!this.alive || !this.body) return;

    const dt = delta || 16.67;
    const onGround = this.body.blocked.down || this.body.touching.down;

    // --- Coyote time ---
    if (onGround) {
      this.coyoteTimer = this.coyoteTime;
      this.doubleJumpUsed = false;
    } else if (this.wasOnGround && !onGround && !this.isJumping) {
      this.coyoteTimer = this.coyoteTime;
    }
    if (!onGround) {
      this.coyoteTimer = Math.max(0, this.coyoteTimer - dt);
    }
    this.wasOnGround = onGround;

    if (onGround) {
      this.isJumping = false;
    }

    // --- Input reading ---
    const leftPressed = this.cursors.left.isDown || this.wasd.left.isDown || this.touchMoveX < 0;
    const rightPressed = this.cursors.right.isDown || this.wasd.right.isDown || this.touchMoveX > 0;
    const jumpPressed = this.cursors.up.isDown || this.wasd.up.isDown || this.spaceKey.isDown || this.touchJump;
    const jumpJustPressed = Phaser.Input.Keyboard.JustDown(this.cursors.up) ||
                            Phaser.Input.Keyboard.JustDown(this.wasd.up) ||
                            Phaser.Input.Keyboard.JustDown(this.spaceKey) ||
                            (this.touchJump && !this.touchJumpConsumed);

    // --- Horizontal movement with acceleration ---
    const speed = this.hasSpeedBoost ? PLAYER_SPEED * 1.5 : PLAYER_SPEED;
    const accel = onGround ? this.groundAccel : this.airAccel;
    const decel = onGround ? this.groundDecel : this.airDecel;
    const dtSec = dt / 1000;

    if (leftPressed) {
      const vx = this.body.velocity.x;
      this.body.setVelocityX(vx > 0
        ? Math.max(vx - decel * dtSec, -speed)
        : Math.max(vx - accel * dtSec, -speed));
      this.setFlipX(true);
    } else if (rightPressed) {
      const vx = this.body.velocity.x;
      this.body.setVelocityX(vx < 0
        ? Math.min(vx + decel * dtSec, speed)
        : Math.min(vx + accel * dtSec, speed));
      this.setFlipX(false);
    } else {
      const vx = this.body.velocity.x;
      if (Math.abs(vx) < 10) {
        this.body.setVelocityX(0);
      } else if (vx > 0) {
        this.body.setVelocityX(Math.max(0, vx - decel * dtSec));
      } else {
        this.body.setVelocityX(Math.min(0, vx + decel * dtSec));
      }
    }

    // --- Jump buffering ---
    if (jumpJustPressed) {
      this.jumpBufferTimer = this.jumpBufferTime;
    }
    this.jumpBufferTimer = Math.max(0, this.jumpBufferTimer - dt);

    // Consume touch jump
    if (this.touchJump) {
      this.touchJumpConsumed = true;
    } else {
      this.touchJumpConsumed = false;
    }

    // --- Jump execution ---
    const canCoyoteJump = this.coyoteTimer > 0 && !this.isJumping;
    const canDoubleJump = this.hasDoubleJump && !this.doubleJumpUsed && !onGround && this.coyoteTimer <= 0;

    if (this.jumpBufferTimer > 0 && (canCoyoteJump || canDoubleJump)) {
      this.body.setVelocityY(PLAYER_JUMP_VELOCITY);
      this.isJumping = true;
      this.jumpHeld = true;
      this.jumpBufferTimer = 0;
      this.coyoteTimer = 0;

      if (canDoubleJump) {
        this.doubleJumpUsed = true;
        this.emitJumpParticles();
      }

      this.scene.tweens.add({
        targets: this,
        scaleX: 1.2,
        scaleY: 0.8,
        duration: 80,
        yoyo: true
      });
      this.emitDustParticles();

      if (this.scene.audioManager) {
        this.scene.audioManager.playJump();
      }
    }

    // --- Variable jump height ---
    if (!jumpPressed && this.isJumping && this.body.velocity.y < this.minJumpVelocity) {
      this.body.setVelocityY(this.body.velocity.y * this.jumpCutMultiplier);
      this.jumpHeld = false;
    }

    // --- Landing effects ---
    if (onGround && !this.wasOnGround) {
      const fallSpeed = Math.abs(this.body.velocity.y);
      if (fallSpeed > 100) {
        const intensity = Math.min(fallSpeed / 800, 0.3);
        this.scene.tweens.add({
          targets: this,
          scaleX: 1 + intensity,
          scaleY: 1 - intensity,
          duration: 60,
          yoyo: true
        });
        this.emitDustParticles();
        if (this.scene.audioManager) {
          this.scene.audioManager.playLand();
        }
      }
    }

    this.updateSprite(onGround, dt);

    if (this.shieldGraphic) {
      this.shieldGraphic.setPosition(this.x, this.y);
    }

    // Magnet: attract nearby coins
    if (this.hasMagnet && this.scene.coins) {
      this.scene.coins.getChildren().forEach(coin => {
        if (!coin.active) return;
        const dist = Phaser.Math.Distance.Between(this.x, this.y, coin.x, coin.y);
        if (dist < this.magnetRange) {
          const angle = Phaser.Math.Angle.Between(coin.x, coin.y, this.x, this.y);
          const pull = (1 - dist / this.magnetRange) * 400;
          coin.x += Math.cos(angle) * pull * dtSec;
          coin.y += Math.sin(angle) * pull * dtSec;
        }
      });
    }
  }

  updateSprite(onGround, dt) {
    if (!onGround) {
      this.setTexture('monkey-jump');
      return;
    }
    if (Math.abs(this.body.velocity.x) > 10) {
      this.walkTimer += dt;
      if (this.walkTimer > 120) {
        this.walkTimer = 0;
        this.walkFrame = (this.walkFrame + 1) % 2;
      }
      this.setTexture(this.walkFrame === 0 ? 'monkey-walk-1' : 'monkey-walk-2');
    } else {
      this.setTexture('monkey');
      this.walkTimer = 0;
      this.walkFrame = 0;
    }
  }

  emitDustParticles() {
    for (let i = 0; i < 5; i++) {
      const p = this.scene.add.circle(
        this.x + Phaser.Math.Between(-15, 15),
        this.y + 30,
        Phaser.Math.Between(2, 5),
        0xcccccc, 0.7
      );
      this.scene.tweens.add({
        targets: p,
        y: p.y - Phaser.Math.Between(10, 25),
        x: p.x + Phaser.Math.Between(-20, 20),
        alpha: 0,
        scale: 0.3,
        duration: Phaser.Math.Between(250, 400),
        ease: 'Power2',
        onComplete: () => p.destroy()
      });
    }
  }

  emitJumpParticles() {
    for (let i = 0; i < 8; i++) {
      const angle = (i / 8) * Math.PI * 2;
      const p = this.scene.add.circle(this.x, this.y, 3, 0x87CEEB, 0.9);
      this.scene.tweens.add({
        targets: p,
        x: this.x + Math.cos(angle) * 40,
        y: this.y + Math.sin(angle) * 40,
        alpha: 0,
        scale: 0,
        duration: 300,
        ease: 'Power2',
        onComplete: () => p.destroy()
      });
    }
  }

  collectCoin() {
    this.scene.tweens.add({
      targets: this,
      scaleX: 1.3,
      scaleY: 1.3,
      duration: 80,
      yoyo: true
    });
  }

  activateShield() {
    this.hasShield = true;
    if (this.shieldGraphic) this.shieldGraphic.destroy();
    this.shieldGraphic = this.scene.add.circle(this.x, this.y, 40, 0x4FC3F7, 0.25);
    this.shieldGraphic.setStrokeStyle(2, 0x4FC3F7, 0.6);
    this.shieldGraphic.setDepth(this.depth + 1);
    this.scene.tweens.add({
      targets: this.shieldGraphic,
      alpha: { from: 0.25, to: 0.1 },
      scale: { from: 1, to: 1.15 },
      duration: 800,
      yoyo: true,
      repeat: -1
    });
  }

  removeShield() {
    this.hasShield = false;
    if (this.shieldGraphic) {
      this.scene.tweens.add({
        targets: this.shieldGraphic,
        alpha: 0,
        scale: 2,
        duration: 300,
        onComplete: () => {
          if (this.shieldGraphic) {
            this.shieldGraphic.destroy();
            this.shieldGraphic = null;
          }
        }
      });
    }
  }

  die() {
    if (!this.alive) return false;
    if (this.hasShield) {
      this.removeShield();
      this.scene.tweens.add({
        targets: this,
        alpha: { from: 0.3, to: 1 },
        duration: 100,
        repeat: 5
      });
      return false;
    }
    this.alive = true; // Keep alive briefly for death animation
    this.body.setVelocity(0, PLAYER_JUMP_VELOCITY * 0.8);
    this.body.setCollideWorldBounds(false);
    this.setTint(0xff0000);
    if (this.scene.audioManager) {
      this.scene.audioManager.playDeath();
    }
    // Actually mark dead after a brief delay
    this.scene.time.delayedCall(100, () => { this.alive = false; });
    return true;
  }

  respawn(x, y) {
    this.alive = true;
    this.setPosition(x, y);
    this.body.setVelocity(0, 0);
    this.body.setCollideWorldBounds(true);
    this.clearTint();
    this.setAlpha(1);
    this.hasDoubleJump = false;
    this.doubleJumpUsed = false;
    this.hasShield = false;
    this.hasSpeedBoost = false;
    this.hasMagnet = false;
    if (this.shieldGraphic) {
      this.shieldGraphic.destroy();
      this.shieldGraphic = null;
    }
    this.scene.tweens.add({
      targets: this,
      alpha: { from: 0.3, to: 1 },
      duration: 100,
      repeat: 5
    });
  }
}
