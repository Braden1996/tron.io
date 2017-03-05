import Immutable from 'immutable';
import {
  LOBBY_CONNECT,
  LOBBY_CONNECT_SUCCESS,
} from './actions';

export const INITIAL_LOBBY_STATE = Immutable.Map({
  key: null,
  connected: false
});

export default function lobbyReducer(state = INITIAL_LOBBY_STATE, action) {
  switch (action.type) {
    case LOBBY_CONNECT:
      return state.set('key', action.value)
        .set('connected', false);
    case LOBBY_CONNECT_SUCCESS:
      // Make sure we've connected to our current lobby.
      if (action.value === state.get('key')) {
        return state.set('connected', true);
      }
    default:
      return state;
  }
}
