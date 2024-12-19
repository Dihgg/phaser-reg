import { Direction } from 'grid-engine';
import { v4 as uuid } from 'uuid';

import {
  Character,
  CharacterProps,
  WithLineOfSight,
  WithSimpleMovement,
} from './Character';
import Tilemap = Phaser.Tilemaps.Tilemap;

type MovementType = 'random' | string;
type EnemyProps = CharacterProps & {
  movement?: MovementType;
  movementOptions?: string[];
};
class Enemy extends Character {
  private readonly movement: MovementType;
  private readonly movementOptions: string[] = [];
  constructor(props: EnemyProps) {
    const { movement = 'random', movementOptions = [] } = props;
    super(props);
    this.movement = movement;
    this.movementOptions = movementOptions;
  }
  move() {
    switch (this.movement) {
      case 'random':
        this.moveRandomly(...this.movementOptions.map((value) => +value));
        break;
    }
  }
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
  movement?: 'random' | string;
  movementOptions?: string[];
  behaviour?: 'line-of-sight' | string;
  behaviourOptions?: string[];
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
      movement = 'random',
      movementOptions = [],
      behaviour,
      behaviourOptions = [],
      facingDirection = Direction.DOWN,
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
      movement,
      movementOptions,
    });
    switch (behaviour) {
      case 'line-of-sight':
        console.log('Enemy created with line of sight behaviour');
        this.enemies.push(
          new WithLineOfSight(enemy, {
            tilemap: this.tilemap,
            targetId,
            options: behaviourOptions,
            onLostSight: () => {
              console.log('Lost sight of player');
            },
          }).character as Enemy,
        );
        break;
      default:
        this.enemies.push(
          new WithSimpleMovement(enemy, {
            targetId,
          }).character as Enemy,
        );
        break;
    }
    return this.enemies[this.enemies.length - 1];
  }
}
