import Immutable from 'immutable';

import lobbyReducer from './lobby/reducers';

export function* rootSaga() {} // eslint-disable-line no-empty-function

export function rootReducer(state = Immutable.Map(), action) {
  return state.update('lobby', s => lobbyReducer(s, action));
}
