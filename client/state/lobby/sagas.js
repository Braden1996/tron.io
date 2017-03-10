import { eventChannel } from 'redux-saga';
import { takeEvery, put } from 'redux-saga/effects';

import {
  SOCKETS_RECEIVE,
  socketsSend,
} from '../sockets/actions';

import {
  LOBBY_CONNECT,
  LOBBY_ADD_COMPUTER,
  lobbyConnectSuccess,
  lobbyApplySnapshot,
} from '../../../shared/state/lobby/actions';

import { addPlayer } from '../../../shared/game/operations';

function* playerConnected(action) {
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

function* addComputerPlayer(action) {
  const eventName = 'addcomputer';
  yield put(socketsSend(eventName));
}

export default function* lobbySaga() {
  yield takeEvery(SOCKETS_RECEIVE, playerConnected);
  yield takeEvery(LOBBY_CONNECT, lobbyConnect);
  yield takeEvery(LOBBY_ADD_COMPUTER, addComputerPlayer);
}
