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

import {
  addPlayer
} from '../../../shared/game/state/actions/players';

function* playerConnected(action) {
  switch (action.eventName) {
    case 'playerconnected':
      const name = action.data;
      yield put(addPlayer(name));
      break;
  }
}

function* lobbyConnectAck(data) {
  const { success } = data;
  if (success) {
    const { name } = data;
    yield put(addPlayer(name));
    yield put(lobbyConnectSuccess('RandomLobbyString'));
  }
}

function* lobbyConnect(action) {
  const eventName = 'lobbyconnect';
  const lobbyKey = action.value;
  yield put(socketsSend(eventName, lobbyKey, lobbyConnectAck));
}

export default function* lobbySaga() {
  yield takeEvery(LOBBY_CONNECT, lobbyConnect);
  yield takeEvery(SOCKETS_RECEIVE, playerConnected);
}
