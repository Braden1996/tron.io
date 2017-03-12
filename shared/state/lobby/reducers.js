import Immutable from 'immutable';
import {
  LOBBY_CONNECT,
  LOBBY_CONNECT_SUCCESS,
  LOBBY_APPLY_SNAPSHOT,
} from './actions';

import { getInitialState, copyState } from '../../game/operations';
import { applySnapshot } from '../../game/network/snapshot';


const initState = getInitialState();
export const INITIAL_LOBBY_STATE = Immutable.Map({
  key: null,
  connected: false,
  gameState: initState,  // Will be mutated!
  lastGameState: initState,  // Last verified state from server.,
  host: null,
});

export default function lobbyReducer(state = INITIAL_LOBBY_STATE, action) {
  switch (action.type) {
    case LOBBY_CONNECT:
      return state.set('key', action.lobbyKey)
        .set('connected', false);
    case LOBBY_CONNECT_SUCCESS:
      // Make sure we've connected to the intended lobby.
      const { lobbyKey, gameState } = action;
      if (lobbyKey === state.get('key')) {
        const gameStateNew = copyState(gameState);
        return state.set('connected', true)
          .set('gameState', gameStateNew)
          .set('lastGameState', gameState);
      }
    case LOBBY_APPLY_SNAPSHOT:
      const snapshot = action.value;
      const lastState = state.get('lastGameState');
      applySnapshot(lastState, snapshot);  // Apply updates to last state.

      const lastStateNew = copyState(lastState);

      return state.set('gameState', lastStateNew)
        .set('lastGameState', lastState);
    default:
      return state;
  }
}
