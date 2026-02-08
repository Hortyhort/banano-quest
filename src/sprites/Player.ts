import Phaser from 'phaser';
import {
  PLAYER_SPEED,
  PLAYER_JUMP_VELOCITY,
  COYOTE_TIME_MS,
  JUMP_BUFFER_MS,
  JUMP_CUT_MULTIPLIER,
  COLORS,
} from '../config/gameConfig.ts';

const WALK_FRAME_INTERVAL = 150;

export class Player extends Phaser.Physics.Arcade.Sprite {
  declare body: Phaser.Physics.Arcade.Body;

  private isJumping = false;
  private isDead = false;
  private walkFrame = 0;
  private walkTimer = 0;
  private spaceWasPressed = false;
  private wasOnGround = false;
  private lastVelocityY = 0;

  private coyoteTimer = 0;
  private jumpBufferTimer = 0;

  private cursors: Phaser.Types.Input.Keyboard.CursorKeys;
  private wasd: {
    up: Phaser.Input.Keyboard.Key;
    down: Phaser.Input.Keyboard.Key;
    left: Phaser.Input.Keyboard.Key;
    right: Phaser.Input.Keyboard.Key;
  };
  private spaceKey: Phaser.Input.Keyboard.Key;

  constructor(scene: Phaser.Scene, x: number, y: number) {
    super(scene, x, y, 'monkey');

    scene.add.existing(this);
    scene.physics.add.existing(this);

    this.body.setSize(40, 60);
    this.body.setOffset(12, 18);

    this.cursors = scene.input.keyboard!.createCursorKeys();
    this.wasd = {
      up: scene.input.keyboard!.addKey(Phaser.Input.Keyboard.KeyCodes.W),
      down: scene.input.keyboard!.addKey(Phaser.Input.Keyboard.KeyCodes.S),
      left: scene.input.keyboard!.addKey(Phaser.Input.Keyboard.KeyCodes.A),
      right: scene.input.keyboard!.addKey(Phaser.Input.Keyboard.KeyCodes.D),
    };
    this.spaceKey = scene.input.keyboard!.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE);
  }

  getIsDead(): boolean {
    return this.isDead;
  }

  die() {
    if (this.isDead) return;
    this.isDead = true;
    this.body.setVelocity(0, -300);
    this.setTint(0xff0000);
    this.scene.cameras.main.shake(200, 0.015);

    this.scene.tweens.add({
      targets: this,
      alpha: 0,
      duration: 100,
      yoyo: true,
      repeat: 3,
    });
  }

  update(_time: number, delta: number) {
    if (this.isDead) return;

    const onGround = this.body.blocked.down || this.body.touching.down;

    if (onGround && !this.wasOnGround) {
      this.onLand();
    }

    if (onGround) {
      this.coyoteTimer = COYOTE_TIME_MS;
      this.isJumping = false;
    } else {
      this.coyoteTimer -= delta;
    }

    // Horizontal movement
    if (this.cursors.left.isDown || this.wasd.left.isDown) {
      this.body.setVelocityX(-PLAYER_SPEED);
      this.setFlipX(true);
      if (onGround) this.emitDustParticle();
    } else if (this.cursors.right.isDown || this.wasd.right.isDown) {
      this.body.setVelocityX(PLAYER_SPEED);
      this.setFlipX(false);
      if (onGround) this.emitDustParticle();
    } else {
      this.body.setVelocityX(0);
    }

    // Jump input
    const jumpPressed = this.cursors.up.isDown || this.wasd.up.isDown || this.spaceKey.isDown;
    const jumpJustPressed = jumpPressed && !this.spaceWasPressed;

    if (jumpJustPressed) {
      this.jumpBufferTimer = JUMP_BUFFER_MS;
    } else {
      this.jumpBufferTimer -= delta;
    }

    const canJump = this.coyoteTimer > 0 && !this.isJumping;
    if (this.jumpBufferTimer > 0 && canJump) {
      this.doJump();
      this.jumpBufferTimer = 0;
      this.coyoteTimer = 0;
    }

    // Variable jump height
    if (!jumpPressed && this.body.velocity.y < PLAYER_JUMP_VELOCITY * JUMP_CUT_MULTIPLIER) {
      this.body.setVelocityY(this.body.velocity.y * JUMP_CUT_MULTIPLIER);
    }

    this.spaceWasPressed = jumpPressed;
    this.lastVelocityY = this.body.velocity.y;
    this.wasOnGround = onGround;
    this.updateSprite(onGround, delta);
  }

  private doJump() {
    this.body.setVelocityY(PLAYER_JUMP_VELOCITY);
    this.isJumping = true;

    this.scene.tweens.add({
      targets: this,
      scaleX: 1.2,
      scaleY: 0.8,
      duration: 80,
      yoyo: true,
    });

    this.emitJumpDust();
  }

  private onLand() {
    const fallSpeed = Math.abs(this.lastVelocityY);
    const intensity = Math.min(fallSpeed / 600, 1);

    if (intensity > 0.2) {
      this.scene.tweens.add({
        targets: this,
        scaleX: 1 + intensity * 0.3,
        scaleY: 1 - intensity * 0.2,
        duration: 60,
        yoyo: true,
      });
    }

    if (intensity > 0.3) {
      this.emitLandDust(intensity);
    }

    if (intensity > 0.7) {
      this.scene.cameras.main.shake(100, 0.005 * intensity);
    }
  }

  private emitDustParticle() {
    if (Math.random() > 0.15) return;
    const dust = this.scene.add.circle(
      this.x + (this.flipX ? 10 : -10),
      this.y + 30,
      Phaser.Math.Between(2, 4),
      0xcccccc,
      0.5
    );
    this.scene.tweens.add({
      targets: dust,
      y: dust.y - Phaser.Math.Between(5, 15),
      alpha: 0,
      scale: 0,
      duration: Phaser.Math.Between(200, 400),
      onComplete: () => dust.destroy(),
    });
  }

  private emitJumpDust() {
    for (let i = 0; i < 4; i++) {
      const dust = this.scene.add.circle(
        this.x + Phaser.Math.Between(-15, 15),
        this.y + 30,
        Phaser.Math.Between(3, 5),
        0xcccccc,
        0.6
      );
      this.scene.tweens.add({
        targets: dust,
        x: dust.x + Phaser.Math.Between(-20, 20),
        y: dust.y + Phaser.Math.Between(5, 15),
        alpha: 0,
        scale: 0,
        duration: Phaser.Math.Between(200, 400),
        onComplete: () => dust.destroy(),
      });
    }
  }

  private emitLandDust(intensity: number) {
    const count = Math.floor(3 + intensity * 5);
    for (let i = 0; i < count; i++) {
      const dust = this.scene.add.circle(
        this.x + Phaser.Math.Between(-20, 20),
        this.y + 28,
        Phaser.Math.Between(2, 5),
        0xcccccc,
        0.5
      );
      this.scene.tweens.add({
        targets: dust,
        x: dust.x + Phaser.Math.Between(-30, 30),
        y: dust.y - Phaser.Math.Between(5, 20),
        alpha: 0,
        scale: 0,
        duration: Phaser.Math.Between(300, 500),
        onComplete: () => dust.destroy(),
      });
    }
  }

  private updateSprite(onGround: boolean, delta: number) {
    if (!onGround) {
      this.setTexture('monkey-jump');
      return;
    }
    if (this.body.velocity.x !== 0) {
      this.walkTimer += delta;
      if (this.walkTimer > WALK_FRAME_INTERVAL) {
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

  collectCoin() {
    this.scene.tweens.add({
      targets: this,
      scaleX: 1.3,
      scaleY: 1.3,
      duration: 100,
      yoyo: true,
    });
  }

  stompEnemy() {
    this.body.setVelocityY(PLAYER_JUMP_VELOCITY * 0.6);
    this.isJumping = true;

    this.scene.tweens.add({
      targets: this,
      scaleX: 1.15,
      scaleY: 1.15,
      duration: 60,
      yoyo: true,
    });

    for (let i = 0; i < 6; i++) {
      const star = this.scene.add.star(
        this.x + Phaser.Math.Between(-10, 10),
        this.y + 25,
        5,
        3,
        6,
        COLORS.BANANO_YELLOW,
        1
      );
      this.scene.tweens.add({
        targets: star,
        x: star.x + Phaser.Math.Between(-40, 40),
        y: star.y + Phaser.Math.Between(-30, 10),
        alpha: 0,
        scale: 0,
        duration: Phaser.Math.Between(300, 500),
        onComplete: () => star.destroy(),
      });
    }
  }
}
