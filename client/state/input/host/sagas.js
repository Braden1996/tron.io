import { takeEvery, put } from 'redux-saga/effects';

import { socketsSend } from '../../sockets/actions';

import {
  INPUT_HOST_ADD_COMPUTER,
  INPUT_HOST_BEGIN_GAME,
  INPUT_HOST_END_GAME,
  INPUT_HOST_UPDATE_SPEED,
  INPUT_HOST_UPDATE_ARENA_SIZE,
} from '../../../../shared/state/input/host/actions';

function* addComputer(action) {
  const eventName = 'addcomputer';
  yield put(socketsSend(eventName));
}

function* beginGame(action) {
  const eventName = 'begingame';
  yield put(socketsSend(eventName));
}

function* endGame(action) {
  const eventName = 'endgame';
  yield put(socketsSend(eventName));
}

function* updateSpeed(action) {
  const eventName = 'updatespeed';
  const speed = action.speed;
  yield put(socketsSend(eventName, speed));
}

function* updateArenaSize(action) {
  const eventName = 'updatearenasize';
  const size = action.size;
  yield put(socketsSend(eventName, size));
}

export default function* inputHostSaga() {
  yield takeEvery(INPUT_HOST_ADD_COMPUTER, addComputer);
  yield takeEvery(INPUT_HOST_BEGIN_GAME, beginGame);
  yield takeEvery(INPUT_HOST_END_GAME, endGame);
  yield takeEvery(INPUT_HOST_UPDATE_SPEED, updateSpeed);
  yield takeEvery(INPUT_HOST_UPDATE_ARENA_SIZE, updateArenaSize);
}
