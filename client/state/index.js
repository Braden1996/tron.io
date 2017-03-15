import Immutable from 'immutable';

import inputSaga from './input/sagas';
import lobbySaga from './lobby/sagas';

import socketSaga from './sockets/sagas';
import socketReducer from './sockets/reducers';

import {
  rootSaga as sharedRootSaga,
  rootReducer as sharedRootReducer,
} from '../../shared/state';

export function rootReducer(state = Immutable.Map(), action) {
  const newState = sharedRootReducer(state, action);
  return newState.update('sockets', s => socketReducer(s, action));
}

export function* rootSaga() {
  yield [
    inputSaga(),
    lobbySaga(),
    socketSaga(),
    sharedRootSaga(),
  ];
}
