import { Direction } from 'grid-engine';
import { v4 as uuid } from 'uuid';

import { Character, CharacterProps, WithLineOfSight } from './Character';
import Tilemap = Phaser.Tilemaps.Tilemap;
import { key } from '@constants';

type EnemyProps = CharacterProps & {
  targetId: string;
};
class Enemy extends Character {}

type EnemyFactoryProps = Pick<
  CharacterProps,
  'gridEngine' | 'scene' | 'textureName'
> & {
  tilemap: Tilemap;
};
type CreateEnemyProps = {
  enemyType: string;
  x: number;
  y: number;
  scale?: number;
  speed?: number;
  facingDirection?: Direction;
  movementType?: 'random' | string;
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
      x,
      y,
      speed,
      scale,
      movementType = 'random',
      behaviour = 'line-of-sight',
      behaviourOptions = [],
      facingDirection = Direction.DOWN,
    } = createProps;
    const id = uuid();
    const walkingAnimationMapping =
      {
        goblin: 1,
        thief: 2,
      }[enemyType] || 1;
    const props: EnemyProps = {
      gridEngine: this.gridEngine,
      scene: this.scene,
      textureName: this.textureName,
      targetId: key.id.player,
      id,
      x,
      y,
      scale,
      speed,
      facingDirection,
    };
    const enemy = new Enemy({
      ...props,
      walkingAnimationMapping,
    });
    switch (behaviour) {
      case 'line-of-sight':
        this.enemies.push(
          new WithLineOfSight(enemy, {
            targetId: props.targetId,
            tilemap: this.tilemap,
            options: behaviourOptions,
          }).character,
        );
        break;
    }
    return this.enemies[this.enemies.length - 1];
  }
}
