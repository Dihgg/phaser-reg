import './style.css';

import { GameSize } from '@constants';
import { GridEngine } from 'grid-engine';
import Phaser from 'phaser';

import * as scenes from './scenes';

/**
 * https://rexrainbow.github.io/phaser3-rex-notes/docs/site/game/
 */
new Phaser.Game({
  width: GameSize.WIDTH, // 1024
  height: GameSize.HEIGHT, // 768
  title: 'Phaser RPG',
  url: import.meta.env.VITE_APP_HOMEPAGE,
  version: import.meta.env.VITE_APP_VERSION,
  scene: [scenes.Boot, scenes.OverWorld, scenes.Menu],
  physics: {
    default: 'arcade',
    arcade: {
      debug: import.meta.env.DEV,
    },
  },
  disableContextMenu: import.meta.env.PROD,
  backgroundColor: '#000',
  scale: {
    mode: Phaser.Scale.FIT,
    autoCenter: Phaser.Scale.CENTER_BOTH,
  },
  pixelArt: true,
  plugins: {
    scene: [
      {
        key: 'gridEngine',
        plugin: GridEngine,
        mapping: 'gridEngine',
      },
    ],
  },
});
