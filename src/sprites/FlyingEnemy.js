import Phaser from 'phaser';

export class FlyingEnemy extends Phaser.Physics.Arcade.Sprite {
  constructor(scene, x, y, config = {}) {
    super(scene, x, y, 'flying_enemy');

    scene.add.existing(this);
    scene.physics.add.existing(this);

    this.body.setAllowGravity(false);
    this.body.setSize(36, 28);
    this.body.setOffset(6, 6);

    this.startX = x;
    this.startY = y;
    this.patrolDistance = config.patrolDistance || 120;
    this.patrolSpeed = config.speed || 50;
    this.sineAmplitude = config.amplitude || 40;
    this.sineFrequency = config.frequency || 0.003;
    this.direction = 1;
    this.alive = true;
    this.scoreValue = 35;
    this.elapsed = 0;

    this.body.setVelocityX(this.patrolSpeed * this.direction);

    // Wing flap animation
    scene.tweens.add({
      targets: this,
      scaleY: 0.8,
      scaleX: 1.1,
      duration: 200,
      ease: 'Sine.easeInOut',
      yoyo: true,
      repeat: -1
    });
  }

  update(time, delta) {
    if (!this.alive || !this.body) return;

    this.elapsed += delta || 16;

    // Horizontal patrol
    if (this.x >= this.startX + this.patrolDistance) {
      this.direction = -1;
      this.body.setVelocityX(-this.patrolSpeed);
      this.setFlipX(true);
    } else if (this.x <= this.startX - this.patrolDistance) {
      this.direction = 1;
      this.body.setVelocityX(this.patrolSpeed);
      this.setFlipX(false);
    }

    // Sine wave vertical movement
    const sineOffset = Math.sin(this.elapsed * this.sineFrequency) * this.sineAmplitude;
    this.y = this.startY + sineOffset;
  }

  stomp() {
    if (!this.alive) return 0;
    this.alive = false;
    this.body.setVelocity(0, 0);
    this.body.setAllowGravity(false);
    this.body.enable = false;

    // Spin out animation
    this.scene.tweens.add({
      targets: this,
      scaleY: 0.1,
      scaleX: 1.5,
      alpha: 0,
      angle: 720,
      y: this.y + 30,
      duration: 400,
      ease: 'Power2',
      onComplete: () => this.destroy()
    });

    // Purple particles
    for (let i = 0; i < 6; i++) {
      const particle = this.scene.add.circle(
        this.x + Phaser.Math.Between(-10, 10),
        this.y,
        Phaser.Math.Between(3, 6),
        0x7E57C2
      );
      const angle = (i / 6) * Math.PI * 2;
      this.scene.tweens.add({
        targets: particle,
        x: this.x + Math.cos(angle) * 40,
        y: this.y + Math.sin(angle) * 30 - 15,
        alpha: 0,
        scale: 0,
        duration: 400,
        ease: 'Power2',
        onComplete: () => particle.destroy()
      });
    }

    return this.scoreValue;
  }
}
