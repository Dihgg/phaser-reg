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
  facingDirection?: Direction; // The initial facing direction of the character (default is DOWN)
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
  public readonly id: string;

  /**
   * The GridEngine instance for character movement.
   * @type {GridEngine}
   * @private
   */
  public gridEngine: CharacterProps['gridEngine'];

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

  public moveRandomly(delay?: number, radius?: number) {
    this.gridEngine.moveRandomly(this.id, delay, radius);
  }

  public follows(followId: string, options?: FollowOptions) {
    this.gridEngine.follow(this.id, followId, options);
  }
}

abstract class CharacterBehaviour {
  protected _character: Character;
  protected constructor(character: Character) {
    this._character = character;
  }
  get character() {
    return this._character;
  }
}

type WithLineOfSightProps = {
  targetId: string;
  tilemap: Tilemap;
  delay?: number;
  options?: string[];
};
export class WithLineOfSight extends CharacterBehaviour {
  private readonly maxPathLength: number = 10;
  private readonly targetId: string;
  private readonly tilemap: Tilemap;
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
  private isPathBlocked(/* target: string, maxPathLength = 10 */) {
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
  private isInFOV() {
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
  private lineOfSight() {
    console.log('should check line of sight');
    const isPathBlocked = this.isPathBlocked();
    const isInFOV = this.isInFOV();
    if (!isPathBlocked && isInFOV) {
      this.character.follows(this.targetId);
      // this.character.gridEngine.follow(this.character.id, this.targetId);
    } else {
      this.character.gridEngine.stopMovement(this.character.id);
    }
    console.log('isPathBlocked', isPathBlocked);
  }
}
