import Sprite = Phaser.GameObjects.Sprite;
import { Direction, GridEngine, MoveToConfig, Position } from 'grid-engine';
import { Scene } from 'phaser';

export type CharacterProps = {
  scene: Scene; // The scene to which this character belongs
  id: string; // The unique identifier for the character
  textureName: string; // The texture key for the character's sprite
  gridEngine: GridEngine; // The GridEngine instance for character movement
  x?: number; // The initial x-coordinate of the character (default is 0)
  y?: number; // The initial y-coordinate of the character (default is 0)
  scale?: number; // The scale of the character's sprite (default is 1)
  speed?: number; // The movement speed of the character (default is 6)
  walkingAnimationMapping?: number; // The walking animation mapping for the character (default is 1)
};

/**
 * Represents a character in the game.
 * @extends Phaser.GameObjects.Sprite
 */
export class Character extends Sprite {
  /**
   * The unique identifier for the character.
   * @type {string}
   * @private
   */
  private readonly id: string;

  /**
   * The GridEngine instance for character movement.
   * @type {GridEngine}
   * @private
   */
  private gridEngine: CharacterProps['gridEngine'];

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
    } = props;

    super(scene, x, y, textureName);
    this.id = id;
    this.scale = scale;
    this.gridEngine = gridEngine;

    scene.add.existing(this);

    try {
      this.gridEngine.addCharacter({
        id,
        sprite: this,
        startPosition: { x, y },
        walkingAnimationMapping,
        speed,
      });
    } catch (e) {
      throw new ReferenceError(
        'GridEngine not initialized! Characters must be created AFTER gridEngine.create',
      );
    }
  }

  /**
   * Moves the character in the specified direction.
   * @param {Direction} direction - The direction to move the character.
   */
  public move(direction: Direction) {
    this.gridEngine.move(this.id, direction);
  }

  /**
   * Moves the character to the specified position.
   * @param {Position} position - The target position to move the character to.
   * @param {MoveToConfig} [config] - Optional configuration for the moveTo action.
   */
  public moveTo(position: Position, config?: MoveToConfig) {
    this.gridEngine.moveTo(this.id, position, config);
  }
}
