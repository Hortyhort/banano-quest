import Phaser from 'phaser';
import { AudioManager } from '../services/AudioManager.js';

export class Boss extends Phaser.Physics.Arcade.Sprite {
  constructor(scene, x, y) {
    super(scene, x, y, 'boss');

    scene.add.existing(this);
    scene.physics.add.existing(this);

    this.body.setSize(64, 56);
    this.body.setOffset(16, 20);
    this.body.setBounce(0);
    this.body.setCollideWorldBounds(true);

    this.maxHealth = 3;
    this.health = this.maxHealth;
    this.alive = true;
    this.scoreValue = 200;
    this.isInvincible = false;

    // Movement
    this.chargeSpeed = 180;
    this.direction = 1;
    this.state = 'idle'; // idle, charging, stunned
    this.stateTimer = 1500;
    this.patrolLeft = x - 200;
    this.patrolRight = x + 200;

    // Health bar
    this.healthBarBg = scene.add.graphics().setDepth(500);
    this.healthBarFg = scene.add.graphics().setDepth(501);
    this.drawHealthBar();

    // Idle animation
    this.idleTween = scene.tweens.add({
      targets: this,
      scaleY: 0.9,
      scaleX: 1.05,
      duration: 500,
      ease: 'Sine.easeInOut',
      yoyo: true,
      repeat: -1
    });

    this.body.setVelocityX(0);

    // Clean up health bar on scene shutdown
    scene.events.once('shutdown', () => {
      if (this.healthBarBg) { this.healthBarBg.destroy(); this.healthBarBg = null; }
      if (this.healthBarFg) { this.healthBarFg.destroy(); this.healthBarFg = null; }
    });
  }

  drawHealthBar() {
    const barWidth = 80;
    const barHeight = 8;
    const x = this.x - barWidth / 2;
    const y = this.y - 55;

    this.healthBarBg.clear();
    this.healthBarBg.fillStyle(0x000000, 0.5);
    this.healthBarBg.fillRoundedRect(x - 2, y - 2, barWidth + 4, barHeight + 4, 3);

    this.healthBarFg.clear();
    const healthPct = this.health / this.maxHealth;
    const color = healthPct > 0.5 ? 0x4CAF50 : healthPct > 0.25 ? 0xFFA000 : 0xFF1744;
    this.healthBarFg.fillStyle(color, 1);
    this.healthBarFg.fillRoundedRect(x, y, barWidth * healthPct, barHeight, 2);
  }

  update(time, delta) {
    if (!this.alive || !this.body) return;

    const dt = delta || 16;
    this.stateTimer -= dt;
    this.drawHealthBar();

    switch (this.state) {
      case 'idle':
        this.body.setVelocityX(0);
        if (this.stateTimer <= 0) {
          this.startCharge();
        }
        break;

      case 'charging':
        if (this.x >= this.patrolRight) {
          this.direction = -1;
          this.body.setVelocityX(-this.chargeSpeed);
          this.setFlipX(true);
        } else if (this.x <= this.patrolLeft) {
          this.direction = 1;
          this.body.setVelocityX(this.chargeSpeed);
          this.setFlipX(false);
        }

        if (this.stateTimer <= 0) {
          this.state = 'idle';
          this.stateTimer = 1200;
          this.body.setVelocityX(0);
          this.clearTint();
        }
        break;

      case 'stunned':
        this.body.setVelocityX(0);
        if (this.stateTimer <= 0) {
          this.isInvincible = false;
          this.clearTint();
          this.state = 'idle';
          this.stateTimer = 800;
        }
        break;
    }
  }

  startCharge() {
    this.state = 'charging';
    const player = this.scene.player;
    if (player && !player.isDead) {
      this.direction = player.x > this.x ? 1 : -1;
    }
    this.setFlipX(this.direction < 0);
    this.setTint(0xFF4444);
    this.body.setVelocityX(this.chargeSpeed * this.direction);
    this.stateTimer = 3000;
  }

  stomp() {
    if (!this.alive || this.isInvincible) return 0;

    this.health--;
    this.isInvincible = true;
    this.drawHealthBar();

    // Stun
    this.state = 'stunned';
    this.stateTimer = 1500;
    this.body.setVelocityX(0);

    // Flash
    this.scene.tweens.add({
      targets: this,
      alpha: { from: 1, to: 0.3 },
      duration: 100,
      yoyo: true,
      repeat: 5
    });

    AudioManager.playSound('enemy_stomp');
    this.scene.cameraShake(150, 0.01);

    if (this.health <= 0) {
      return this.defeat();
    }

    return 0;
  }

  defeat() {
    this.alive = false;
    this.body.enable = false;

    if (this.idleTween) this.idleTween.stop();

    // Epic death animation
    this.scene.tweens.add({
      targets: this,
      scaleX: 2,
      scaleY: 2,
      alpha: 0,
      angle: 720,
      duration: 1000,
      ease: 'Power2',
      onComplete: () => {
        if (this.healthBarBg) this.healthBarBg.destroy();
        if (this.healthBarFg) this.healthBarFg.destroy();
        this.destroy();
      }
    });

    // Explosion particles
    const colors = [0xFF9800, 0xFF5722, 0xFFEB3B, 0xF44336, 0xFFFFFF];
    for (let i = 0; i < 20; i++) {
      const size = Phaser.Math.Between(4, 10);
      const color = Phaser.Utils.Array.GetRandom(colors);
      const p = this.scene.add.circle(this.x, this.y, size, color, 0.9);
      const angle = (i / 20) * Math.PI * 2;
      const dist = Phaser.Math.Between(60, 120);
      this.scene.tweens.add({
        targets: p,
        x: this.x + Math.cos(angle) * dist,
        y: this.y + Math.sin(angle) * dist - 30,
        alpha: 0,
        scale: 0,
        duration: Phaser.Math.Between(500, 900),
        ease: 'Power2',
        onComplete: () => p.destroy()
      });
    }

    this.scene.cameraShake(400, 0.02);
    AudioManager.vibrate([50, 30, 80, 30, 100]);

    // Emit boss defeated event
    this.scene.events.emit('bossDefeated');

    return this.scoreValue;
  }
}
