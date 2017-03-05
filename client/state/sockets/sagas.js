import io from 'socket.io-client';
import { eventChannel } from 'redux-saga';
import { fork, take, call, put } from 'redux-saga/effects';

import {
  socketsReadReady,
  socketsWriteReady
} from './actions';

import {
  LOBBY_CONNECT,
  lobbyConnectSuccess
} from '../../../shared/state/lobby/actions';

function connect() {
  const socket = io('http://localhost:3000');
  return new Promise(resolve => {
    if (socket.connected) {
      resolve(socket);
    } else {
      socket.on('connect', () => {
        resolve(socket);
      });
    }
  });
}

function subscribe(socket) {
  return eventChannel(emit => {
    socket.on('lobbyconnected', lobbyKey => {
      emit(lobbyConnectSuccess(lobbyKey));
    });
    return () => {};
  });
}

function* read(socket) {
  yield put(socketsReadReady());
  const channel = yield call(subscribe, socket);
  while (true) {
    let action = yield take(channel);
    yield put(action);
  }
}

function* write(socket) {
  yield put(socketsWriteReady());
  while (true) {
    const { value } = yield take(LOBBY_CONNECT);
    socket.emit('lobbyconnect', value);
  }
}

function* handleIO(socket) {
  yield fork(read, socket);
  yield fork(write, socket);
}

function* flow() {
  const socket = yield call(connect);
  const task = yield fork(handleIO, socket);
}

export default function* socketSaga() {
  yield fork(flow);
}
