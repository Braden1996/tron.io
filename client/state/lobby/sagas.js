import { eventChannel } from 'redux-saga';
import { takeEvery, put } from 'redux-saga/effects';

import { socketsSend } from '../sockets/actions';

import {
  LOBBY_CONNECT,
  lobbyConnectSuccess
} from '../../../shared/state/lobby/actions';


function* lobbyConnectAck(data) {
  const success = data;
  if (success) {
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
}
