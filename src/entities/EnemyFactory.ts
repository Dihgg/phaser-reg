import { v4 as uuid } from 'uuid';

import { Character, CharacterProps } from './Character';

type EnemyProps = CharacterProps;
class Enemy extends Character {
  constructor(props: EnemyProps) {
    super(props);
  }
}

type EnemyFactoryProps = Pick<
  CharacterProps,
  'gridEngine' | 'scene' | 'textureName'
>;
type CreateEnemyProps = {
  enemyType: string;
  x: number;
  y: number;
  scale?: number;
  speed?: number;
  movementType?: 'random' | 'follow';
};
export class EnemyFactory {
  gridEngine: EnemyProps['gridEngine']; // The GridEngine instance for character movement
  scene: EnemyProps['scene']; // The scene to which this character belongs
  textureName: EnemyProps['textureName']; // The texture key for the character's sprite
  
  constructor(props: EnemyFactoryProps) {
    const { gridEngine, scene, textureName } = props;
    this.gridEngine = gridEngine;
    this.scene = scene;
    this.textureName = textureName;
  }
  createEnemy(createProps: CreateEnemyProps): Enemy {
    const {
      enemyType,
      x,
      y,
      speed,
      scale,
      movementType = 'random',
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
      id,
      x,
      y,
      scale,
      speed,
    };
    const enemy = new Enemy({
      ...props,
      walkingAnimationMapping,
    });
    switch (movementType) {
      case 'random':
        enemy.moveRandomly(1000);
        break;
      case 'follow':
        enemy.follows('player');
        break;
    }
    return enemy;
  }
}
