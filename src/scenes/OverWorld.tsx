import { key, TilemapLayers, TilemapObjects } from '@constants';
import { EnemyFactory, Player } from '@entities';
import { TilemapUtils } from '@utils';
import { GridEngine } from 'grid-engine';
import { Scene } from 'phaser';
import Tilemap = Phaser.Tilemaps.Tilemap;
import ArcadeColliderType = Phaser.Types.Physics.Arcade.ArcadeColliderType;

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
    this.createEnemies();
    this.addPlayerExitInteraction();
    this.addPauseMenu();
  }

  /**
   * Updates the scene.
   */
  update() {
    this.player.update();
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
    const spawnTile = TilemapUtils.getTilePositionByObject(
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

  private createEnemies() {
    const enemyFactory = new EnemyFactory({
      gridEngine: this.gridEngine,
      scene: this,
      textureName: 'characters',
    });
    const enemies = this.tilemap.filterObjects(
      TilemapLayers.Objects,
      ({ name }) => name === TilemapObjects.Enemy,
    )!;
    enemies.forEach((enemy) => {
      const properties = TilemapUtils.extractProperties(enemy.properties);
      const enemyType = properties['enemy_type'];
      console.log('enemy', enemy, enemyType);
      const spawnTile = TilemapUtils.getTilePositionByXY(this.tilemap, {
        x: enemy.x!,
        y: enemy.y!,
      });
      const newEnemy = enemyFactory.createEnemy({
        enemyType,
        x: spawnTile.x,
        y: spawnTile.y,
        scale: 0.75,
        speed: 8,
        movementType: 'follow',
      });
      console.log('newEnemy', newEnemy, spawnTile);
      // newEnemy.setPosition(spawnTile!.x, spawnTile!.y);
    });
  }
  /**
   * Adds the player exit interaction.
   * @private
   */
  private addPlayerExitInteraction() {
    const exits = this.tilemap.filterObjects(
      TilemapLayers.Objects,
      ({ name }) => name === TilemapObjects.Exit,
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
          // extract the properties from exit object
          const properties = TilemapUtils.extractProperties(exit.properties);
          this.scene.restart({ map: key.maps[properties.map] });
        },
      );
    });
  }

  private addPauseMenu() {
    const handlePause = () => {
      this.scene.launch(key.scene.menu);
      this.scene.pause();
    };
    this.input.keyboard!.on('keydown-ESC', handlePause, this);
    this.input.keyboard!.on('keydown-X', handlePause, this);
  }
}
