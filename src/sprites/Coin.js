import Phaser from 'phaser';
import { COIN } from '../config/gameConfig.js';

export class Coin extends Phaser.Physics.Arcade.Sprite {
  constructor(scene, x, y) {
    super(scene, x, y, 'coin');

    scene.add.existing(this);
    scene.physics.add.existing(this);

    this.body.setAllowGravity(false);
    this.body.setCircle(COIN.RADIUS);

    this.value = COIN.SCORE_VALUE;

    // Float animation
    this.floatTween = scene.tweens.add({
      targets: this,
      y: y - 10,
      duration: 1000 + Math.random() * 500,
      ease: 'Sine.easeInOut',
      yoyo: true,
      repeat: -1
    });

    // Rotation
    scene.tweens.add({
      targets: this,
      angle: 360,
      duration: 3000,
      repeat: -1
    });

    // Shimmer
    this.shimmerTween = scene.tweens.add({
      targets: this,
      alpha: { from: 1, to: 0.7 },
      duration: 500,
      ease: 'Sine.easeInOut',
      yoyo: true,
      repeat: -1
    });
  }

  collect() {
    if (this.floatTween) this.floatTween.stop();
    if (this.shimmerTween) this.shimmerTween.stop();

    // Collection animation
    this.scene.tweens.add({
      targets: this,
      y: this.y - 50,
      alpha: 0,
      scaleX: 1.5,
      scaleY: 1.5,
      duration: 300,
      ease: 'Power2',
      onComplete: () => this.destroy()
    });

    // Burst particles
    for (let i = 0; i < 8; i++) {
      const angle = (i / 8) * Math.PI * 2;
      const p = this.scene.add.circle(this.x, this.y, 4, 0xFFEB3B);
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

    return this.value;
  }
}
