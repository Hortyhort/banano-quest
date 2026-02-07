import Phaser from 'phaser';

export class Spike extends Phaser.Physics.Arcade.Sprite {
  constructor(scene, x, y) {
    super(scene, x, y, 'spike');

    scene.add.existing(this);
    scene.physics.add.existing(this, true); // static body

    this.body.setSize(32, 20);
    this.body.setOffset(8, 12);
  }
}
