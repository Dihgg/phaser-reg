import { TilemapLayers, TilemapObjects } from '@constants';
import { Character } from '@entities';

import {
  LineOfSightBehaviour,
  LineOfSightBehaviourProps,
} from './line-of-sight';
import { Tilemap } from 'grid-engine';

type PatrolBehaviourProps = LineOfSightBehaviourProps & {
  patrolId: string;
};
export class PatrolBehaviour extends LineOfSightBehaviour {
  constructor(character: Character, props: PatrolBehaviourProps) {
    const { options } = props;
    const [patrolId, maxPathLength] = options;
    console.log('options', options);
    super(character, {
      ...props,
      options: [maxPathLength],
    });
    // console.log('a', (this.tilemap as unknown as Tilemap));
    // TODO: Implement the patrol behaviour here
    const points = this.tilemap.filterObjects(
      TilemapLayers.PatrolPoints,
      (object) => {
        console.log('object', object);
        return TilemapObjects.PatrolPoint === object.name;
      },
    );
    points?.filter((point) => {
      console.log('point properties', point.properties);
      return true;
    });
    console.log('points', points);
  }

  /* protected behaviour() {
    super.behaviour();
    console.log('Patrol behaviour should be implemented here');
  } */

  protected moveBehaviour() {
    // super.moveBehaviour();
    // TODO: Patrol move behaviour should be implemented here
    console.log('Patrol move behaviour should be implemented here');
  }
}
