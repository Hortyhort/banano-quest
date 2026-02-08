import Phaser from 'phaser';
import { COLORS } from '../config/gameConfig.ts';

const WALKER_SPEED = 80;
const JUMPER_SPEED = 60;
const JUMPER_HOP_INTERVAL = 2000;
const JUMPER_HOP_VELOCITY = -300;
const FLYER_SPEED = 50;
const FLYER_AMPLITUDE = 40;
const FLYER_FREQUENCY = 0.002;
const ENEMY_SCORE = 25;

export type EnemyType = 'walker' | 'jumper' | 'flyer';

export class Enemy extends Phaser.Physics.Arcade.Sprite {
  declare body: Phaser.Physics.Arcade.Body;

  private enemyType: EnemyType;
  private patrolWidth: number;
  private spawnX: number;
  private spawnY: number;
  private direction = 1;
  private isDead = false;
  private hopTimer = 0;
  private flyTimer = 0;

  constructor(scene: Phaser.Scene, x: number, y: number, type: EnemyType, patrolWidth = 200) {
    const textureMap: Record<EnemyType, string> = {
      walker: 'enemy-walker',
      jumper: 'enemy-jumper',
      flyer: 'enemy-flyer',
    };
    super(scene, x, y, textureMap[type]);

    this.enemyType = type;
    this.patrolWidth = patrolWidth;
    this.spawnX = x;
    this.spawnY = y;

    scene.add.existing(this);
    scene.physics.add.existing(this);

    this.body.setSize(28, 28);
    this.body.setOffset(2, 4);

    if (type === 'flyer') {
      this.body.setAllowGravity(false);
    }

    if (type === 'walker') {
      this.body.setVelocityX(WALKER_SPEED * this.direction);
    } else if (type === 'jumper') {
      this.body.setVelocityX(JUMPER_SPEED * this.direction);
    }
  }

  getIsDead(): boolean {
    return this.isDead;
  }

  stomp(): number {
    if (this.isDead) return 0;
    this.isDead = true;

    this.body.setVelocity(0, 0);
    this.body.setAllowGravity(false);
    this.body.enable = false;

    this.scene.tweens.add({
      targets: this,
      scaleY: 0.2,
      scaleX: 1.4,
      alpha: 0,
      duration: 300,
      ease: 'Power2',
      onComplete: () => this.destroy(),
    });

    // Death particles
    for (let i = 0; i < 6; i++) {
      const particle = this.scene.add.circle(
        this.x + Phaser.Math.Between(-10, 10),
        this.y,
        Phaser.Math.Between(3, 6),
        this.getColor(),
        0.8
      );
      this.scene.tweens.add({
        targets: particle,
        x: particle.x + Phaser.Math.Between(-40, 40),
        y: particle.y + Phaser.Math.Between(-40, 10),
        alpha: 0,
        scale: 0,
        duration: Phaser.Math.Between(300, 500),
        onComplete: () => particle.destroy(),
      });
    }

    return ENEMY_SCORE;
  }

  private getColor(): number {
    switch (this.enemyType) {
      case 'walker':
        return COLORS.ENEMY_PURPLE;
      case 'jumper':
        return COLORS.ENEMY_BLUE;
      case 'flyer':
        return COLORS.ENEMY_ORANGE;
    }
  }

  update(_time: number, delta: number) {
    if (this.isDead) return;

    switch (this.enemyType) {
      case 'walker':
        this.updateWalker();
        break;
      case 'jumper':
        this.updateJumper(delta);
        break;
      case 'flyer':
        this.updateFlyer(delta);
        break;
    }
  }

  private updateWalker() {
    const halfPatrol = this.patrolWidth / 2;

    if (this.x > this.spawnX + halfPatrol) {
      this.direction = -1;
    } else if (this.x < this.spawnX - halfPatrol) {
      this.direction = 1;
    }

    this.body.setVelocityX(WALKER_SPEED * this.direction);
    this.setFlipX(this.direction < 0);
  }

