import Phaser from 'phaser';

export class Enemy extends Phaser.Physics.Arcade.Sprite {
  constructor(scene, x, y, config = {}) {
    super(scene, x, y, 'slime');

    scene.add.existing(this);
    scene.physics.add.existing(this);

    this.body.setSize(36, 28);
    this.body.setOffset(6, 12);
    this.body.setBounce(0);
    this.body.setCollideWorldBounds(true);

    // Patrol config
    this.startX = x;
    this.patrolDistance = config.patrolDistance || 100;
    this.patrolSpeed = config.speed || 60;
    this.direction = 1;
    this.alive = true;
    this.scoreValue = 25;

    // Start moving
    this.body.setVelocityX(this.patrolSpeed * this.direction);

    // Idle animation — gentle squash-stretch
    scene.tweens.add({
      targets: this,
      scaleY: 0.85,
      scaleX: 1.15,
      duration: 400,
      ease: 'Sine.easeInOut',
      yoyo: true,
      repeat: -1
    });
  }

  update() {
    if (!this.alive || !this.body) return;

    // Reverse direction at patrol bounds
    if (this.x >= this.startX + this.patrolDistance) {
      this.direction = -1;
      this.body.setVelocityX(-this.patrolSpeed);
      this.setFlipX(true);
    } else if (this.x <= this.startX - this.patrolDistance) {
      this.direction = 1;
      this.body.setVelocityX(this.patrolSpeed);
      this.setFlipX(false);
    }
  }

  stomp() {
    if (!this.alive) return 0;
    this.alive = false;
    this.body.setVelocity(0, 0);
    this.body.setAllowGravity(false);
    this.body.enable = false;

    // Squish animation
    this.scene.tweens.add({
      targets: this,
      scaleY: 0.1,
      scaleX: 1.8,
      alpha: 0,
      y: this.y + 16,
      duration: 300,
      ease: 'Power2',
      onComplete: () => this.destroy()
    });

    // Green goo particles
    for (let i = 0; i < 6; i++) {
      const particle = this.scene.add.circle(
        this.x + Phaser.Math.Between(-10, 10),
        this.y,
        Phaser.Math.Between(3, 6),
        0x4CAF50
      );
      const angle = (i / 6) * Math.PI * 2;
      this.scene.tweens.add({
        targets: particle,
        x: this.x + Math.cos(angle) * 40,
        y: this.y + Math.sin(angle) * 30 - 10,
        alpha: 0,
        scale: 0,
        duration: 350,
        ease: 'Power2',
        onComplete: () => particle.destroy()
      });
    }

    return this.scoreValue;
  }
}
