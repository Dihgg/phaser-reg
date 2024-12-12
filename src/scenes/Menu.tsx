import './menu.css';

import { GameSize, key } from '@constants';
import { Scene } from 'phaser';
import { Interface, useCurrentScene } from 'phaser-react-ui';
import { FunctionComponent } from 'react';

const MenuUI: FunctionComponent = () => {
  const menu = useCurrentScene<Menu>();
  return (
    <div
      className="overlay"
      style={{
        aspectRatio: GameSize.WIDTH / GameSize.HEIGHT,
      }}
    >
      Test!
      <button
        onClick={() => menu.exit()}
      >
        Resume!
      </button>
    </div>
  );
};

export class Menu extends Scene {
  private ui!: Interface;
  constructor() {
    super(key.scene.menu);
  }

  create() {
    this.ui = new Interface(this);
    this.ui.render(MenuUI);

    ['keydown-ESC', 'keydown-X'].forEach((event) => {
      this.input.keyboard!.on(event, this.exit, this);
    });
  }

  public exit() {
    this.scene.resume(key.scene.overworld);
    this.scene.setVisible(true, key.scene.overworld);
    this.scene.stop();
  }
}
