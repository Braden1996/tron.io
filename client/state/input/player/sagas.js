import { put, select, takeEvery } from 'redux-saga/effects';

import { socketsSend } from '../../sockets/actions';
import { INPUT_KEYBOARD_KEYDOWN } from '../keyboard/actions';
import {
  move,
  INPUT_PLAYER_MOVE,
} from '../../../../shared/state/input/player/actions';
import {
  directPlayer as gameDirectPlayer,
} from '../../../../shared/game/operations/player';

const getGameState = state => state.get('lobby').get('gameState');
const getClientPlayer = (state) => {
  const gameState = getGameState(state);
  const clientId = state.get('lobby').get('me').get('id');
  return gameState.players.find(ply => ply.id === clientId);
};

function* directPlayer(action) {
  const direction = action.value;
  const gameState = yield select(getGameState);
  const clientPly = yield select(getClientPlayer);
  const plySize = gameState.playerSize;

  // Only process command if the client player is alive.
  if (clientPly.alive) {
    // Try to predict the move now whilst we wait for a snapshot.
     try {
      gameDirectPlayer(clientPly, plySize, direction);
     } catch(e) {
      return;  // Don't send to server.
    };

    yield put(socketsSend('directplayer', direction));
  }
}


function* controlsKeyDown(action) {
  const gameState = yield select(getGameState);

  if (gameState.started && !gameState.finished) {
    switch (action.value) {
      case 87:
        yield put(move('north'));
        break;
      case 83:
        yield put(move('south'));
        break;
      case 68:
        yield put(move('east'));
        break;
      case 65:
        yield put(move('west'));
        break;
      default:
        break;
    }
  }
}

export default function* inputHostSaga() {
  yield takeEvery(INPUT_KEYBOARD_KEYDOWN, controlsKeyDown);
  yield takeEvery(INPUT_PLAYER_MOVE, directPlayer);
}
