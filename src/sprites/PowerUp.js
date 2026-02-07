import Phaser from 'phaser';

const POWER_UP_TYPES = {
  SPEED: { color: 0xFF5722, label: 'SPEED', duration: 6000 },
  DOUBLE_JUMP: { color: 0x2196F3, label: '2xJUMP', duration: 10000 },
  MAGNET: { color: 0x9C27B0, label: 'MAGNET', duration: 8000 },
  SHIELD: { color: 0x4FC3F7, label: 'SHIELD', duration: 0 } // until hit
};

export class PowerUp extends Phaser.Physics.Arcade.Sprite {
  constructor(scene, x, y, type) {
    super(scene, x, y, `powerup-${type.toLowerCase()}`);

    scene.add.existing(this);
    scene.physics.add.existing(this);

    this.body.setAllowGravity(false);
    this.body.setCircle(16);
    this.body.setOffset(0, 0);

    this.powerType = type;
    this.config = POWER_UP_TYPES[type];

    // Float animation
    this.floatTween = scene.tweens.add({
      targets: this,
      y: y - 8,
      duration: 1200 + Math.random() * 400,
      ease: 'Sine.easeInOut',
      yoyo: true,
      repeat: -1
    });

    // Glow pulse
    scene.tweens.add({
      targets: this,
      alpha: { from: 1, to: 0.6 },
      duration: 600,
      yoyo: true,
      repeat: -1
    });
  }

  collect(player) {
    // Stop animations
    if (this.floatTween) this.floatTween.stop();

    // Apply effect
    switch (this.powerType) {
      case 'SPEED':
        player.hasSpeedBoost = true;
        this.scene.time.delayedCall(this.config.duration, () => {
          player.hasSpeedBoost = false;
        });
        break;
      case 'DOUBLE_JUMP':
        player.hasDoubleJump = true;
        this.scene.time.delayedCall(this.config.duration, () => {
          player.hasDoubleJump = false;
        });
        break;
      case 'MAGNET':
        player.hasMagnet = true;
        this.scene.time.delayedCall(this.config.duration, () => {
          player.hasMagnet = false;
        });
        break;
      case 'SHIELD':
        player.activateShield();
        break;
    }

    // Pickup label
    const label = this.scene.add.text(this.x, this.y - 20, this.config.label, {
      fontFamily: 'Arial Black, Arial',
      fontSize: '16px',
      color: '#FFFFFF',
      stroke: '#000000',
      strokeThickness: 3
    }).setOrigin(0.5);

    this.scene.tweens.add({
      targets: label,
      y: label.y - 40,
      alpha: 0,
      duration: 800,
      onComplete: () => label.destroy()
    });

    // Audio
    if (this.scene.audioManager) {
      this.scene.audioManager.playPowerUp();
    }

    // Burst particles in power-up color
    for (let i = 0; i < 10; i++) {
      const angle = (i / 10) * Math.PI * 2;
      const p = this.scene.add.circle(this.x, this.y, 4, this.config.color, 0.9);
      this.scene.tweens.add({
        targets: p,
        x: this.x + Math.cos(angle) * 50,
        y: this.y + Math.sin(angle) * 50,
        alpha: 0,
        scale: 0,
        duration: 400,
        ease: 'Power2',
        onComplete: () => p.destroy()
      });
    }

    this.destroy();
  }
}

export { POWER_UP_TYPES };
