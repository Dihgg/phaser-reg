import Sprite = Phaser.Physics.Arcade.Sprite;
import { AnimationKeys } from '@constants';
import { Scene } from 'phaser';

type CharacterProps = {
  scene: Scene;
  x: number;
  y: number;
  width: number;
  height: number;
  frame: string;
  texture: string;
};

export class Character extends Sprite {
  private readonly textureKey: string;
  selector!: Phaser.Physics.Arcade.StaticBody;
  body!: Phaser.Physics.Arcade.Body;

  constructor({ scene, x, y, width, height, texture, frame }: CharacterProps) {
    super(scene, x, y, texture, frame);

    this.textureKey = texture;
    this.width = width;
    this.height = height;

    scene.add.existing(this);
    scene.physics.world.enable(this);
    this.setCollideWorldBounds(true);

    this.createWalkingAnimations();
    this.selector = scene.physics.add.staticBody(
      x - width / 2,
      y + height * 2,
      width,
      height,
    );
  }

  private createWalkingAnimations() {
    for (const animation of [
      AnimationKeys.Up,
      AnimationKeys.Down,
      AnimationKeys.Left,
      AnimationKeys.Right,
    ]) {
      const { anims } = this.scene;
      if (!anims.exists(animation)) {
        anims.create({
          key: animation,
          frames: anims.generateFrameNames(this.textureKey, {
            prefix: `walk-${animation}.`,
            start: 0,
            end: 3,
            zeroPad: 3,
          }),
          frameRate: 10,
          repeat: -1,
        });
      }
    }
  }

  public move(animation: AnimationKeys) {
    const { body, selector, width, height } = this;
    switch (animation) {
      case AnimationKeys.Left:
        selector.x = body.x - width;
        selector.y = body.y + height;
        break;

      case AnimationKeys.Right:
        selector.x = body.x + width;
        selector.y = body.y + height;
        break;

      case AnimationKeys.Up:
        selector.x = body.x + width;
        selector.y = body.y - height;
        break;

      case AnimationKeys.Down:
        selector.x = body.x + width;
        selector.y = body.y + height;
        break;
    }
  }

  update() {
    // const {anims, body} = this;
    // const prevVelocity = body.velocity.clone();
  }
}
