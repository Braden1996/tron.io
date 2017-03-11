import { takeEvery, put } from 'redux-saga/effects';

import { socketsSend } from '../../sockets/actions';

import {
  INPUT_HOST_ADD_COMPUTER,
  INPUT_HOST_BEGIN_GAME,
} from '../../../../shared/state/input/host/actions';

function* addComputer(action) {
  const eventName = 'addcomputer';
  yield put(socketsSend(eventName));
}

function* beginGame(action) {
  const eventName = 'begingame';
  yield put(socketsSend(eventName));
}

export default function* inputHostSaga() {
  yield takeEvery(INPUT_HOST_ADD_COMPUTER, addComputer);
  yield takeEvery(INPUT_HOST_BEGIN_GAME, beginGame);
}
