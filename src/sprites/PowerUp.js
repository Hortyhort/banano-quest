import Phaser from 'phaser';

export class PowerUp extends Phaser.Physics.Arcade.Sprite {
  constructor(scene, x, y, type) {
    const textureMap = {
      speed: 'powerup_speed',
      doubleJump: 'powerup_jump',
      magnet: 'powerup_magnet'
    };
    super(scene, x, y, textureMap[type] || 'powerup_speed');

    scene.add.existing(this);
    scene.physics.add.existing(this);

    this.type = type;
    this.body.setAllowGravity(false);
    this.body.setCircle(16);

    // Pop up from block
    this.setScale(0);
    scene.tweens.add({
      targets: this,
      y: y - 60,
      scaleX: 1,
      scaleY: 1,
      duration: 400,
      ease: 'Back.easeOut'
    });

    // Float after pop
    scene.tweens.add({
      targets: this,
      y: y - 70,
      duration: 1000,
      ease: 'Sine.easeInOut',
      yoyo: true,
      repeat: -1,
      delay: 400
    });

    // Rotation
    scene.tweens.add({
      targets: this,
      angle: 360,
      duration: 2000,
      repeat: -1
    });

    // Shimmer
    scene.tweens.add({
      targets: this,
      alpha: { from: 1, to: 0.6 },
      duration: 300,
      yoyo: true,
      repeat: -1
    });
  }

  collect() {
    // Collection burst
    const colors = {
      speed: 0x42A5F5,
      doubleJump: 0xFFFFFF,
      magnet: 0xFFEB3B
    };
    const color = colors[this.type] || 0xFFFFFF;

    for (let i = 0; i < 10; i++) {
      const size = Phaser.Math.Between(3, 6);
      const p = this.scene.add.circle(this.x, this.y, size, color, 0.9);
      const angle = (i / 10) * Math.PI * 2;
      const dist = Phaser.Math.Between(30, 60);
      this.scene.tweens.add({
        targets: p,
        x: this.x + Math.cos(angle) * dist,
        y: this.y + Math.sin(angle) * dist,
        alpha: 0,
        scale: 0,
        duration: 400,
        ease: 'Power2',
        onComplete: () => p.destroy()
      });
    }

    this.destroy();
    return this.type;
  }
}
