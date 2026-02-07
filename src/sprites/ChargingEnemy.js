import Phaser from 'phaser';

export class ChargingEnemy extends Phaser.Physics.Arcade.Sprite {
  constructor(scene, x, y, config = {}) {
    super(scene, x, y, 'charging_enemy');

    scene.add.existing(this);
    scene.physics.add.existing(this);

    this.body.setSize(40, 32);
    this.body.setOffset(4, 8);
    this.body.setBounce(0);
    this.body.setCollideWorldBounds(true);

    this.spawnX = x;
    this.startX = x;
    this.detectionRange = config.detectionRange || 200;
    this.chargeSpeed = config.chargeSpeed || 200;
    this.alive = true;
    this.scoreValue = 40;
    this.isCharging = false;
    this.chargeCooldown = 0;

    // Idle animation - menacing pulse
    this.idleTween = scene.tweens.add({
      targets: this,
      scaleY: 0.9,
      scaleX: 1.1,
      duration: 600,
      ease: 'Sine.easeInOut',
      yoyo: true,
      repeat: -1
    });
  }

  update(time, delta) {
    if (!this.alive || !this.body) return;

    const player = this.scene.player;
    if (!player || player.isDead) {
      this.body.setVelocityX(0);
      return;
    }

    const dt = delta || 16;

    if (this.chargeCooldown > 0) {
      this.chargeCooldown -= dt;
      return;
    }

    const dist = Phaser.Math.Distance.Between(this.x, this.y, player.x, player.y);

    if (!this.isCharging && dist < this.detectionRange) {
      this.isCharging = true;
      const chargeDirection = player.x > this.x ? 1 : -1;
      this.setFlipX(chargeDirection < 0);

      // Wind-up flash
      this.setTint(0xFF4444);
      this.scene.tweens.add({
        targets: this,
        scaleX: 1.3,
        scaleY: 0.7,
        duration: 200,
        yoyo: true,
        onComplete: () => {
          if (this.alive && this.body) {
            this.body.setVelocityX(this.chargeSpeed * chargeDirection);
          }
        }
      });
    }

    if (this.isCharging) {
      if (Math.abs(this.x - this.startX) > 300) {
        this.isCharging = false;
        this.body.setVelocityX(0);
        this.clearTint();
        this.chargeCooldown = 1500;
        this.startX = this.spawnX;
      }
    }
  }

  stomp() {
    if (!this.alive) return 0;
    this.alive = false;
    this.body.setVelocity(0, 0);
    this.body.setAllowGravity(false);
    this.body.enable = false;

    if (this.idleTween) this.idleTween.stop();

    // Slam animation
    this.scene.tweens.add({
      targets: this,
      scaleY: 0.1,
      scaleX: 2,
      alpha: 0,
      y: this.y + 16,
      duration: 300,
      ease: 'Power2',
      onComplete: () => this.destroy()
    });

    // Red particles
    for (let i = 0; i < 6; i++) {
      const particle = this.scene.add.circle(
        this.x + Phaser.Math.Between(-10, 10),
        this.y,
        Phaser.Math.Between(3, 6),
        0xF44336
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
