import { Character, CharacterProps } from './Character';
import { Direction } from 'grid-engine';

type PlayerProps = CharacterProps;

type Cursors = Record<
  'w' | 'a' | 's' | 'd' | 'up' | 'left' | 'down' | 'right' | 'space' | 'z' | 'x',
  Phaser.Input.Keyboard.Key
>;

export class Player extends Character {
  cursors: Cursors;
  
  constructor(props: PlayerProps) {
    super(props);
    this.cursors = this.createCursorKeys();
    this.scene.cameras.main.startFollow(this, true);
    this.scene.cameras.main.setFollowOffset(-this.width, -this.height);
  }
  
  private createCursorKeys() {
    return this.scene.input.keyboard!.addKeys(
      'w,a,s,d,up,left,down,right,space,z,x'
    ) as Cursors;
  }

  update() {
    const {cursors} = this;
    switch (true) {
      case cursors.left.isDown:
      case cursors.a.isDown:
        this.move(Direction.LEFT);
        break;
      case cursors.right.isDown:
      case cursors.d.isDown:
        this.move(Direction.RIGHT);
        break;
      case cursors.up.isDown:
      case cursors.w.isDown:
        this.move(Direction.UP);
        break;
      case cursors.down.isDown:
      case cursors.s.isDown:
        this.move(Direction.DOWN);
        break;
    }
  }
}
