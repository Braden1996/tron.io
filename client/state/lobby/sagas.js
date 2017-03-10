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
    case 'fullstate':
      const { fullState } = action.data;
      console.log('fullstate:', action);
      action.ackFn();
      // yield put(addPlayer(name, color));
      break;
    case 'snapshot':
      //const { name, color } = action.data;
      console.log('snapshot:', action);
      action.ackFn();
      // yield put(addPlayer(name, color));
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
  yield takeEvery(LOBBY_CONNECT, lobbyConnect);
  yield takeEvery(SOCKETS_RECEIVE, playerConnected);
}
