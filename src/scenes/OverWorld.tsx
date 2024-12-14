import { key, TilemapLayers, TilemapObjects } from '@constants';
import { Player } from '@entities';
import { GridEngine } from 'grid-engine';
import { Scene } from 'phaser';
import Tilemap = Phaser.Tilemaps.Tilemap;

interface Map {
  map: MapType;
}

/**
 * Represents the OverWorld scene in the game.
 * @extends Phaser.Scene
 * @implements Map
 */
export class OverWorld extends Scene implements Map {
  map!: MapType;
  tilemap!: Tilemap;
  gridEngine!: GridEngine;
  player!: Player;

  constructor() {
    super(key.scene.overworld);
  }

  /**
   * Initializes the scene with the given data.
   * @param {{ map: MapType }} data - The data to initialize the scene with.
   */
  init(data: { map: MapType }) {
    this.map = data.map;
  }

  /**
   * Creates the scene.
   */
  create() {
    this.loadTilemap();
    this.creteGridEngine();
    this.boundCamera();
    this.createPlayer();
  }

  /**
   * Updates the scene.
   */
  update() {
    this.player.update();
  }

  /**
   * Gets the tile coordinates of an object in the tilemap.
   * @param {Tilemap} tilemap - The tilemap.
   * @param {string} layer - The layer name.
   * @param {string} object - The object name.
   * @returns {Phaser.Math.Vector2} The tile coordinates.
   * @private
   */
  private getObjectTileXY(
    tilemap: Tilemap,
    layer: string,
    object: string,
  ): Phaser.Math.Vector2 {
    const { x, y } = tilemap.findObject(layer, ({ name }) => name === object)!;
    return tilemap.worldToTileXY(x!, y!)!;
  }

  /**
   * Loads the tilemap.
   * @private
   */
  private loadTilemap() {
    this.tilemap = this.make.tilemap({ key: this.map.name });
    const tileset = this.tilemap.addTilesetImage(
      this.map.tileset.match(/([^/]+)(?=\.\w+$)/)![0],
      this.map.name,
    )!;

    for (const { name } of this.tilemap.layers) {
      this.tilemap.createLayer(name, tileset, 0, 0);
    }
  }

  /**
   * Creates the GridEngine instance.
   * @private
   */
  private creteGridEngine() {
    this.gridEngine.create(this.tilemap, {
      characters: [],
    });
  }

  /**
   * Sets the camera bounds.
   * @private
   */
  private boundCamera() {
    this.cameras.main.setBounds(
      0,
      0,
      this.tilemap.widthInPixels,
      this.tilemap.heightInPixels,
    );
  }

  /**
   * Creates the player character.
   * @private
   */
  private createPlayer() {
    const spawnTile = this.getObjectTileXY(
      this.tilemap,
      TilemapLayers.Objects,
      TilemapObjects.SpawnPoint,
    );

    this.player = new Player({
      scene: this,
      id: 'player',
      scale: 0.75,
      speed: 10,
      x: spawnTile!.x,
      y: spawnTile!.y,
      gridEngine: this.gridEngine,
      textureName: 'characters',
      walkingAnimationMapping: 6,
    });
  }
}
