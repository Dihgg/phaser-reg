import { characters } from './characters';
import { ninja } from './ninja';

export const Atlas: Record<string, AtlasType> = {
  ninja,
};

export const Sprites: Record<string, SpritesheetType> = {
  characters,
};
