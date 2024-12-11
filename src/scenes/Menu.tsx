import { Button, Overlay } from '@components';
import { key } from '@constants';
import { Scene } from 'phaser';
import { render } from 'phaser-jsx';

export class Menu extends Scene {
  constructor() {
    super(key.scene.menu);
  }

  create() {
    ['keydown-ESC', 'keydown-X'].forEach((event) => {
      this.input.keyboard!.on(event, this.exit, this);
    });
    const { centerX, centerY } = this.cameras.main;

    render(
      <>
        <Overlay />

        <Button
          center
          fixed
          onClick={this.exit}
          x={centerX}
          y={centerY}
          children={'Resume'}
        />
      </>,
      this,
    );
  }

  private exit() {
    this.scene.resume(key.scene.overworld);
    this.scene.setVisible(true, key.scene.overworld);
    this.scene.stop();
  }
}
