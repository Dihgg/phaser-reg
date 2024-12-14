import { key, TilemapLayers, TilemapObjects } from '@constants';
import { GridEngine } from 'grid-engine';
import { Scene } from 'phaser';
import { Player } from '@entities';
import Tilemap = Phaser.Tilemaps.Tilemap;

interface Map {
  map: MapType;
}
export class OverWorld extends Scene implements Map {
  map!: MapType;
  tilemap!: Tilemap;
  gridEngine!: GridEngine;
  player!: Player;
  constructor() {
    super(key.scene.overworld);
  }

  init(data: { map: MapType }) {
    this.map = data.map;
  }

  create() {
    this.loadTilemap();
    this.creteGridEngine();
    this.boundCamera();
    this.createPlayer();
    
  }
  
  update() {
    this.player.update();
  }
  
  private getObjectTileXY(tilemap: Tilemap, layer: string, object: string) {
    const {x, y} = tilemap.findObject(layer,({name}) => name === object)!;
    return tilemap.worldToTileXY(x!,y!);
  }
  
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
  
  private creteGridEngine() {
    this.gridEngine.create(this.tilemap, {
      characters: [],
    });
  }
  
  private boundCamera() {
    this.cameras.main.setBounds(
      0,
      0,
      this.tilemap.widthInPixels,
      this.tilemap.heightInPixels,
    );
  }
  
  private createPlayer() {
    const spawnTile = this.getObjectTileXY(this.tilemap, TilemapLayers.Objects,TilemapObjects.SpawnPoint);
    
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
