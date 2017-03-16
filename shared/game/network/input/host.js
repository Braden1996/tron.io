import {
  addPlayer as gameAddPlayer,
  removePlayer as gameRemovePlayer,
  resetPlayers as gameResetPlayers,
} from '../../operations';

export function addComputer(lobby, ply, data, ackFn) {
  if (lobby.isHost(ply.id)) {
    const lobbyMisc = lobby.misc;
    lobbyMisc.computerCount = (lobbyMisc.computerCount || 0) + 1;

    const compId = `computer${lobby.misc.computerCount}`;
    const compName = `Computer ${lobby.misc.computerCount}`;
    const compColor = '#0f0';
    gameAddPlayer(lobby.game.state, compId, compName, compColor);
  }
}

export function beginGame(lobby, ply, data, ackFn) {
  if (lobby.isHost(ply.id)) {
    const gameState = lobby.game.state;
    gameState.started = true;
    gameState.finished = false;
  }
}

export function endGame(lobby, ply, data, ackFn) {
  if (lobby.isHost(ply.id)) {
    const gameState = lobby.game.state;
    gameState.started = false;
    gameState.finished = null;
    gameResetPlayers(gameState);
  }
}

export function hostDetachPlayer(lobby, ply) {
  const socket = ply.socket;

  socket.removeAllListeners('addcomputer');
  socket.removeAllListeners('begingame');
  socket.removeAllListeners('endgame');
}

export function hostAttachPlayer(lobby, ply) {
  const socket = ply.socket;
  // const state = lobby.game.state;

  socket.on('addcomputer', (d, a) => addComputer(lobby, ply, d, a));
  socket.on('begingame', (d, a) => beginGame(lobby, ply, d, a));
  socket.on('endgame', (d, a) => endGame(lobby, ply, d, a));
}
