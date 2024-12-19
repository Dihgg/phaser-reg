import Sprite = Phaser.GameObjects.Sprite;
import {
  Direction,
  FollowOptions,
  GridEngine,
  MoveToConfig,
  Position,
} from 'grid-engine';
import { Scene } from 'phaser';
import Tilemap = Phaser.Tilemaps.Tilemap;
import { TilemapLayers } from '@constants';

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
  public gridEngine: GridEngine;

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

/**
 * Abstract class representing a character behavior.
 * @abstract
 */
abstract class CharacterBehaviour {
  /**
   * The character associated with this behavior.
   * @type {Character}
   * @protected
   */
  protected _character: Character;

  /**
   * Creates an instance of CharacterBehaviour.
   * @param {Character} character - The character associated with this behavior.
   */
  protected constructor(character: Character) {
    this._character = character;
  }

  /**
   * Gets the character associated with this behavior.
   * @type {Character}
   * @readonly
   */
  get character() {
    return this._character;
  }
}

interface WithLineOfSightProps {
  targetId: string;
  tilemap: Tilemap;
  delay?: number;
  options?: string[];
}

/**
 * Class representing a character with line-of-sight behavior.
 * @extends CharacterBehaviour
 */
export class WithLineOfSight extends CharacterBehaviour {
  /**
   * The maximum path length for line-of-sight checks.
   * @type {number}
   * @private
   */
  private readonly maxPathLength: number = 10;

  /**
   * The ID of the target character.
   * @type {string}
   * @private
   */
  private readonly targetId: string;

  /**
   * The tilemap used for pathfinding.
   * @type {Tilemap}
   * @private
   */
  private readonly tilemap: Tilemap;

  /**
   * Creates an instance of WithLineOfSight.
   * @param {Character} character - The character associated with this behavior.
   * @param {WithLineOfSightProps} props - The properties for the line-of-sight behavior.
   */
  constructor(character: Character, props: WithLineOfSightProps) {
    super(character);
    const { targetId, tilemap, options = [], delay = 200 } = props;
    this.targetId = targetId;
    this.tilemap = tilemap;
    const [maxPathLength] = options;
    this.maxPathLength = +maxPathLength;
    this.character.scene.time.addEvent({
      delay,
      loop: true,
      callback: () => this.lineOfSight(),
    });
  }

  /**
   * Checks if the path to the target is blocked.
   * @returns {boolean} True if the path is blocked, false otherwise.
   * @private
   */
  private isPathBlocked(): boolean {
    const { gridEngine, id } = this.character;
    const { targetId, maxPathLength } = this;
    const enemyPosition = gridEngine.getPosition(id);
    const enemyLayer = gridEngine.getCharLayer(id);
    const targetPosition = gridEngine.getPosition(targetId);
    const targetLayer = gridEngine.getCharLayer(targetId);
    const pathfindingResult = gridEngine.findShortestPath(
      { position: enemyPosition, charLayer: enemyLayer },
      { position: targetPosition, charLayer: targetLayer },
      {
        ignoreTiles: true,
        maxPathLength,
      },
    );
    const { path } = pathfindingResult;
    if (!path.length) return true;
    for (const { position } of path) {
      const { x, y } = position;
      const tileBlocked = !!this.tilemap.getTileAt(
        x,
        y,
        false,
        TilemapLayers.Collisions,
      );
      if (tileBlocked) {
        return true;
      }
    }
    return false;
  }

  /**
   * Checks if the target is within the field of view.
   * @returns {boolean} True if the target is within the field of view, false otherwise.
   * @private
   */
  private isInFOV(): boolean {
    const { character, targetId, maxPathLength } = this;
    const { gridEngine } = character;
    const targetPosition = gridEngine.getPosition(targetId);
    const facingPosition = gridEngine.getFacingPosition(character.id);
    // Manhattan distance
    const distance =
      Math.abs(targetPosition.x - facingPosition.x) +
      Math.abs(targetPosition.y - facingPosition.y);
    return distance <= maxPathLength;
  }

  /**
   * Performs the line-of-sight check and updates the character's behavior.
   * @private
   */
  private lineOfSight() {
    if (this.character.gridEngine.isMoving(this.character.id)) {
      return;
    }
    const isPathBlocked = this.isPathBlocked();
    const isInFOV = this.isInFOV();
    if (!isPathBlocked && isInFOV) {
      this.character.moveTo(
        this.character.gridEngine.getPosition(this.targetId),
        {
          ignoredChars: [this.targetId],
        },
      );
    } else {
      this.character.gridEngine.stopMovement(this.character.id);
    }
  }
}
