import Immutable from 'immutable';

import lobbyReducer from './lobby/reducers';

import gameReducer from '../game/state/reducers/game';
import playersReducer from '../game/state/reducers/players';
import inputReducer from '../game/state/reducers/input';

export function* rootSaga() {

}

export function rootReducer(state = Immutable.Map(), action) {
  // Player state relies on updated game state. This isn't ideal.
  const gameState = gameReducer(state.get('game'), action); // Not ideal...
  return state.update('lobby', s => lobbyReducer(s, action))
    .set('game', gameState)
    .update('players', s => playersReducer(s, action, gameState))
    .update('input', s => inputReducer(s, action));
}
