import { TilemapDebug } from '@components';
import { Depth, key, TilemapLayer, TilemapObject } from '@constants';
import { Player } from '@entities';
import Phaser from 'phaser';
import { render } from 'phaser-jsx';
import ArcadeColliderType = Phaser.Types.Physics.Arcade.ArcadeColliderType;

interface Map {
  map: MapType;
  loadMap: () => void;
}

export class OverWorld extends Phaser.Scene implements Map {
  private player!: Player;
  private tilemap!: Phaser.Tilemaps.Tilemap;
  private worldLayer!: Phaser.Tilemaps.TilemapLayer;
  map!: MapType;

  constructor() {
    super(key.scene.overworld);
  }

  init(data: { map: MapType }) {
    this.map = data.map;
  }

  loadMap() {
    this.tilemap = this.make.tilemap({ key: this.map.name });

    const tileset = this.tilemap.addTilesetImage(
      this.map.tileset.match(/([^/]+)(?=\.\w+$)/)![0],
      this.map.name,
    )!;

    this.tilemap.createLayer(TilemapLayer.BelowPlayer, tileset, 0, 0);
    this.worldLayer = this.tilemap.createLayer(
      TilemapLayer.World,
      tileset,
      0,
      0,
    )!;
    const aboveLayer = this.tilemap.createLayer(
      TilemapLayer.AbovePlayer,
      tileset,
      0,
      0,
    )!;

    this.worldLayer.setCollisionByProperty({ collides: true });
    this.physics.world.bounds.width = this.worldLayer.width;
    this.physics.world.bounds.height = this.worldLayer.height;

    aboveLayer.setDepth(Depth.AbovePlayer);
  }

  create() {
    this.loadMap();
    this.addPlayer();

    this.cameras.main.setBounds(
      0,
      0,
      this.tilemap.widthInPixels,
      this.tilemap.heightInPixels,
    );

    render(<TilemapDebug tilemapLayer={this.worldLayer} />, this);

    this.input.keyboard!.on('keydown-ESC', this.handlePause, this);
    this.input.keyboard!.on('keydown-X', this.handlePause, this);
  }

  private handlePause() {
    this.scene.pause(key.scene.overworld);
    this.scene.launch(key.scene.menu);
  }

  private addPlayer() {
    const spawnPoint = this.tilemap.findObject(
      TilemapLayer.Objects,
      ({ name }) => name === TilemapObject.SpawnPoint,
    )!;

    this.player = new Player({
      scene: this,
      x: spawnPoint.x!,
      y: spawnPoint.y!,
    });
    this.addPlayerExitInteraction();

    this.physics.add.collider(this.player, this.worldLayer);
  }

  private addPlayerExitInteraction() {
    const exits = this.tilemap.filterObjects(
      TilemapLayer.Objects,
      ({ name }) => name == TilemapObject.Exit,
    )!;

    exits.forEach((exit) => {
      const exitBody = this.physics.add.staticBody(
        exit.x!,
        exit.y!,
        exit.width,
        exit.height,
      );
      this.physics.add.overlap(
        exitBody as unknown as ArcadeColliderType,
        this.player.body as unknown as ArcadeColliderType,
        () => {
          const properties = exit.properties.reduce(
            (
              acc: Record<string, 'map' | string>,
              prop: { name: string; value: string },
            ) => {
              acc[prop.name] = prop.value;
              return { ...acc };
            },
            {},
          );
          this.scene.restart({ map: key.maps[properties.map] });
        },
      );
    });
  }

  update() {
    this.player.update();
  }
}
