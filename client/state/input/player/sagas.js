import { takeEvery, put } from 'redux-saga/effects';

import { socketsSend } from '../../sockets/actions';
import {
  INPUT_KEYBOARD_KEYDOWN,
  INPUT_KEYBOARD_KEYUP,
} from '../keyboard/actions';
import {
  move,
  INPUT_PLAYER_MOVE,
} from '../../../../shared/state/input/player/actions';

function* movePlayer(action) {
  const eventName = 'moveplayer';
  yield put(socketsSend(eventName, action.value));
}

function* controlsKeyDown(action) {
  switch (action.value) {
    case 87:
      yield put(move("north"));
      break;
    case 83:
      yield put(move("south"));
      break;
    case 68:
      yield put(move("east"));
      break;
    case 65:
      yield put(move("west"));
      break;
  }
}

function* controlsKeyUp(action) {
  switch (action.value) {
    case 87:
      break;
  }
}

export default function* inputHostSaga() {
  yield takeEvery(INPUT_KEYBOARD_KEYDOWN, controlsKeyDown);
  yield takeEvery(INPUT_KEYBOARD_KEYUP, controlsKeyUp);
  yield takeEvery(INPUT_PLAYER_MOVE, movePlayer);
}
