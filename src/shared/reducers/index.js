import { combineReducers } from 'redux';

import gameReducer from '../game/state/reducers/game';
import playersReducer from '../game/state/reducers/players';
import inputReducer from '../game/state/reducers/input';

// -----------------------------------------------------------------------------
// REDUCER

const rootReducer = (state = {}, action) => {
  const aGameReducer = gameReducer(state.game, action);
  const newState = {
    game: aGameReducer,
    players: playersReducer(state.players, action, aGameReducer),
    input: inputReducer(state.input, action)
  }
  return newState;
}

// -----------------------------------------------------------------------------
// REDUCER EXPORT

export default rootReducer;
