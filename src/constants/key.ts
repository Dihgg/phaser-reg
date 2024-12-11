import * as assets from '../assets';

const atlas = {
  player: 'player',
} as const;

const image = {
  spaceman: 'spaceman',
  tuxemon: 'tuxemon',
  forest: 'forest',
} as const;

const maps: Record<string, MapType> = {
  tuxemon: {
    name: 'tuxemon',
    tileset: assets.tilesets.tuxemon,
    tilemap: assets.tilemaps.tuxemon,
  },
  forest: {
    name: 'forest',
    tileset: assets.tilesets.tuxemon,
    tilemap: assets.tilemaps.forest,
  },
} as const;

const scene = {
  boot: 'boot',
  overworld: 'overworld',
  menu: 'menu',
} as const;

const tilemap = {
  tuxemon: 'tuxemon',
} as const;

export const key = {
  atlas,
  image,
  scene,
  tilemap,
  maps,
} as const;
