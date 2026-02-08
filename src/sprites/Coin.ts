import Phaser from 'phaser';
import { COIN, COLORS } from '../config/gameConfig.ts';

const PARTICLE_COUNT = 8;
const PARTICLE_DISTANCE = 50;

export class Coin extends Phaser.Physics.Arcade.Sprite {
  declare body: Phaser.Physics.Arcade.Body;

  readonly value: number = COIN.SCORE_VALUE;
  private floatTween: Phaser.Tweens.Tween;
  private shimmerTween: Phaser.Tweens.Tween;

  constructor(scene: Phaser.Scene, x: number, y: number) {
    super(scene, x, y, 'coin');

    scene.add.existing(this);
    scene.physics.add.existing(this);

    this.body.setAllowGravity(false);
    this.body.setCircle(COIN.RADIUS);

    this.floatTween = scene.tweens.add({
      targets: this,
      y: y - 10,
      duration: 1000 + Math.random() * 500,
      ease: 'Sine.easeInOut',
      yoyo: true,
      repeat: -1,
    });

    scene.tweens.add({
      targets: this,
      angle: 360,
      duration: 3000,
      repeat: -1,
    });

    this.shimmerTween = scene.tweens.add({
      targets: this,
      alpha: { from: 1, to: 0.7 },
      duration: 500,
      ease: 'Sine.easeInOut',
      yoyo: true,
      repeat: -1,
    });
  }

  collect(): number {
    this.floatTween.stop();
    this.shimmerTween.stop();

    this.scene.tweens.add({
      targets: this,
      y: this.y - 50,
      alpha: 0,
      scaleX: 1.5,
      scaleY: 1.5,
      duration: 300,
      ease: 'Power2',
      onComplete: () => {
        this.destroy();
      },
    });

    for (let i = 0; i < PARTICLE_COUNT; i++) {
      const particle = this.scene.add.circle(this.x, this.y, 4, COLORS.BANANO_YELLOW);
      const angle = (i / PARTICLE_COUNT) * Math.PI * 2;

      this.scene.tweens.add({
        targets: particle,
        x: this.x + Math.cos(angle) * PARTICLE_DISTANCE,
        y: this.y + Math.sin(angle) * PARTICLE_DISTANCE,
        alpha: 0,
        scale: 0,
        duration: 400,
        ease: 'Power2',
        onComplete: () => particle.destroy(),
      });
    }

    return this.value;
  }
}
