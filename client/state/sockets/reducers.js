import Immutable from 'immutable';
import {
  SOCKETS_RECEIVE_READY,
  SOCKETS_SEND_READY,
} from './actions';

export const INITIAL_SOCKETS_STATE = Immutable.Map({
  receiveReady: false,
  sendReady: false,
});

export default function socketsReducer(state = INITIAL_SOCKETS_STATE, action) {
  switch (action.type) {
    case SOCKETS_RECEIVE_READY:
      return state.set('receiveReady', true);
    case SOCKETS_SEND_READY:
      return state.set('sendReady', true);
    default:
      return state;
  }
}
