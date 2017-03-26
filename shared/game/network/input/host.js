import Threads from 'webworker-threads';

import gameAiGetMove from '../../ai';
import {
  addPlayer as gameAddPlayer,
  removePlayer as gameRemovePlayer,
  resetPlayers as gameResetPlayers,
} from '../../operations';

export function addComputer(lobby, ply, data, ackFn) {
  if (!lobby.isHost(ply.id)) { return; }

  const lobbyMisc = lobby.misc;
  lobbyMisc.computerCount = (lobbyMisc.computerCount || 0) + 1;

  const state = lobby.game.state;

  const compId = `computer${lobby.misc.computerCount}`;
  const compName = `Computer ${lobby.misc.computerCount}`;
  const compColor = '#0f0';
  const compPly = gameAddPlayer(state, compId, compName, compColor);

  // Begin calculation of AI moves.
  console.log(Worker);
  const aiWorker = new Worker(() => {
    this.onmessage = (evnt) => {
      const { state, compId } = evnt;
      const compPly = state.players.find(pl => pl.id === compId);

      let direction;
      if (compPly !== -1) {
        direction = gameAiGetMove(state, compPly);
      }
      postMessage({ direction, compPly});
    }
  });
  aiWorker.onmessage = (evnt) => {
    const { direction, compId } = evnt;
    const compPly = state.players.find(pl => pl.id === compId);
    if (compPly !== -1) {
      const newDirection = m[1];
      if (newDirection !== compPly.direction) {
        const plySize = state.playerSize;
        try {
          directPlayer(compPly, plySize, newDirection);
        } catch(e) {};
      }

      // Immediately request the AI for their next move.
      this.aiChild.send({ state, compId });
    }
  };

  // Kick start our AI thread.
  aiWorker.postMessage({ state, compId });
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
