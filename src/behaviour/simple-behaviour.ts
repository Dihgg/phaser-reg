import { Character } from '@entities';

import { Behaviour } from './behaviour';

export class SimpleMovementBehaviour extends Behaviour {
  constructor(character: Character) {
    super(character, {
      delay: 0,
      loop: false,
    });
  }

  protected behaviour(): void {
    this.character.move();
  }
}
