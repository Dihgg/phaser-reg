import Sprite = Phaser.Physics.Arcade.Sprite;
import { Directions } from '@constants';
import { Scene } from 'phaser';

type CharacterProps = {
  scene: Scene;
  x: number;
  y: number;
  width: number;
  height: number;
  texture: string;
  velocity?: number;
};

export class Character extends Sprite {
  private readonly textureKey: string;
  private velocity: number;
  body!: Phaser.Physics.Arcade.Body;

  constructor({
    scene,
    x,
    y,
    width,
    height,
    texture,
    velocity = 175,
  }: CharacterProps) {
    super(scene, x, y, texture);

    this.width = width;
    this.height = height;

    this.textureKey = texture;
    this.velocity = velocity;

    scene.add.existing(this);
    scene.physics.world.enable(this);
    this.setCollideWorldBounds(true);

    this.createWalkingAnimations();
  }

  private createWalkingAnimations() {
    for (const animation of [
      Directions.Up,
      Directions.Down,
      Directions.Left,
      Directions.Right,
    ]) {
      const { anims } = this.scene;
      if (!anims.exists(animation)) {
        anims.create({
          key: animation,
          frames: anims.generateFrameNames(this.textureKey, {
            prefix: `walk-${animation}.`,
            start: 0,
            end: 2,
            zeroPad: 3,
          }),
          frameRate: 10,
          repeat: -1,
        });
      }
    }
  }

  public move(animation?: Directions) {
    const { anims, body, velocity } = this;
    body.setVelocity(0);

    switch (animation) {
      case Directions.Up:
        body.setVelocityY(-velocity);
        break;
      case Directions.Down:
        body.setVelocityY(velocity);
        break;
      case Directions.Left:
        body.setVelocityX(-velocity);
        break;
      case Directions.Right:
        body.setVelocityX(velocity);
        break;
    }
    body.velocity.normalize().scale(velocity);
    if (animation) {
      anims.play(animation, true);
    } else {
      anims.stop();
    }
  }

  update() {
    // const {anims, body} = this;
    // const prevVelocity = body.velocity.clone();
  }
}
