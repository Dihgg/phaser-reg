import { Position } from 'grid-engine';
import Tilemap = Phaser.Tilemaps.Tilemap;

export class TilemapUtils {
  static getTilePositionByXY(tilemap: Tilemap, position: Position) {
    const { x, y } = position;
    return tilemap.worldToTileXY(x, y)!;
  }
  /**
   * Gets the tile coordinates of an object in the tilemap.
   * @param {Tilemap} tilemap - The tilemap.
   * @param {string} layer - The layer name.
   * @param {string} object - The object name.
   * @returns {Phaser.Math.Vector2} The tile coordinates.
   * @private
   */
  static getTilePositionByObject(
    tilemap: Tilemap,
    layer: string,
    object: string,
  ): Position {
    const wordPosition = tilemap.findObject(
      layer,
      ({ name }) => name === object,
    )!;
    const { x, y } = this.getTilePositionByXY(tilemap, {
      x: wordPosition.x!,
      y: wordPosition.y!,
    });
    return { x, y };
    // const { x, y } = tilemap.worldToTileXY(wordPosition.x!, wordPosition.y!)!;
    // return { x, y };
  }
  static extractProperties(properties: { name: string; value: string }[]) {
    return properties.reduce((acc: Record<string, string>, prop) => {
      acc[prop.name] = prop.value;
      return acc;
    }, {});
  }

  static extractPropertyOptions(property: string) {
    const [type, ...options] = property.split(';');
    return { type, options };
  }
}
