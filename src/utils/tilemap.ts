import { Position } from 'grid-engine';
import Tilemap = Phaser.Tilemaps.Tilemap;
/**
 * Gets the tile coordinates of an object in the tilemap.
 * @param {Tilemap} tilemap - The tilemap.
 * @param {string} layer - The layer name.
 * @param {string} object - The object name.
 * @returns {Phaser.Math.Vector2} The tile coordinates.
 * @private
 */
export function getTilePositionByObject(
  tilemap: Tilemap,
  layer: string,
  object: string,
): Position {
  const wordPosition = tilemap.findObject(
    layer,
    ({ name }) => name === object,
  )!;
  const { x, y } = tilemap.worldToTileXY(wordPosition.x!, wordPosition.y!)!;
  return { x, y };
}
