import Phaser from 'phaser';
import { PLAYER_SPEED, PLAYER_JUMP_VELOCITY } from '../config/gameConfig.ts';

const WALK_FRAME_INTERVAL = 150;

export class Player extends Phaser.Physics.Arcade.Sprite {
  declare body: Phaser.Physics.Arcade.Body;

  private isJumping = false;
  private walkFrame = 0;
  private walkTimer = 0;
  private spaceWasPressed = false;

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

    this.body.setCollideWorldBounds(true);
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

  update(_time: number, delta: number) {
    const onGround = this.body.blocked.down || this.body.touching.down;

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

    // Jump - edge detection
    const jumpPressed = this.cursors.up.isDown || this.wasd.up.isDown || this.spaceKey.isDown;
    const jumpJustPressed = jumpPressed && !this.spaceWasPressed;

    if (jumpJustPressed && onGround && !this.isJumping) {
      this.body.setVelocityY(PLAYER_JUMP_VELOCITY);
      this.isJumping = true;

      this.scene.tweens.add({
        targets: this,
        scaleX: 1.2,
        scaleY: 0.8,
        duration: 100,
        yoyo: true,
      });
    }

    this.spaceWasPressed = jumpPressed;
    this.updateSprite(onGround, delta);
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
}
