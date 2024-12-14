import { key } from '@constants';
import { Scene } from 'phaser';

export class Boot extends Scene {
  constructor() {
    super(key.scene.boot);
  }

  preload() {
    // Load Atlas Sprite sheets
    for (const { name, data, image } of Object.values(key.atlas)) {
      this.load.atlas(name, image, data);
    }

    // Load spritesheets
    for (const { name, image, data } of Object.values(key.sprites)) {
      this.load.spritesheet(name, image, data);
    }

    // Load Maps
    for (const { name, tileset, tilemap } of Object.values(key.maps)) {
      this.load.image(name, tileset);
      this.load.tilemapTiledJSON(name, tilemap);
    }
  }

  create() {
    this.scene.start(key.scene.overworld, { map: key.maps.city });
  }
}
