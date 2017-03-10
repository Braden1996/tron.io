import { takeEvery, put } from 'redux-saga/effects';

import { socketsSend } from '../sockets/actions';

import {
  INPUT_ADD_COMPUTER,
} from '../../../shared/state/input/actions';

import { addPlayer } from '../../../shared/game/operations';

function* addComputerPlayer(action) {
  const eventName = 'addcomputer';
  yield put(socketsSend(eventName));
}

export default function* inputSaga() {
  yield takeEvery(INPUT_ADD_COMPUTER, addComputerPlayer);
}
