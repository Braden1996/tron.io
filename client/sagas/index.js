import { takeEvery } from 'redux-saga/effects';

import io from 'socket.io-client';
import { eventChannel } from 'redux-saga';
import { fork, take, call, put } from 'redux-saga/effects';
import {
  LOBBY_CONNECT
} from '../../shared/actions/gamelobby';

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
    socket.on('lobbyconnected', e => {
      console.log(`Connected to lobby: ${e}`);
    });
    return () => {};
  });
}

function* read(socket) {
  const channel = yield call(subscribe, socket);
  while (true) {
    let action = yield take(channel);
    yield put(action);
  }
}

function* write(socket) {
  while (true) {
    console.log(`Waiting to write: ${LOBBY_CONNECT}`);
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

export default function* rootSaga() {
  yield fork(flow);
}
