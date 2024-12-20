import Sprite = Phaser.GameObjects.Sprite;
import {
  Direction,
  FollowOptions,
  GridEngine,
  MoveToConfig,
  Position,
} from 'grid-engine';
import { Scene } from 'phaser';

export interface CharacterProps {
  scene: Scene;
  id: string;
  textureName: string;
  gridEngine: GridEngine;
  x?: number;
  y?: number;
  scale?: number;
  speed?: number;
  walkingAnimationMapping?: number;
  facingDirection?: Direction;
}

/**
 * Represents a character in the game.
 * @extends Phaser.GameObjects.Sprite
 */
export class Character extends Sprite {
  /**
   * The unique identifier for the character.
   * @type {string}
   * @public
   */
  public readonly id: string;

  /**
   * The GridEngine instance for character movement.
   * @type {GridEngine}
   * @public
   */
  protected _gridEngine!: GridEngine;
  set gridEngine(gridEngine: GridEngine) {
    this._gridEngine = gridEngine;
  }
  get gridEngine() {
    return this._gridEngine;
  }

  /**
   * Creates an instance of Character.
   * @param {CharacterProps} props - The properties for the character.
   * @throws {ReferenceError} If GridEngine is not initialized.
   */
  constructor(props: CharacterProps) {
    const {
      scene,
      id,
      textureName,
      gridEngine,
      x = 0,
      y = 0,
      scale = 1,
      speed = 6,
      walkingAnimationMapping = 1,
      facingDirection = Direction.DOWN,
    } = props;

    super(scene, x, y, textureName);
    this.id = id;
    this.scale = scale;
    this.gridEngine = gridEngine;

    this.scene.add.existing(this);
    this.scene.physics.add.existing(this);

    try {
      this.gridEngine.addCharacter({
        id,
        sprite: this,
        startPosition: { x, y },
        walkingAnimationMapping,
        speed,
        facingDirection,
      });
    } catch (e) {
      throw new ReferenceError(
        `GridEngine not initialized! Characters must be created AFTER gridEngine.create\n${e}`,
      );
    }
  }

  /**
   * Checks if the character is moving.
   * @returns {boolean} True if the character is moving, false otherwise.
   */
  public isMoving(): boolean {
    return this.gridEngine.isMoving(this.id);
  }
  /**
   * Moves the character in the specified direction.
   * @param {Direction} direction - The direction to move the character.
   */
  public move(direction?: Direction) {
    if (direction) this.gridEngine.move(this.id, direction);
  }

  /**
   * Moves the character to the specified position.
   * @param {Position} position - The target position to move the character to.
   * @param {MoveToConfig} [config] - Optional configuration for the moveTo action.
   */
  public moveTo(position: Position, config?: MoveToConfig) {
    this.gridEngine.moveTo(this.id, position, config);
  }

  /**
   * Stops the character's movement.
   */
  public stopMovement() {
    this.gridEngine.stopMovement(this.id);
  }

  /**
   * Moves the character randomly within a specified radius.
   * @param {number} [delay] - The delay between movements.
   * @param {number} [radius] - The radius within which the character can move.
   */
  public moveRandomly(delay?: number, radius?: number) {
    this.gridEngine.moveRandomly(this.id, delay, radius);
  }

  /**
   * Makes the character follow another character.
   * @param {string} followId - The ID of the character to follow.
   * @param {FollowOptions} [options] - Optional configuration for the follow action.
   */
  public follows(followId: string, options?: FollowOptions) {
    this.gridEngine.follow(this.id, followId, options);
  }
}