  private updateJumper(delta: number) {
    const halfPatrol = this.patrolWidth / 2;

    if (this.x > this.spawnX + halfPatrol) {
      this.direction = -1;
    } else if (this.x < this.spawnX - halfPatrol) {
      this.direction = 1;
    }

    this.body.setVelocityX(JUMPER_SPEED * this.direction);
    this.setFlipX(this.direction < 0);

    this.hopTimer += delta;
    const onGround = this.body.blocked.down || this.body.touching.down;
    if (this.hopTimer >= JUMPER_HOP_INTERVAL && onGround) {
      this.body.setVelocityY(JUMPER_HOP_VELOCITY);
      this.hopTimer = 0;
    }
  }

  private updateFlyer(delta: number) {
    this.flyTimer += delta;

    const halfPatrol = this.patrolWidth / 2;
    if (this.x > this.spawnX + halfPatrol) {
      this.direction = -1;
    } else if (this.x < this.spawnX - halfPatrol) {
      this.direction = 1;
    }

    this.body.setVelocityX(FLYER_SPEED * this.direction);
    this.setFlipX(this.direction < 0);

    this.y = this.spawnY + Math.sin(this.flyTimer * FLYER_FREQUENCY) * FLYER_AMPLITUDE;
  }
}

export function generateEnemyTextures(scene: Phaser.Scene) {
  // Walker — purple blob with eyes
  const walkerG = scene.add.graphics({ x: 0, y: 0 }).setVisible(false);
  walkerG.fillStyle(COLORS.ENEMY_PURPLE);
  walkerG.fillRoundedRect(0, 4, 32, 28, 6);
  walkerG.fillStyle(0xffffff);
  walkerG.fillCircle(10, 12, 5);
  walkerG.fillCircle(22, 12, 5);
  walkerG.fillStyle(0x000000);
  walkerG.fillCircle(12, 12, 3);
  walkerG.fillCircle(24, 12, 3);
  walkerG.generateTexture('enemy-walker', 32, 32);
  walkerG.destroy();

  // Jumper — blue with spring legs
  const jumperG = scene.add.graphics({ x: 0, y: 0 }).setVisible(false);
  jumperG.fillStyle(COLORS.ENEMY_BLUE);
  jumperG.fillRoundedRect(2, 0, 28, 24, 6);
  jumperG.fillStyle(0xffffff);
  jumperG.fillCircle(10, 8, 5);
  jumperG.fillCircle(22, 8, 5);
  jumperG.fillStyle(0x000000);
  jumperG.fillCircle(12, 8, 3);
  jumperG.fillCircle(24, 8, 3);
  // spring legs
  jumperG.lineStyle(3, 0x1565c0);
  jumperG.lineBetween(10, 24, 8, 32);
  jumperG.lineBetween(22, 24, 24, 32);
  jumperG.generateTexture('enemy-jumper', 32, 32);
  jumperG.destroy();

  // Flyer — orange with wings
  const flyerG = scene.add.graphics({ x: 0, y: 0 }).setVisible(false);
  flyerG.fillStyle(COLORS.ENEMY_ORANGE);
  flyerG.fillCircle(16, 16, 12);
  flyerG.fillStyle(0xffffff);
  flyerG.fillCircle(11, 13, 4);
  flyerG.fillCircle(21, 13, 4);
  flyerG.fillStyle(0x000000);
  flyerG.fillCircle(12, 13, 2);
  flyerG.fillCircle(22, 13, 2);
  // wings
  flyerG.fillStyle(COLORS.ENEMY_ORANGE, 0.6);
  flyerG.fillTriangle(4, 10, 0, 2, 12, 8);
  flyerG.fillTriangle(28, 10, 32, 2, 20, 8);
  flyerG.generateTexture('enemy-flyer', 32, 32);
  flyerG.destroy();

  // Spike texture
  const spikeG = scene.add.graphics({ x: 0, y: 0 }).setVisible(false);
  spikeG.fillStyle(COLORS.SPIKE_RED);
  for (let i = 0; i < 4; i++) {
    const sx = i * 16;
    spikeG.fillTriangle(sx, 32, sx + 8, 4, sx + 16, 32);
  }
  spikeG.fillStyle(0xff5252);
  for (let i = 0; i < 4; i++) {
    const sx = i * 16;
    spikeG.fillTriangle(sx + 3, 32, sx + 8, 10, sx + 13, 32);
  }
  spikeG.generateTexture('spike', 64, 32);
  spikeG.destroy();
}
