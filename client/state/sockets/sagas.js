import io from 'socket.io-client';
import socketioWildcard from 'socketio-wildcard';
import { eventChannel } from 'redux-saga';
import { fork, take, call, put } from 'redux-saga/effects';

import {
  socketsReceiveReady,
  socketsSendReady,
  socketsReceive,
  SOCKETS_SEND
} from './actions';

const patch = socketioWildcard(io.Manager);

function connect() {
  // Should find a better way of getting this address.
  const socket = io('http://192.168.0.24:3000');
  patch(socket);
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
    socket.on('*', packet => {
      const eventName = packet.data[0];
      const data = packet.data[1];
      const ackFn = packet.data[2];
      emit(socketsReceive(eventName, data, ackFn));
    });
    return () => {};
  });
}

function* read(socket) {
  yield put(socketsReceiveReady());
  const channel = yield call(subscribe, socket);
  while (true) {
    let action = yield take(channel);
    yield put(action);
  }
}

function* write(socket) {
  yield put(socketsSendReady());
  while (true) {
    const { eventName, data, ackFn } = yield take(SOCKETS_SEND);
    let realAckFn;
    if (ackFn) {
      const internalAckFn = () => new Promise(resolve => {
        socket.emit(eventName, data, resolve);
      });
      const ackData = yield call(internalAckFn);
      yield call(ackFn, ackData);
    } else {
      socket.emit(eventName, data);
    }
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
