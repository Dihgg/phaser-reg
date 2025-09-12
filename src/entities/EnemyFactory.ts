import { Direction } from 'grid-engine';
import { v4 as uuid } from 'uuid';

import { Character, CharacterProps } from './Character';

import Tilemap = Phaser.Tilemaps.Tilemap;
import {
  LineOfSightBehavior,
  MoveRandomlyBehavior,
  PatrolBehavior,
} from '@behavior';

type MovementType = 'random' | string;
type EnemyProps = CharacterProps & {
  movement?: MovementType;
  movementOptions?: string[];
};
class Enemy extends Character {
  /* private readonly movement?: MovementType;
  private readonly movementOptions: string[] = [];
  constructor(props: EnemyProps) {
    const { movement, movementOptions = [] } = props;
    super(props);
    this.movement = movement;
    this.movementOptions = movementOptions;
  }
  move() {
    console.log('Moving enemy', this.id, this.movement, this.movementOptions);
    switch (this.movement) {
      case 'random':
        this.moveRandomly(...this.movementOptions.map((value) => +value));
        break;
      default:
        console.log('no default movement provided');
        break;
    }
  } */
}

type EnemyFactoryProps = Pick<
  CharacterProps,
  'gridEngine' | 'scene' | 'textureName'
> & {
  tilemap: Tilemap;
};
type CreateEnemyProps = {
  enemyType: string;
  targetId: string;
  x: number;
  y: number;
  scale?: number;
  speed?: number;
  facingDirection?: Direction;
  behaviorOptions?: Record<string, string[]>;
};
export class EnemyFactory {
  gridEngine: EnemyProps['gridEngine']; // The GridEngine instance for character movement
  scene: EnemyProps['scene']; // The scene to which this character belongs
  textureName: EnemyProps['textureName']; // The texture key for the character's sprite
  enemies: Enemy[] = []; // The list of enemies created by this factory
  tilemap: Tilemap;
  constructor(props: EnemyFactoryProps) {
    const { gridEngine, scene, textureName, tilemap } = props;
    this.gridEngine = gridEngine;
    this.scene = scene;
    this.textureName = textureName;
    this.tilemap = tilemap;
  }
  createEnemy(createProps: CreateEnemyProps): Enemy {
    const {
      enemyType,
      targetId,
      x,
      y,
      speed,
      scale,
      facingDirection = Direction.DOWN,
      behaviorOptions,
    } = createProps;
    const id = uuid();
    const walkingAnimationMapping =
      {
        goblin: 1,
        thief: 2,
      }[enemyType] || 1;

    const enemy = new Enemy({
      gridEngine: this.gridEngine,
      scene: this.scene,
      textureName: this.textureName,
      id,
      x,
      y,
      scale,
      speed,
      facingDirection,
      walkingAnimationMapping,
    });
    if (behaviorOptions?.random) {
      const [movementDelay, radius] = behaviorOptions.random;
      enemy.addBehavior(
        new MoveRandomlyBehavior({
          movementDelay: +movementDelay,
          radius: +radius,
        }),
      );
    }
    if (behaviorOptions?.['line-of-sight']) {
      const [maxPathLength] = behaviorOptions['line-of-sight'];
      enemy.addBehavior(
        new LineOfSightBehavior({
          targetId,
          tilemap: this.tilemap,
          maxPathLength: +maxPathLength,
        }),
      );
    }
    if (behaviorOptions?.patrol) {
      const [patrolPoints, patrolBehavior] = behaviorOptions.patrol;
      enemy.addBehavior(
        new PatrolBehavior({
          targetId,
          tilemap: this.tilemap,
          patrolId: patrolPoints,
          movementType: patrolBehavior,
        }),
      );
    }
    enemy.startBehaviors();
    this.enemies.push(enemy);
    return enemy;
  }
}
