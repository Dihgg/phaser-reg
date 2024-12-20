import { Character } from '@entities';

import { BehaviourProps } from './behaviour.types';

/**
 * Abstract class representing a character behavior.
 * @abstract
 */
export abstract class Behaviour {
  /**
   * The character associated with this behavior.
   * @type {Character}
   * @protected
   */
  protected _character: Character;

  /**
   * Creates an instance of CharacterBehaviour.
   * @param {Character} character - The character associated with this behavior.
   * @param {BehaviourProps} [props={}] - The properties for the behavior.
   */
  protected constructor(character: Character, props: BehaviourProps = {}) {
    const { delay = 200, loop = true } = props;
    this._character = character;
    this.character.scene.time.addEvent({
      delay,
      loop,
      callback: () => this.behaviour(),
    });
  }

  /**
   * Gets the character associated with this behavior.
   * @type {Character}
   * @readonly
   */
  get character() {
    return this._character;
  }

  protected abstract behaviour(): void;
}
