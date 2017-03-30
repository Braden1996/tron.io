import Immutable from 'immutable';
import {
  LOBBY_CONNECT,
  LOBBY_CONNECT_SUCCESS,
  LOBBY_APPLY_SNAPSHOT,
  LOBBY_SET_HOST,
  LOBBY_SET_NAME,
} from './actions';

import {
  getInitialState,
  copyState,
  rebuildCache,
} from '../../game/operations/general';
import { applySnapshot } from '../../game/network/snapshot';


const initState = getInitialState();
export const INITIAL_LOBBY_STATE = Immutable.Map({
  key: null,
  connected: false,
  gameState: initState,  // Will be mutated!
  lastGameState: initState,  // Last verified state from server.,
  host: null,
  me: Immutable.Map({ id: null, name: 'Player', color: '#0f0' }),
});

export default function lobbyReducer(state = INITIAL_LOBBY_STATE, action) {
  switch (action.type) {
    case LOBBY_CONNECT: {
      return state.set('key', action.value)
        .set('connected', false);
    }

    case LOBBY_CONNECT_SUCCESS: {
      const { lobbyKey, gameState, plyId, hostId } = action;

      // Make sure we've connected to the intended lobby.
      if (lobbyKey === state.get('key')) {
        const gameStateNew = copyState(rebuildCache(gameState));
        return state.set('connected', true)
          .set('gameState', gameStateNew)
          .set('lastGameState', gameState)
          .update('me', me => me.set('id', plyId))
          .set('host', hostId);
      }
      return state;
    }

    case LOBBY_APPLY_SNAPSHOT: {
      const snapshot = action.value;

      // Apply updates to last state then rebuild the cache.
      const lastState = rebuildCache(
        applySnapshot(state.get('lastGameState'), snapshot)
      );

      const lastStateNew = copyState(lastState);

      return state.set('gameState', lastStateNew)
        .set('lastGameState', lastState);
    }

    case LOBBY_SET_HOST: {
      return state.set('host', action.hostId);
    }

    case LOBBY_SET_NAME: {
      const name = action.value;
      return state.update('me', me => me.set('name', name));
    }

    default:
      return state;
  }
}
