import Phaser from 'phaser';

export class MovingPlatform extends Phaser.Physics.Arcade.Image {
  constructor(scene, x, y, config = {}) {
    super(scene, x, y, 'platform');

    scene.add.existing(this);
    scene.physics.add.existing(this);

    this.body.setImmovable(true);
    this.body.setAllowGravity(false);
    this.setDisplaySize(config.width || 64, 32);
    this.body.setSize(config.width || 64, 32);

    // Movement config
    this.startX = x;
    this.startY = y;
    this.moveAxis = config.axis || 'x'; // 'x' or 'y'
    this.moveRange = config.range || 100;
    this.moveSpeed = config.speed || 60;
    this.direction = 1;

    // Set initial velocity
    if (this.moveAxis === 'x') {
      this.body.setVelocityX(this.moveSpeed);
    } else {
      this.body.setVelocityY(this.moveSpeed);
    }
  }

  update() {
    if (this.moveAxis === 'x') {
      if (this.x >= this.startX + this.moveRange) {
        this.direction = -1;
        this.body.setVelocityX(-this.moveSpeed);
      } else if (this.x <= this.startX - this.moveRange) {
        this.direction = 1;
        this.body.setVelocityX(this.moveSpeed);
      }
    } else {
      if (this.y >= this.startY + this.moveRange) {
        this.direction = -1;
        this.body.setVelocityY(-this.moveSpeed);
      } else if (this.y <= this.startY - this.moveRange) {
        this.direction = 1;
        this.body.setVelocityY(this.moveSpeed);
      }
    }
  }
}
