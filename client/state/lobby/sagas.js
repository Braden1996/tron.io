import { put, select, takeEvery } from 'redux-saga/effects';

import {
  SOCKETS_RECEIVE,
  socketsSend,
} from '../sockets/actions';

import {
  LOBBY_CONNECT,
  lobbyConnectSuccess,
  lobbyApplySnapshot,
} from '../../../shared/state/lobby/actions';

import { addPlayer } from '../../../shared/game/operations';

function* lobbySocketReceive(action) {
  switch (action.eventName) {
    case 'fullstate':
      const { lobbyKey, fullState } = action.data;
      action.ackFn();
      yield put(lobbyConnectSuccess(lobbyKey, fullState));
      break;
    case 'snapshot':
      const snapshot = action.data;
      action.ackFn();
      yield put(lobbyApplySnapshot(snapshot));
      break;
  }
}

const getName = state => state.get('lobby').get('me').get('name');
const getColor = state => state.get('lobby').get('me').get('color');
function* lobbyConnect(action) {
  const eventName = 'lobbyconnect';
  const lobbyKey = action.value;
  const name = yield select(getName);
  const color = yield select(getColor);
  const connectData = { lobbyKey, name, color };
  yield put(socketsSend(eventName, connectData));
}

export default function* lobbySaga() {
  yield takeEvery(SOCKETS_RECEIVE, lobbySocketReceive);
  yield takeEvery(LOBBY_CONNECT, lobbyConnect);
}
