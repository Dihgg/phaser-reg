import * as assets from '@assets';

const atlas: Record<string, AtlasType> = {
  ninja: assets.sprites.Atlas.ninja,
} as const;

const sprites: Record<string, SpritesheetType> = {
  characters: assets.sprites.Sprites.characters
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

const id = {
  player: 'player',
} as const;

export const key = {
  id,
  atlas,
  sprites,
  scene,
  maps,
} as const;
