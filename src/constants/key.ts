import * as assets from '@assets';

const atlas: Record<string, AtlasType> = {
  ninja: assets.sprites.Sprites.ninja,
} as const;

const maps: Record<string, MapType> = {
  city: assets.maps.Maps.city,
  forest: assets.maps.Maps.forest,
} as const;

const scene: Record<string, string> = {
  boot: 'boot',
  overworld: 'overworld',
  menu: 'menu',
} as const;

export const key = {
  atlas,
  scene,
  maps,
} as const;
