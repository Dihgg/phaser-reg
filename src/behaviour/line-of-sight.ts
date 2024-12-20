import { TilemapLayers } from '@constants';
import { Character } from '@entities';

import Tilemap = Phaser.Tilemaps.Tilemap;

import { Behaviour } from './behaviour';
import { BehaviourProps, WithTarget } from './behaviour.types';

type WithLineOfSightProps = BehaviourProps &
  WithTarget & {
    tilemap: Tilemap;
    options?: string[];
    onLostSight?: () => void;
  };

/**
 * Class representing a character with line-of-sight behavior.
 * @extends Behaviour
 */
export class LineOfSightBehaviour extends Behaviour implements WithTarget {
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
      if (!this.hasLostSight && this.onLostSight) {
        this.onLostSight();
        this.character.move();
        this.hasLostSight = true;
      }
    }
  }
}
