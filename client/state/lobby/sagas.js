import { put, select, takeEvery } from 'redux-saga/effects';

import {
  SOCKETS_RECEIVE,
  socketsSend,
} from '../sockets/actions';

import {
  LOBBY_CONNECT,
  lobbySetHost,
  lobbyConnectSuccess,
  lobbyApplySnapshot,
} from '../../../shared/state/lobby/actions';

function* lobbySocketReceive(action) {
  switch (action.eventName) {
    case 'sethost':
      const newHostId = action.data;
      yield put(lobbySetHost(newHostId));
      break;

    case 'fullstate':
      const { lobbyKey, gameState, plyId, hostId } = action.data;
      yield put(lobbyConnectSuccess(lobbyKey, gameState, plyId, hostId));
      action.ackFn();
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
