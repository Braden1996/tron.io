import path from 'path';
import cp from 'child_process';
import appRootDir from 'app-root-dir';

import gameAiGetMove from '../../ai';
import {
  resetPlayers as gameResetPlayers,
  addPlayer as gameAddPlayer,
  removePlayer as gameRemovePlayer,
  directPlayer as gameDirectPlayer,
} from '../../operations/player';
import { copyState } from '../../operations/general';

export function addComputer(lobby, ply, data, ackFn) {
  if (!lobby.isHost(ply.id)) { return; }

  const lobbyMisc = lobby.misc;
  lobbyMisc.computerCount = (lobbyMisc.computerCount || 0) + 1;

  const compId = `computer${lobby.misc.computerCount}`;
  const compName = `Computer ${lobby.misc.computerCount}`;
  const compColor = '#0f0';
  const compPly = gameAddPlayer(lobby.game.state, compId, compName, compColor);

  // Begin calculation of AI moves.
  const aiEntryFile = path.resolve(
    appRootDir.get(),
    'build/tronAi/index.js'
  );

  const applyMoveFn = (state, direction, compId) => {
    const compPly = state.players.find(pl => pl.id === compId);
    if (compPly.alive && direction !== compPly.direction) {
      try {
        gameDirectPlayer(state, compPly, direction);
      } catch(e) {};
    }
  }

  const tr = lobby.game.loop.tickLength
  const searchTime = (lobby.game.state.tick - lobby.stateHistory[1].tick) * tr;

  const aiChild = cp.fork(aiEntryFile);
  let aiLastTick = lobby.game.state.tick; // For lag compensation.
  aiChild.on('message', (m) => {
    const { direction, compId } = m;
    const state = lobby.game.state;
    const compPly = state.players.find(pl => pl.id === compId);

    if (!compPly || lobby.players.length === 0) {
      aiChild.kill('SIGINT');
      return;
    }

    const latency = lobby.game.state.tick - aiLastTick;
    if (direction !== compPly.direction) {
      console.log(`Moving ${compId} ${direction} with latency ${latency}`);
      applyMoveFn(state, direction, compId);
      lobby.lagCompensation(latency, s => applyMoveFn(s, direction, compId));
    }

    aiLastTick = state.tick; // For lag compensation.

    // Immediately request the AI for their next move.
    const sendState = copyState(state);
    sendState.cache = {}; // Rebuild cache in process.

    aiChild.send({ state: sendState, compId, searchTime });
  });

  // Kick start our AI process.
  const sendState = copyState(lobby.game.state);
  sendState.cache = {}; // Rebuild cache in process.
  aiChild.send({ state: sendState, compId, searchTime });
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
