import Phaser from 'phaser';
import { AudioManager } from '../services/AudioManager.js';

export class QuestionBlock extends Phaser.Physics.Arcade.Sprite {
  constructor(scene, x, y, config = {}) {
    super(scene, x, y, 'question_block');

    scene.add.existing(this);
    scene.physics.add.existing(this, true); // static body

    this.powerUpType = config.powerUpType || 'speed';
    this.used = false;

    // Subtle float animation
    this.floatTween = scene.tweens.add({
      targets: this,
      y: y - 3,
      duration: 800,
      ease: 'Sine.easeInOut',
      yoyo: true,
      repeat: -1
    });

    // Shimmer
    scene.tweens.add({
      targets: this,
      alpha: { from: 1, to: 0.8 },
      duration: 600,
      yoyo: true,
      repeat: -1
    });
  }

  hit(scene) {
    if (this.used) return null;
    this.used = true;

    // Change to used block texture
    this.setTexture('used_block');
    this.setAlpha(1);

    // Stop float animation and bump up
    if (this.floatTween) this.floatTween.stop();
    scene.tweens.killTweensOf(this);
    const origY = this.y;
    scene.tweens.add({
      targets: this,
      y: origY - 12,
      duration: 100,
      yoyo: true,
      ease: 'Power2'
    });

    AudioManager.playSound('powerup_collect');

    return this.powerUpType;
  }
}
