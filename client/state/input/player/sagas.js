import { put, select, takeEvery } from 'redux-saga/effects';

import { socketsSend } from '../../sockets/actions';
import {
  INPUT_KEYBOARD_KEYDOWN,
  INPUT_KEYBOARD_KEYUP,
} from '../keyboard/actions';
import {
  move,
  INPUT_PLAYER_MOVE,
} from '../../../../shared/state/input/player/actions';
import {
  updatePlayerDirection
} from '../../../../shared/game/operations';


const getGameState = state => state.get('lobby').get('gameState');

function* movePlayer(action) {
  const eventName = 'moveplayer';
  const direction = action.value;

  // Try to predict the move now, instead of waiting for a snapshot.
  const gameState = yield select(getGameState);
  const ply = gameState.players[0];
  const plySize = gameState.playerSize;
  updatePlayerDirection(ply, plySize, direction);

  yield put(socketsSend(eventName, direction));
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
