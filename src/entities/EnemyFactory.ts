import { Direction } from 'grid-engine';
import { v4 as uuid } from 'uuid';

import { Character, CharacterProps, WithLineOfSight } from './Character';
import Tilemap = Phaser.Tilemaps.Tilemap;
import { key } from '@constants';

type EnemyProps = CharacterProps & {
  targetId: string;
};
class Enemy extends Character {}

/* type EnemyWithLineOfSightProps = EnemyProps & {
  tilemap: Tilemap;
  options?: string[];
};
class EnemyWithLineOfSight extends Enemy {
  tilemap: Tilemap;
  maxPathLength = 10;
  constructor(props: EnemyWithLineOfSightProps) {
    super(props);
    this.tilemap = props.tilemap;
    const [maxPathLength] = props.options || [];
    this.maxPathLength = +maxPathLength;
    this.lineOfSight(this.targetId);
  }
  private isPathBlocked(target: string, maxPathLength = 10) {
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
  private isInFOV(targetId: string, maxPathLength: number) {
    const targetPosition = this.gridEngine.getPosition(targetId);
    const facingPosition = this.gridEngine.getFacingPosition(this.id);
    // Manhattan distance
    const distance =
      Math.abs(targetPosition.x - facingPosition.x) +
      Math.abs(targetPosition.y - facingPosition.y);
    return distance <= maxPathLength;
  }

  public lineOfSight(targetId: string) {
    this.scene.time.addEvent({
      delay: 200,
      callback: () => {
        const isLookingAt = this.isInFOV(targetId, this.maxPathLength);
        const isPathBlocked = this.isPathBlocked(targetId, this.maxPathLength);
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
} */

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
          /* new EnemyWithLineOfSight({
            ...props,
            walkingAnimationMapping,
            tilemap: this.tilemap,
            options: behaviourOptions,
          }),*/
          new WithLineOfSight(enemy, {
            targetId: props.targetId,
            tilemap: this.tilemap,
            options: behaviourOptions,
          }).character,
        );
        break;
    }
    // this.enemies.push(enemy);
    return this.enemies[this.enemies.length - 1];
  }

  updateAllEnemies() {
    this.enemies.forEach((enemy) => {
      // console.log('Updating enemy', enemy);
      enemy.update();
    });
  }
}
