import Immutable from 'immutable';
import {
  LOBBY_CONNECT,
  LOBBY_CONNECT_SUCCESS,
  LOBBY_APPLY_SNAPSHOT,
} from './actions';

import { applySnapshot } from '../../game/network/snapshot';

export const INITIAL_LOBBY_STATE = Immutable.Map({
  key: null,
  connected: false,
  gameState: null,
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
        return state.set('connected', true)
          .set('gameState', gameState);
      }
    case LOBBY_APPLY_SNAPSHOT:
      const curState = state.get('gameState');
      const curStateCopy = JSON.parse(JSON.stringify(curState));
      applySnapshot(curStateCopy, action.value);
      return state.set('gameState', curStateCopy);
    default:
      return state;
  }
}
