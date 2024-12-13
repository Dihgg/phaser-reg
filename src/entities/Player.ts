import { Directions, key } from '@constants';
import Phaser, { Scene } from 'phaser';

import { Character } from './Character';

type Cursors = Record<
  'w' | 'a' | 's' | 'd' | 'up' | 'left' | 'down' | 'right' | 'space',
  Phaser.Input.Keyboard.Key
>;

type PlayerProps = {
  scene: Scene;
  x: number;
  y: number;
};

export class Player extends Character {
  cursors: Cursors;

  constructor({ scene, x, y }: PlayerProps) {
    super({
      scene: scene,
      x,
      y,
      width: 32,
      height: 36,
      texture: key.atlas.ninja.name,
    });

    // Set the camera to follow the game object
    scene.cameras.main.startFollow(this);
    scene.cameras.main.setZoom(1);

    // Add cursor keys
    this.cursors = this.createCursorKeys();
  }

  /**
   * Track the arrow keys & WASD.
   */
  private createCursorKeys() {
    return this.scene.input.keyboard!.addKeys(
      'w,a,s,d,up,left,down,right,space',
    ) as Cursors;
  }

  update() {
    const { cursors } = this;

    switch (true) {
      case cursors.left.isDown:
      case cursors.a.isDown:
        // body.setVelocityX(-Velocity.Horizontal);
        this.move(Directions.Left);
        break;
      case cursors.right.isDown:
      case cursors.d.isDown:
        this.move(Directions.Right);
        break;
      case cursors.up.isDown:
      case cursors.w.isDown:
        this.move(Directions.Up);
        break;
      case cursors.down.isDown:
      case cursors.s.isDown:
        this.move(Directions.Down);
        break;
      default:
        this.move();
        break;
    }
  }
}
