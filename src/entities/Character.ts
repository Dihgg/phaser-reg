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
    console.log('Moving randomly', this.id, delay, radius);
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

type CharacterBehaviourProps = {
  delay?: number;
  loop?: boolean;
};
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
   * @param {CharacterBehaviourProps} [props={}] - The properties for the behavior.
   */
  protected constructor(
    character: Character,
    props: CharacterBehaviourProps = {},
  ) {
    const { delay = 200, loop = true } = props;
    this._character = character;
    this.character.scene.time.addEvent({
      delay,
      loop,
      callback: () => this.behaviour(),
    });
  }

  /**
   * Gets the character associated with this behavior.
   * @type {Character}
   * @readonly
   */
  get character() {
    return this._character;
  }

  protected abstract behaviour(): void;
}

interface WithTarget {
  targetId: string;
}

type WithLineOfSightProps = CharacterBehaviourProps &
  WithTarget & {
    tilemap: Tilemap;
    options?: string[];
    onLostSight?: () => void;
  };

/**
 * Class representing a character with line-of-sight behavior.
 * @extends CharacterBehaviour
 */
export class WithLineOfSight extends CharacterBehaviour implements WithTarget {
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
  targetId: string;

  /**
   * The tilemap used for pathfinding.
   * @type {Tilemap}
   * @private
   */
  private readonly tilemap: Tilemap;

  /**
   * The callback function to execute when the target is lost.
   * @private
   */
  private readonly onLostSight?: () => void;
  /**
   * Flag indicating if the character has lost sight of the target.
   * @private
   */
  private hasLostSight = false;

  /**
   * Creates an instance of WithLineOfSight.
   * @param {Character} character - The character associated with this behavior.
   * @param {WithLineOfSightProps} props - The properties for the line-of-sight behavior.
   */
  constructor(character: Character, props: WithLineOfSightProps) {
    super(character, props);
    const { targetId, tilemap, options = [], onLostSight } = props;

    this.targetId = targetId;
    this.tilemap = tilemap;
    const [maxPathLength] = options;
    this.maxPathLength = +maxPathLength;
    this.onLostSight = onLostSight;
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
  protected behaviour() {
    console.log('Line of sight behaviour update');
    /*if (this.character.isMoving()) {
      
      return;
    }*/
    const isPathBlocked = this.isPathBlocked();
    const isInFOV = this.isInFOV();
    if (!isPathBlocked && isInFOV) {
      this.hasLostSight = false;
      this.character.moveTo(
        this.character.gridEngine.getPosition(this.targetId),
        {
          ignoredChars: [this.targetId],
        },
      );
    } else {
      // this.character.stopMovement();
      if (!this.hasLostSight && this.onLostSight) {
        this.onLostSight();
        this.character.move();
        this.hasLostSight = true;
      }
    }
  }
}

type SimpleMovementProps = WithTarget;
export class WithSimpleMovement
  extends CharacterBehaviour
  implements WithTarget
{
  targetId: string;
  constructor(character: Character, props: SimpleMovementProps) {
    const { targetId } = props;
    super(character, {
      delay: 0,
      loop: false,
    });
    this.targetId = targetId;
  }

  protected behaviour(): void {
    console.log('Simple movement');
    this.character.move();
  }
}
