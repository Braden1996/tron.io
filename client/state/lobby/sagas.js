import { takeEvery, put } from 'redux-saga/effects';

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

function* lobbyConnect(action) {
  const eventName = 'lobbyconnect';
  const { lobbyKey, name, color } = action
  const connectData = { lobbyKey, name, color };
  yield put(socketsSend(eventName, connectData));
}

export default function* lobbySaga() {
  yield takeEvery(SOCKETS_RECEIVE, lobbySocketReceive);
  yield takeEvery(LOBBY_CONNECT, lobbyConnect);
}
