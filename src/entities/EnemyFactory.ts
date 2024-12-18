import { Direction } from 'grid-engine';
import { v4 as uuid } from 'uuid';

import { Character, CharacterProps } from './Character';
import Tilemap = Phaser.Tilemaps.Tilemap;
import { TilemapLayers } from '@constants';

type EnemyProps = CharacterProps;
class Enemy extends Character {
  constructor(props: EnemyProps) {
    super(props);
  }
  update() {
    super.update();
  }

  private isPathBlocked(target: string, tilemap: Tilemap, maxPathLength = 10) {
    const enemyPosition = this.gridEngine.getPosition(this.id);
    const enemyLayer = this.gridEngine.getCharLayer(this.id);
    const targetPosition = this.gridEngine.getPosition(target);
    const targetLayer = this.gridEngine.getCharLayer(target);
    const pathfindingResult = this.gridEngine.findShortestPath(
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
      const tileBlocked = !!tilemap.getTileAt(
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
  private isInFOV(targetId: string, maxPathLength: number) {
    const targetPosition = this.gridEngine.getPosition(targetId);
    const facingPosition = this.gridEngine.getFacingPosition(this.id);
    // Manhattan distance
    const distance =
      Math.abs(targetPosition.x - facingPosition.x) +
      Math.abs(targetPosition.y - facingPosition.y);
    return distance <= maxPathLength;
  }

  public lineOfSight(targetId: string, tilemap: Tilemap, options: string[]) {
    const [maxPathLength] = options;
    this.scene.time.addEvent({
      delay: 200,
      callback: () => {
        const isLookingAt = this.isInFOV(targetId, +maxPathLength);
        const isPathBlocked = this.isPathBlocked(
          targetId,
          tilemap,
          +maxPathLength,
        );
        if (!isPathBlocked && isLookingAt) {
          if (!this.gridEngine.isMoving(this.id)) {
            this.gridEngine.follow(this.id, targetId);
          }
        } else {
          this.gridEngine.stopMovement(this.id);
          console.log('Dançando!');
        }
      },
      loop: true,
    });
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
  x: number;
  y: number;
  scale?: number;
  speed?: number;
  movementType?: 'random' | 'follow' | 'line-of-sight' | string;
  movementOptions?: string[];
  facingDirection?: Direction;
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
      movementOptions = [],
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
    console.log('movementType', movementType);
    switch (movementType) {
      case 'random':
        enemy.moveRandomly(1000);
        break;
      case 'follow':
        enemy.follows('player');
        break;
      case 'line-of-sight':
        // figure out the tiles a follow would use and check if it is unobstructed
        enemy.lineOfSight('player', this.tilemap, movementOptions);

        break;
    }
    this.enemies.push(enemy);
    return enemy;
  }

  updateAllEnemies() {
    this.enemies.forEach((enemy) => {
      // console.log('Updating enemy', enemy);
      enemy.update();
    });
  }
}
