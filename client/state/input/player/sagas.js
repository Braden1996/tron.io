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
const getClientPlayer = (state) => {
  const gameState = getGameState(state);
  const clientId = state.get('lobby').get('me').get('id');
  return gameState.players.find(ply => ply.id === clientId);
}

function* movePlayer(action) {
  const eventName = 'moveplayer';
  const direction = action.value;
  const gameState = yield select(getGameState);
  const clientPly = yield select(getClientPlayer);
  const plySize = gameState.playerSize;

  // Try to predict the move now whilst we wait for a snapshot.
  updatePlayerDirection(clientPly, plySize, direction);

  yield put(socketsSend(eventName, direction));
}


function* controlsKeyDown(action) {
  const gameState = yield select(getGameState);

  if (gameState.started && !gameState.finished) {
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
}

function* controlsKeyUp(action) {
  const gameState = yield select(getGameState);

  if (gameState.started && !gameState.finished) {
    switch (action.value) {
      case 87:
        break;
    }
  }
}

export default function* inputHostSaga() {
  yield takeEvery(INPUT_KEYBOARD_KEYDOWN, controlsKeyDown);
  yield takeEvery(INPUT_KEYBOARD_KEYUP, controlsKeyUp);
  yield takeEvery(INPUT_PLAYER_MOVE, movePlayer);
}
