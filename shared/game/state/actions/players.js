import Immutable from 'immutable';


export const ADD_PLAYER = 'ADD_PLAYER';
export function addPlayer(name, color = '#0f0') {
  return {
    type: ADD_PLAYER,
    name,
    color,
  };
}

export const KILL_PLAYER = 'KILL_PLAYER';
export function killPlayer(plyId, deathPosition) {
  return {
    type: KILL_PLAYER,
    id: plyId,
    position: Immutable.List(deathPosition),
  };
}

export const RESET_PLAYERS = 'RESET_PLAYERS';
export function resetPlayers() {
  return {
    type: RESET_PLAYERS,
  };
}

export const UPDATE_PLAYER_DIRECTION = 'UPDATE_PLAYER_DIRECTION';
export function updatePlayerDirection(plyId, direction) {
  return {
    type: UPDATE_PLAYER_DIRECTION,
    id: plyId,
    value: direction,
  };
}

export const UPDATE_PLAYER_POSITION = 'UPDATE_PLAYER_POSITION';
export function updatePlayerPosition(plyId, position) {
  return {
    type: UPDATE_PLAYER_POSITION,
    id: plyId,
    value: Immutable.List(position),
  };
}
