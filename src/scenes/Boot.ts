import { Scene } from 'phaser';

import * as assets from '../assets';
import { key } from '../constants';

export class Boot extends Scene {
  constructor() {
    super(key.scene.boot);
  }

  preload() {
    this.load.spritesheet(key.image.spaceman, assets.sprites.spaceman, {
      frameWidth: 16,
      frameHeight: 16,
    });
    this.load.atlas(key.atlas.player, assets.atlas.image, assets.atlas.data);

    for (const { name, tileset, tilemap } of Object.values(key.maps)) {
      this.load.image(name, tileset);
      this.load.tilemapTiledJSON(name, tilemap);
    }

    // this.load.image(key.image.tuxemon, assets.tilesets.tuxemon);
    // this.load.tilemapTiledJSON(key.tilemap.tuxemon, assets.tilemaps.tuxemon);
  }

  create() {
    this.scene.start(key.scene.overworld, { map: key.maps['tuxemon'] });
  }
}
