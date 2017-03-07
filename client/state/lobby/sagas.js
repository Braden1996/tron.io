import { eventChannel } from 'redux-saga';
import { takeEvery, put } from 'redux-saga/effects';

import {
  SOCKETS_RECEIVE,
  socketsSend
} from '../sockets/actions';

import {
  LOBBY_CONNECT,
  lobbyConnectSuccess
} from '../../../shared/state/lobby/actions';

import { addPlayer } from '../../../shared/game/operations';

function* playerConnected(action) {
  switch (action.eventName) {
    case 'playerconnected':
      const { name, color } = action.data;
      console.log('Connected:', name, color);
      // yield put(addPlayer(name, color));
      break;
  }
}

function* lobbyConnectAck(data) {
  const { success } = data;
  if (success) {
    const { lobbyKey, state } = data;
    console.log('GAME STATE:', state);
    yield put(lobbyConnectSuccess(lobbyKey));
  }
}

function* lobbyConnect(action) {
  const eventName = 'lobbyconnect';
  const { lobbyKey, name, color } = action
  const connectData = { lobbyKey, name, color };
  yield put(socketsSend(eventName, connectData, lobbyConnectAck));
}

export default function* lobbySaga() {
  yield takeEvery(LOBBY_CONNECT, lobbyConnect);
  yield takeEvery(SOCKETS_RECEIVE, playerConnected);
}
