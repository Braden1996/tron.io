import { eventChannel } from 'redux-saga';
import { call, fork, put, take } from 'redux-saga/effects';

import { keyDown, keyUp } from './actions';

function keySubscribe() {
  return eventChannel(emit => {
    window.addEventListener('keydown', (evnt) => {
      emit(keyDown(evnt.keyCode));
    }, false);
    window.addEventListener('keyup', (evnt) => {
      emit(keyUp(evnt.keyCode));
    }, false);
    return () => {};
  });
}

function* keyListen() {
  const channel = yield call(keySubscribe);
  while (true) {
    let action = yield take(channel);
    yield put(action);
  }
}

export default function* inputKeyboardSaga() {
  yield fork(keyListen);
}
