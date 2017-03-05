import Immutable from 'immutable';
import {
  SOCKETS_READ_READY,
  SOCKETS_WRITE_READY,
} from './actions';

export const INITIAL_SOCKETS_STATE = Immutable.Map({
  readReady: false,
  writeReady: false
});

export default function socketsReducer(state = INITIAL_SOCKETS_STATE, action) {
  switch (action.type) {
    case SOCKETS_READ_READY:
      return state.set('readReady', true);
    case SOCKETS_WRITE_READY:
      return state.set('writeReady', true);
    default:
      return state;
  }
}
