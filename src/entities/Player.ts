import { AnimationKeys, key } from '@constants';
import Phaser from 'phaser';

type Cursors = Record<
  'w' | 'a' | 's' | 'd' | 'up' | 'left' | 'down' | 'right' | 'space',
  Phaser.Input.Keyboard.Key
>;

const Velocity = {
  Horizontal: 175,
  Vertical: 175,
} as const;

export class Player extends Phaser.Physics.Arcade.Sprite {
  body!: Phaser.Physics.Arcade.Body;
  cursors: Cursors;
  selector: Phaser.Physics.Arcade.StaticBody;

  constructor(
    scene: Phaser.Scene,
    x: number,
    y: number,
    texture = key.atlas.player,
    frame = 'misa-front',
  ) {
    super(scene, x, y, texture, frame);

    // Add the sprite to the scene
    scene.add.existing(this);

    // Enable physics for the sprite
    scene.physics.world.enable(this);

    // The image has a bit of whitespace so use setSize and
    // setOffset to control the size of the player's body
    this.setSize(32, 42).setOffset(0, 22);

    // Collide the sprite body with the world boundary
    this.setCollideWorldBounds(true);

    // Set the camera to follow the game object
    scene.cameras.main.startFollow(this);
    scene.cameras.main.setZoom(1);

    // Add cursor keys
    this.cursors = this.createCursorKeys();

    // Create sprite animations
    this.createAnimations();

    // Add selector
    this.selector = scene.physics.add.staticBody(x - 8, y + 32, 16, 16);
  }

  /**
   * Track the arrow keys & WASD.
   */
  private createCursorKeys() {
    return this.scene.input.keyboard!.addKeys(
      'w,a,s,d,up,left,down,right,space',
    ) as Cursors;
  }

  private createAnimations() {
    const anims = this.scene.anims;

    // Create left animation
    if (!anims.exists(AnimationKeys.Left)) {
      anims.create({
        key: AnimationKeys.Left,
        frames: anims.generateFrameNames(key.atlas.player, {
          prefix: 'misa-left-walk.',
          start: 0,
          end: 3,
          zeroPad: 3,
        }),
        frameRate: 10,
        repeat: -1,
      });
    }

    // Create right animation
    if (!anims.exists(AnimationKeys.Right)) {
      anims.create({
        key: AnimationKeys.Right,
        frames: anims.generateFrameNames(key.atlas.player, {
          prefix: 'misa-right-walk.',
          start: 0,
          end: 3,
          zeroPad: 3,
        }),
        frameRate: 10,
        repeat: -1,
      });
    }

    // Create up animation
    if (!anims.exists(AnimationKeys.Up)) {
      anims.create({
        key: AnimationKeys.Up,
        frames: anims.generateFrameNames(key.atlas.player, {
          prefix: 'misa-back-walk.',
          start: 0,
          end: 3,
          zeroPad: 3,
        }),
        frameRate: 10,
        repeat: -1,
      });
    }

    // Create down animation
    if (!anims.exists(AnimationKeys.Down)) {
      anims.create({
        key: AnimationKeys.Down,
        frames: anims.generateFrameNames(key.atlas.player, {
          prefix: 'misa-front-walk.',
          start: 0,
          end: 3,
          zeroPad: 3,
        }),
        frameRate: 10,
        repeat: -1,
      });
    }
  }

  private moveSelector(animation: AnimationKeys) {
    const { body, selector } = this;

    switch (animation) {
      case AnimationKeys.Left:
        selector.x = body.x - 19;
        selector.y = body.y + 14;
        break;

      case AnimationKeys.Right:
        selector.x = body.x + 35;
        selector.y = body.y + 14;
        break;

      case AnimationKeys.Up:
        selector.x = body.x + 8;
        selector.y = body.y - 18;
        break;

      case AnimationKeys.Down:
        selector.x = body.x + 8;
        selector.y = body.y + 46;
        break;
    }
  }

  update() {
    const { anims, body, cursors } = this;
    const prevVelocity = body.velocity.clone();

    // Stop any previous movement from the last frame
    body.setVelocity(0);

    // Horizontal movement
    switch (true) {
      case cursors.left.isDown:
      case cursors.a.isDown:
        body.setVelocityX(-Velocity.Horizontal);
        break;

      case cursors.right.isDown:
      case cursors.d.isDown:
        body.setVelocityX(Velocity.Horizontal);
        break;
    }

    // Vertical movement
    switch (true) {
      case cursors.up.isDown:
      case cursors.w.isDown:
        body.setVelocityY(-Velocity.Vertical);
        break;

      case cursors.down.isDown:
      case cursors.s.isDown:
        body.setVelocityY(Velocity.Vertical);
        break;
    }

    // Normalize and scale the velocity so that player can't move faster along a diagonal
    body.velocity.normalize().scale(Velocity.Horizontal);

    // Update the animation last and give left/right animations precedence over up/down animations
    switch (true) {
      case cursors.left.isDown:
      case cursors.a.isDown:
        anims.play(AnimationKeys.Left, true);
        this.moveSelector(AnimationKeys.Left);
        break;

      case cursors.right.isDown:
      case cursors.d.isDown:
        anims.play(AnimationKeys.Right, true);
        this.moveSelector(AnimationKeys.Right);
        break;

      case cursors.up.isDown:
      case cursors.w.isDown:
        anims.play(AnimationKeys.Up, true);
        this.moveSelector(AnimationKeys.Up);
        break;

      case cursors.down.isDown:
      case cursors.s.isDown:
        anims.play(AnimationKeys.Down, true);
        this.moveSelector(AnimationKeys.Down);
        break;

      default:
        anims.stop();

        // If we were moving, pick an idle frame to use
        switch (true) {
          case prevVelocity.x < 0:
            this.setTexture(key.atlas.player, 'misa-left');
            this.moveSelector(AnimationKeys.Left);
            break;

          case prevVelocity.x > 0:
            this.setTexture(key.atlas.player, 'misa-right');
            this.moveSelector(AnimationKeys.Right);
            break;

          case prevVelocity.y < 0:
            this.setTexture(key.atlas.player, 'misa-back');
            this.moveSelector(AnimationKeys.Up);
            break;

          case prevVelocity.y > 0:
            this.setTexture(key.atlas.player, 'misa-front');
            this.moveSelector(AnimationKeys.Down);
            break;
        }
    }
  }
}
