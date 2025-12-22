import Phaser from 'phaser';
import { PLAYER_SPEED, PLAYER_JUMP_VELOCITY, PLAYER } from '../config/gameConfig.js';

export class Player extends Phaser.Physics.Arcade.Sprite {
  constructor(scene, x, y) {
    super(scene, x, y, 'monkey');

    scene.add.existing(this);
    scene.physics.add.existing(this);

    // Physics settings
    this.body.setCollideWorldBounds(true);
    this.body.setSize(PLAYER.WIDTH - 16, PLAYER.HEIGHT - 8);
    this.body.setOffset(8, 8);

    // Movement state
    this.isJumping = false;
    this.canDoubleJump = false;

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
  }

  update() {
    const onGround = this.body.blocked.down || this.body.touching.down;

    // Reset jump state when landing
    if (onGround) {
      this.isJumping = false;
    }

    // Horizontal movement
    if (this.cursors.left.isDown || this.wasd.left.isDown) {
      this.body.setVelocityX(-PLAYER_SPEED);
      this.setFlipX(true);
    } else if (this.cursors.right.isDown || this.wasd.right.isDown) {
      this.body.setVelocityX(PLAYER_SPEED);
      this.setFlipX(false);
    } else {
      this.body.setVelocityX(0);
    }

    // Jump - edge detection for space key
    const jumpPressed = this.cursors.up.isDown || this.wasd.up.isDown || this.spaceKey.isDown;
    const jumpJustPressed = jumpPressed && !this.spaceWasPressed;

    if (jumpJustPressed && onGround && !this.isJumping) {
      this.body.setVelocityY(PLAYER_JUMP_VELOCITY);
      this.isJumping = true;

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

    // Visual feedback - slight rotation when moving
    if (this.body.velocity.x !== 0 && onGround) {
      const wobble = Math.sin(this.scene.time.now * 0.02) * 2;
      this.setRotation(Phaser.Math.DegToRad(wobble));
    } else {
      this.setRotation(0);
    }
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
