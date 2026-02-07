import Phaser from 'phaser';

export class FallingPlatform extends Phaser.Physics.Arcade.Image {
  constructor(scene, x, y, config = {}) {
    super(scene, x, y, 'platform');

    scene.add.existing(this);
    scene.physics.add.existing(this);

    this.body.setImmovable(true);
    this.body.setAllowGravity(false);
    this.setDisplaySize(config.width || 64, 32);
    this.body.setSize(config.width || 64, 32);

    this.startX = x;
    this.startY = y;
    this.falling = false;
    this.respawnDelay = config.respawnDelay || 3000;
    this.shakeTime = config.shakeTime || 500;
    this.shakeTween = null;
  }

  triggerFall() {
    if (this.falling) return;
    this.falling = true;

    // Visual warning: tint red slightly
    this.setTint(0xFF8A80);

    // Shake for 0.5s
    this.shakeTween = this.scene.tweens.add({
      targets: this,
      x: { from: this.startX - 3, to: this.startX + 3 },
      duration: 50,
      yoyo: true,
      repeat: Math.floor(this.shakeTime / 100),
      onComplete: () => {
        // Fall
        this.body.setImmovable(false);
        this.body.setAllowGravity(true);

        // Fade out as it falls
        this.scene.tweens.add({
          targets: this,
          alpha: 0,
          duration: 600,
          onComplete: () => {
            // Hide and schedule respawn
            this.setActive(false);
            this.setVisible(false);
            this.body.enable = false;

            this.scene.time.delayedCall(this.respawnDelay, () => {
              this.respawn();
            });
          }
        });
      }
    });
  }

  respawn() {
    if (!this.scene || !this.scene.sys.isActive()) return;
    this.setPosition(this.startX, this.startY);
    this.setAlpha(0);
    this.clearTint();
    this.body.enable = true;
    this.body.setImmovable(true);
    this.body.setAllowGravity(false);
    this.body.setVelocity(0, 0);
    this.setActive(true);
    this.setVisible(true);
    this.falling = false;

    // Fade back in
    this.scene.tweens.add({
      targets: this,
      alpha: 1,
      duration: 400
    });
  }
}
