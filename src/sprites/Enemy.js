import Phaser from 'phaser';

/**
 * PatrolWalker - walks back and forth on platforms, stompable from above
 */
export class PatrolWalker extends Phaser.Physics.Arcade.Sprite {
  constructor(scene, x, y, patrolDistance = 100) {
    super(scene, x, y, 'enemy-walker');

    scene.add.existing(this);
    scene.physics.add.existing(this);

    this.body.setSize(32, 32);
    this.body.setCollideWorldBounds(true);
    this.body.setBounce(0);

    this.speed = 60;
    this.patrolDistance = patrolDistance;
    this.startX = x;
    this.direction = 1;
    this.alive = true;

    this.body.setVelocityX(this.speed * this.direction);

    // Idle bobbing
    scene.tweens.add({
      targets: this,
      y: y - 3,
      duration: 400,
      ease: 'Sine.easeInOut',
      yoyo: true,
      repeat: -1
    });
  }

  update() {
    if (!this.alive || !this.body) return;

    // Reverse direction at patrol bounds
    if (this.x > this.startX + this.patrolDistance) {
      this.direction = -1;
      this.setFlipX(false);
    } else if (this.x < this.startX - this.patrolDistance) {
      this.direction = 1;
      this.setFlipX(true);
    }

    // Reverse if hitting a wall
    if (this.body.blocked.left) {
      this.direction = 1;
      this.setFlipX(true);
    } else if (this.body.blocked.right) {
      this.direction = -1;
      this.setFlipX(false);
    }

    this.body.setVelocityX(this.speed * this.direction);
  }

  stomp() {
    if (!this.alive) return;
    this.alive = false;
    this.body.setVelocity(0, 0);
    this.body.setAllowGravity(false);
    this.body.enable = false;

    // Squash and fade
    this.scene.tweens.add({
      targets: this,
      scaleX: 1.5,
      scaleY: 0.2,
      alpha: 0,
      duration: 300,
      ease: 'Power2',
      onComplete: () => this.destroy()
    });

    // Score particles
    for (let i = 0; i < 6; i++) {
      const p = this.scene.add.circle(
        this.x + Phaser.Math.Between(-10, 10),
        this.y,
        3, 0xFFEB3B, 0.9
      );
      this.scene.tweens.add({
        targets: p,
        y: p.y - Phaser.Math.Between(20, 50),
        x: p.x + Phaser.Math.Between(-30, 30),
        alpha: 0,
        duration: 400,
        ease: 'Power2',
        onComplete: () => p.destroy()
      });
    }
  }
}

/**
 * FlyingPest - sine-wave flight pattern, cannot be stomped, must be avoided
 */
export class FlyingPest extends Phaser.Physics.Arcade.Sprite {
  constructor(scene, x, y, amplitude = 60, speed = 80) {
    super(scene, x, y, 'enemy-flyer');

    scene.add.existing(this);
    scene.physics.add.existing(this);

    this.body.setAllowGravity(false);
    this.body.setSize(28, 28);
    this.body.setImmovable(true);

    this.startX = x;
    this.startY = y;
    this.amplitude = amplitude;
    this.flySpeed = speed;
    this.flyTimer = 0;
    this.alive = true;
    this.direction = 1;
    this.horizontalRange = 120;
  }

  update(time, delta) {
    if (!this.alive || !this.body) return;
    const dt = delta || 16.67;

    this.flyTimer += dt / 1000;

    // Sine wave vertical movement
    this.y = this.startY + Math.sin(this.flyTimer * 2) * this.amplitude;

    // Horizontal patrol
    this.x += this.direction * this.flySpeed * (dt / 1000);
    if (this.x > this.startX + this.horizontalRange) this.direction = -1;
    if (this.x < this.startX - this.horizontalRange) this.direction = 1;
    this.setFlipX(this.direction < 0);

    // Wing flap effect
    this.setScale(1, 0.9 + Math.sin(this.flyTimer * 12) * 0.1);
  }
}

/**
 * Spike - static hazard, kills on contact
 */
export class Spike extends Phaser.Physics.Arcade.Sprite {
  constructor(scene, x, y) {
    super(scene, x, y, 'spike');

    scene.add.existing(this);
    scene.physics.add.existing(this);

    this.body.setAllowGravity(false);
    this.body.setImmovable(true);
    this.body.setSize(28, 16);
    this.body.setOffset(2, 16);
  }
}
