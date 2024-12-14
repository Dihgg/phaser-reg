import { Direction } from 'grid-engine';

import { Character, CharacterProps } from './Character';

type PlayerProps = CharacterProps;

type Cursors = Record<
  | 'w'
  | 'a'
  | 's'
  | 'd'
  | 'up'
  | 'left'
  | 'down'
  | 'right'
  | 'space'
  | 'z'
  | 'x',
  Phaser.Input.Keyboard.Key
>;

/**
 * Represents a player character in the game.
 * @extends Character
 */
export class Player extends Character {
  /**
   * The cursor keys for controlling the player.
   * @type {Cursors}
   */
  cursors: Cursors;

  /**
   * Creates an instance of Player.
   * @param {PlayerProps} props - The properties for the player character.
   */
  constructor(props: PlayerProps) {
    super(props);
    this.cursors = this.createCursorKeys();
    this.scene.cameras.main.startFollow(this, true);
    this.scene.cameras.main.setFollowOffset(-this.width, -this.height);
  }

  /**
   * Player update routines
   */
  update() {
    this.updateMovement();
  }

  /**
   * Creates the cursor keys for controlling the player.
   * @returns {Cursors} The cursor keys.
   * @private
   */
  private createCursorKeys(): Cursors {
    return this.scene.input.keyboard!.addKeys(
      'w,a,s,d,up,left,down,right,space,z,x',
    ) as Cursors;
  }

  /**
   * Updates the player's movement based on the cursor keys.
   */
  private updateMovement() {
    const { cursors } = this;
    switch (true) {
      case cursors.left.isDown:
      case cursors.a.isDown:
        this.move(Direction.LEFT);
        break;
      case cursors.right.isDown:
      case cursors.d.isDown:
        this.move(Direction.RIGHT);
        break;
      case cursors.up.isDown:
      case cursors.w.isDown:
        this.move(Direction.UP);
        break;
      case cursors.down.isDown:
      case cursors.s.isDown:
        this.move(Direction.DOWN);
        break;
    }
  }
}
