import path from 'path';
import cp from 'child_process';
import appRootDir from 'app-root-dir';

import gameAiGetMove from '../../ai';
import {
  addPlayer as gameAddPlayer,
  removePlayer as gameRemovePlayer,
  resetPlayers as gameResetPlayers,
} from '../../operations';

export function addComputer(lobby, ply, data, ackFn) {
  if (!lobby.isHost(ply.id)) { return; }

  const state = lobby.game.state;

  const lobbyMisc = lobby.misc;
  lobbyMisc.computerCount = (lobbyMisc.computerCount || 0) + 1;

  const compId = `computer${lobby.misc.computerCount}`;
  const compName = `Computer ${lobby.misc.computerCount}`;
  const compColor = '#0f0';
  const compPly = gameAddPlayer(state, compId, compName, compColor);

  // Begin calculation of AI moves.
  const aiEntryFile = path.resolve(
    appRootDir.get(),
    'build/tronAi/index.js'
  );

  const aiChild = cp.fork(aiEntryFile);
  aiChild.on('message', (m) => {
    const { direction, compId } = m;

    // Get most recent state directly from the lobby.
    const state = lobby.game.state;

    const compPly = state.players.find(pl => pl.id === compId);
    if (compPly !== -1) {
      if (direction !== compPly.direction) {
        const plySize = state.playerSize;
        try {
          directPlayer(compPly, plySize, direction);
        } catch(e) {};
      }

      // Immediately request the AI for their next move.
      aiChild.send({ state, compId });
    }
  });

  // Kick start our AI process.
  aiChild.send({ state, compId });
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
