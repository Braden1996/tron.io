import {
  addPlayer as gameAddPlayer,
  removePlayer as gameRemovePlayer,
} from '../../operations';

export function addComputer(lobby, ply, data, ackFn) {
  if (lobby.isHost(ply.id)) {
    gameAddPlayer(lobby.game.state, 'aUniqueID', 'Computer Player', '#0f0');
  }
}

export function beginGame(lobby, ply, data, ackFn) {
  if (lobby.isHost(ply.id)) {
    lobby.game.state.started = true;
    lobby.game.state.finished = false;
  }
}

export function hostDetachPlayer(lobby, ply) {
  const socket = ply.socket;

  socket.removeAllListeners('addcomputer');
  socket.removeAllListeners('begingame');
}

export function hostAttachPlayer(lobby, ply) {
  const socket = ply.socket;
  const state = lobby.game.state;

  socket.on('addcomputer', (d, a) => addComputer(lobby, ply, d, a));
  socket.on('begingame', (d, a) => beginGame(lobby, ply, d, a));
}
