import * as tilemaps from './tilemaps';
import * as tilesets from './tilesets';

export const Maps: Record<string, MapType> = {
  city: {
    name: 'city',
    tileset: tilesets.tuxemon,
    tilemap: tilemaps.tuxemon,
  },
  forest: {
    name: 'forest',
    tileset: tilesets.tuxemon,
    tilemap: tilemaps.forest,
  },
};
