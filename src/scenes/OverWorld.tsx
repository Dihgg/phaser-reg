import { key, TilemapLayers, TilemapObjects } from '@constants';
import { Direction, GridEngine } from 'grid-engine';
import { Scene } from 'phaser';

interface Map {
  map: MapType;
}
export class OverWorld extends Scene implements Map {
  map!: MapType;
  gridEngine!: GridEngine;
  constructor() {
    super(key.scene.overworld);
  }

  init(data: { map: MapType }) {
    this.map = data.map;
  }

  create() {
    const tilemap = this.make.tilemap({ key: this.map.name });
    const tileset = tilemap.addTilesetImage(
      this.map.tileset.match(/([^/]+)(?=\.\w+$)/)![0],
      this.map.name,
    )!;

    for (const { name } of tilemap.layers) {
      tilemap.createLayer(name, tileset, 0, 0);
    }

    const spawnPoint = tilemap.findObject(
      TilemapLayers.Objects,
      ({ name }) => name === TilemapObjects.SpawnPoint,
    )!;
    const spawnTile = tilemap.worldToTileXY(spawnPoint.x!, spawnPoint.y!);

    const player = this.add.sprite(0, 0, 'characters');
    player.scale = 0.75;

    this.cameras.main.startFollow(player, true);
    this.cameras.main.setFollowOffset(-player.width, -player.height);
    this.cameras.main.setBounds(
      0,
      0,
      tilemap.widthInPixels,
      tilemap.heightInPixels,
    );

    const gridEngineConfig = {
      characters: [
        {
          id: 'player',
          sprite: player,
          walkingAnimationMapping: 6,
          startPosition: { x: spawnTile!.x, y: spawnTile!.y },
          speed: 10,
        },
      ],
    };

    this.gridEngine.create(tilemap, gridEngineConfig);
  }

  update() {
    const cursors = this.input.keyboard!.createCursorKeys();
    if (cursors.left.isDown) {
      this.gridEngine.move('player', Direction.LEFT);
    } else if (cursors.right.isDown) {
      this.gridEngine.move('player', Direction.RIGHT);
    } else if (cursors.up.isDown) {
      this.gridEngine.move('player', Direction.UP);
    } else if (cursors.down.isDown) {
      this.gridEngine.move('player', Direction.DOWN);
    }
  }
}
