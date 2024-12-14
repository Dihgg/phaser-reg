import Sprite = Phaser.GameObjects.Sprite;
import { Scene } from 'phaser';
import { Direction, GridEngine, MoveToConfig, Position } from 'grid-engine';

export type CharacterProps = {
  scene: Scene;
  id: string;
  textureName: string;
  gridEngine: GridEngine;
  x?: number;
  y?: number;
  scale?: number;
  speed?: number;
  walkingAnimationMapping?: number;
}
export class Character extends Sprite {
  private readonly id: string;
  private gridEngine: CharacterProps['gridEngine'];
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
      walkingAnimationMapping = 1
    } = props;
    
    super(scene,x,y, textureName);
    this.id = id;
    this.scale = scale;
    this.gridEngine = gridEngine;
    
    scene.add.existing(this);
    
    try {
      this.gridEngine.addCharacter({
        id,
        sprite: this,
        startPosition: {x,y},
        walkingAnimationMapping,
        speed
      });
    } catch (e) {
      throw new ReferenceError('GridEngine not initialized! Characters must be created AFTER gridEngine.create')
    }
  }
  public move(direction: Direction) {
    this.gridEngine.move(this.id, direction);
  }

  public moveTo(position: Position, config?:MoveToConfig) {
    this.gridEngine.moveTo(this.id, position, config);
  }
}
