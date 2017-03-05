import { updatePlayerDirection } from '../state/actions/players';


const MOVE_DIRECTIONS = ['MOVE_NORTH', 'MOVE_SOUTH', 'MOVE_EAST', 'MOVE_WEST'];

// Process user input allowing them to change their player's direction.
export default function updateControl(store) {
  const state = store.getState();

  const inputAction = state.get('input').findLast(v => MOVE_DIRECTIONS.includes(v));
  if (inputAction !== undefined) {
    const ply = state.get('players').find(pl => pl.get('id') === 0);

    if (ply.get('alive')) {
      let newDirection;
      switch (inputAction) {
        case 'MOVE_NORTH':
          newDirection = 'north';
          break;
        case 'MOVE_SOUTH':
          newDirection = 'south';
          break;
        case 'MOVE_EAST':
          newDirection = 'east';
          break;
        case 'MOVE_WEST':
          newDirection = 'west';
          break;
        default:
          newDirection = undefined;
          break;
      }

      if (newDirection !== undefined) {
        // Player must move at least one grid cell before changing direction.
        const plyTrail = ply.get('trail');
        const curPoint = ply.get('position');
        const lastPoint = plyTrail.get(plyTrail.size - 2);

        // No need for Pythagoras, as we can only move along one axis.
        const xDiff = lastPoint.get(0) - curPoint.get(0);
        const yDiff = lastPoint.get(1) - curPoint.get(1);
        const curDistance = Math.abs(xDiff + yDiff);

        if (curDistance >= state.get('game').get('playerSize')) {
          const oldDirection = ply.get('direction');

          if (newDirection !== oldDirection &&
            !(oldDirection === 'north' && newDirection === 'south') &&
            !(oldDirection === 'south' && newDirection === 'north') &&
            !(oldDirection === 'west' && newDirection === 'east') &&
            !(oldDirection === 'east' && newDirection === 'west')) {
            store.dispatch(updatePlayerDirection(ply.get('id'), newDirection));
          }
        }
      }
    }
  }
}
