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

  // Create misc data-structures if needed.
  if (lobby.misc.computerPlayers === undefined) {
    lobby.misc.computerPlayers = [];
    lobby.onDeath.push(() => {
      lobby.misc.computerPlayers.forEach((comp) => {
        comp.moveFork.kill();
      });
    })
  }

  const compNum = lobby.misc.computerPlayers.reduce((p, c) => {
    return p > c.compNum ? p : c.compNum;
  }, 0);
  const compId = `computer${compNum}`;
  const compName = `Computer ${compNum}`;
  const compColor = '#0f0';

  const applyMoveFn = (state, direction, compId) => {
    const compPly = state.players.find(pl => pl.id === compId);
    if (compPly.alive && direction !== compPly.direction) {
      try {
        gameDirectPlayer(state, compPly, direction);
      } catch(e) {};
    }
  }

  const moveFork = { kill: undefined, send: undefined };
  let aiStartTime = lobby.stateController.gameLoop.getTime();
  const onMessageCallback = (m) => {
    const { direction, compId } = m;
    const state = lobby.stateController.current();

    const comps = lobby.misc.computerPlayers;
    const compIndex = comps.findIndex(c => c.compId === compId);
    const comp = comps[compIndex];

    // Check if we should die as we're no longer part of the game lobby.
    const compPly = state.players.find(pl => pl.id === compId);
    if (!compPly || lobby.players.length === 0) {
      comps.splice(compIndex, 1);
      comp.moveFork.kill();
      return;
    }

    // Check if we can pause looking for moves.
    if (state.finished || !state.started || !compPly.alive) {
      comp.working = false;
      return;
    }

    // Make our chosen AI move.
    const latency = lobby.stateController.gameLoop.getTime() - aiStartTime;
    if (direction !== compPly.direction) {
      console.log(`Moving ${compId} ${direction} with latency ${latency}ms`);
      lobby.stateController.apply(s => {
        applyMoveFn(s, direction, compId);
      }, latency);
    }

    // Immediately request the AI for their next move.
    const sendState = copyState(state);
    sendState.cache = {}; // Rebuild cache in process.

    aiStartTime = lobby.stateController.gameLoop.getTime();

    // The amount of time (ms) we're willing to give our AI.
    const searchTime = 100;

    const payload = { state: sendState, compId, searchTime};
    comp.moveFork.send(payload);
  };

  // Setup our AI move process fork.
  const aiMoveFork = lobby.dependencies.aiMoveFork;
  const { killFcn, sendFcn } = aiMoveFork(onMessageCallback);
  moveFork.kill = killFcn;
  moveFork.send = sendFcn;

  // Add our computer AI player to the game lobby.
  const addCompPly = s => { gameAddPlayer(s, compId, compName, compColor); };
  lobby.stateController.apply(addCompPly, ply.latency);

  // Kick start our AI process.
  const working = false;
  lobby.misc.computerPlayers.push({ compNum, compId, moveFork, working });
}

export function beginGame(lobby, ply, data, ackFn) {
  if (!lobby.isHost(ply.id)) { return; }

  const startGameChange = (state) => {
    state.started = true;
    state.finished = false;

    // Check if our computer players should begin.
    const currentState = lobby.stateController.current();
    if (lobby.misc.computerPlayers && state.tick === currentState.tick) {
      const sendState = copyState(currentState);
      sendState.cache = {}; // Rebuild cache in process.
      lobby.misc.computerPlayers.forEach((comp) => {
        const { compNum, compId, moveFork, working } = comp;
        if (working) { return; } // Computer is already doing work...

        comp.working = true;
        const payload = { state: sendState, compId, searchTime: 0 };
        moveFork.send(payload);
      });
    }
  }

  lobby.stateController.apply(startGameChange);
}

export function endGame(lobby, ply, data, ackFn) {
  if (!lobby.isHost(ply.id)) { return; }

  const endGameChange = (state) => {
    state.started = false;
    state.finished = null;
    gameResetPlayers(state);
  }

  lobby.stateController.apply(endGameChange);
}

export function hostDetachPlayer(lobby, ply) {
  const socket = ply.socket;

  socket.removeAllListeners('addcomputer');
  socket.removeAllListeners('begingame');
  socket.removeAllListeners('endgame');
}

export function hostAttachPlayer(lobby, ply) {
  const socket = ply.socket;

  socket.on('addcomputer', (d, a) => addComputer(lobby, ply, d, a));
  socket.on('begingame', (d, a) => beginGame(lobby, ply, d, a));
  socket.on('endgame', (d, a) => endGame(lobby, ply, d, a));
}
