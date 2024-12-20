import { TilemapLayers, TilemapObjects } from '@constants';
import { Character } from '@entities';
import { TilemapUtils } from '@utils';
import { Position } from 'grid-engine';
import TimerEvent = Phaser.Time.TimerEvent;
import Tilemap = Phaser.Tilemaps.Tilemap;

export interface IBehavior {
  setPrevious(previous: IBehavior): void;

  setCharacter(character: Character): void;

  execute(): void;

  remove(): void;
}

type BehaviorConfig = {
  delay?: number;
  loop?: boolean;
};

abstract class Behavior implements IBehavior {
  protected character!: Character;
  protected event: TimerEvent;
  protected previous: IBehavior | null = null;

  protected constructor(config?: BehaviorConfig) {
    const { delay = 200, loop = false } = config || {};
    this.event = new TimerEvent({
      delay,
      loop,
      callback: this.execute,
      callbackScope: this,
    });
  }

  abstract execute(): void;

  public setCharacter(character: Character) {
    this.character = character;
    this.character.scene.time.addEvent(this.event);
  }

  public setPrevious(previous: IBehavior) {
    this.previous = previous;
  }

  public remove() {
    this.character.scene.time.removeEvent(this.event);
  }
}

type MoveRandomlyBehaviorConfig = BehaviorConfig & {
  movementDelay?: number;
  radius?: number;
};

export class MoveRandomlyBehavior extends Behavior {
  private readonly movementDelay: number;
  private readonly radius: number;

  constructor(config?: MoveRandomlyBehaviorConfig) {
    super(config);
    // const { movementDelay = 1000, radius = 10 } = config;
    this.movementDelay = config?.movementDelay || 1000;
    this.radius = config?.radius || 10;
  }

  execute() {
    this.character.moveRandomly(this.movementDelay, this.radius);
  }
}

type LineOfSightBehaviorConfig = BehaviorConfig & {
  tilemap: Tilemap;
  targetId: string;
  maxPathLength?: number;
};

export class LineOfSightBehavior extends Behavior {
  private maxPathLength: number;
  private readonly targetId: string;
  private tilemap: Tilemap;
  private hasLostSight = false;

  constructor(config: LineOfSightBehaviorConfig) {
    const {
      targetId,
      tilemap,
      maxPathLength = 10,
      delay = 200,
      loop = true,
    } = config;
    super({ ...config, delay, loop });
    this.tilemap = tilemap;
    this.targetId = targetId;
    this.maxPathLength = maxPathLength;
  }

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

  public execute() {
    if (this.isInFOV() && !this.isPathBlocked()) {
      this.hasLostSight = false;
      const tartPos = this.character.gridEngine.getPosition(this.targetId);
      this.character.moveTo(tartPos, { ignoredChars: [this.targetId] });
    } else if (!this.hasLostSight) {
      this.previous?.execute();
      this.hasLostSight = true;
    }
  }
}

type PatrolBehaviorConfig = BehaviorConfig & {
  patrolId: string;
  tilemap: Tilemap;
  targetId: string;
  movementType?: 'boomerang' | 'loop' | string;
};
export class PatrolBehavior extends Behavior {
  private readonly patrolId: string;
  private readonly points: Position[] = [];
  private readonly tilemap: Tilemap;
  private pointIndex = 0;
  private movementType: PatrolBehaviorConfig['movementType'];

  constructor(config: PatrolBehaviorConfig) {
    const {
      tilemap,
      patrolId,
      movementType = 'boomerang',
      delay = 1000,
      loop = true,
    } = config;
    super({ ...config, delay, loop });
    this.tilemap = tilemap;
    this.patrolId = patrolId;
    this.movementType = movementType;
    this.points = this.loadPatrolPoints();
  }

  /**
   * Loads the patrol points from the tilemap.
   * @returns {Position[]} The sorted patrol points.
   */
  private loadPatrolPoints(): Position[] {
    return (
      this.tilemap
        .filterObjects(
          TilemapLayers.PatrolPoints,
          ({ name }) => name === TilemapObjects.PatrolPoint,
        )
        ?.filter(this.isMatchingPatrolId.bind(this))
        .sort(this.comparePatrolPoints)
        .map(this.extractPosition.bind(this)) || []
    );
  }

  /**
   * Checks if the object's patrol_id matches the patrolId of this behavior.
   * @param {Phaser.Types.Tilemaps.TiledObject} object - The object to check.
   * @returns {boolean} True if the patrol_id matches, false otherwise.
   */
  private isMatchingPatrolId(
    object: Phaser.Types.Tilemaps.TiledObject,
  ): boolean {
    const { patrol_id } = TilemapUtils.extractProperties<{ patrol_id: string }>(
      object.properties,
    );
    return patrol_id === this.patrolId;
  }

  /**
   * Compares two objects based on their patrol_point property.
   * @param {Phaser.Types.Tilemaps.TiledObject} a - The first object.
   * @param {Phaser.Types.Tilemaps.TiledObject} b - The second object.
   * @returns {number} The comparison result.
   */
  private comparePatrolPoints(
    a: Phaser.Types.Tilemaps.TiledObject,
    b: Phaser.Types.Tilemaps.TiledObject,
  ): number {
    const { patrol_point: pointA } = TilemapUtils.extractProperties<{
      patrol_point: number;
    }>(a.properties);
    const { patrol_point: pointB } = TilemapUtils.extractProperties<{
      patrol_point: number;
    }>(b.properties);
    return pointA - pointB;
  }

  /**
   * Extracts the position from a tilemap object.
   * @param {Phaser.Types.Tilemaps.TiledObject} object - The object to extract the position from.
   * @returns {Position} The extracted position.
   */
  private extractPosition({
    x,
    y,
  }: Phaser.Types.Tilemaps.TiledObject): Position {
    const tilePosition = TilemapUtils.getTilePositionByXY(this.tilemap, {
      x: x!,
      y: y!,
    });
    return { x: tilePosition.x, y: tilePosition.y };
  }

  setPointIndex() {
    const { points, movementType } = this;
    if (movementType === 'boomerang') {
      if (this.pointIndex === points.length) {
        points.reverse();
        this.pointIndex = 0;
      }
    } else if (movementType === 'loop') {
      if (this.pointIndex === points.length) {
        this.pointIndex = 0;
      }
    }
  }

  /**
   * Executes the patrol behavior.
   */

  execute(): void {
    const { points } = this;
    if (!this.character.isMoving()) {
      this.setPointIndex();
      this.character.moveTo(points[this.pointIndex]);
      this.pointIndex++;
    }
  }
}
