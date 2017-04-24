import gameAiGetMove from '../../ai';
import {
  resetPlayers as gameResetPlayers,
  addPlayer as gameAddPlayer,
  removePlayer as gameRemovePlayer,
  directPlayer as gameDirectPlayer,
} from '../../operations/player';
import { rebuildCache, copyState } from '../../operations/general';

export function addComputer(lobby, ply, data, ackFn) {
  if (!lobby.isHost(ply.id)) { return; }


  // Create misc data-structures if needed.
  if (lobby.misc.computerPlayers === undefined) {
    lobby.misc.computerPlayers = [];
    lobby.onDeath.push(() => {
      lobby.misc.computerPlayers.forEach((comp) => {
        comp.moveFork.kill();
      });
    });
  }

  const compNum = 1 + lobby.misc.computerPlayers.reduce((p, c) => {
    return c.compNum > p ? c.compNum : p;
  }, 0);
  const compId = `computer${compNum}`;
  const compName = `Computer ${compNum}`;
  const compColor = '#0f0';

  const moveChangeFcn = (state, direction, compId) => {
    const compPly = state.players.find(pl => pl.id === compId);
    if (compPly.alive && direction !== compPly.direction) {
      try {
        gameDirectPlayer(state, compPly, direction);
      } catch(e) {};
    }
  }

  // Avoid lag compensation from applying the change to an invalid state.
  const checkStateFcn = (state) => {
    const compPly = state.players.find(pl => pl.id === compId);
    return compPly !== undefined && compPly.alive;
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
      const aiMoveChange = s => { moveChangeFcn(s, direction, compId); };
      lobby.stateController.apply(
        aiMoveChange, latency, undefined, checkStateFcn
      );
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

  const comp = { compNum, compId, moveFork, working: false };

  // Setup our AI move process fork.
  const aiMoveFork = lobby.dependencies.aiMoveFork;
  const { killFcn, sendFcn } = aiMoveFork(onMessageCallback);
  moveFork.kill = killFcn;
  moveFork.send = p => { comp.working = true; sendFcn(p); };

  lobby.misc.computerPlayers.push(comp);

  // Add our computer AI player to the game lobby.
  const addCompPly = s => { gameAddPlayer(s, compId, compName, compColor); };
  lobby.stateController.apply(addCompPly, ply.latency);
}

export function beginGame(lobby, ply, data, ackFn) {
  if (!lobby.isHost(ply.id)) { return; }

  const startGameChange = (state) => {
    state.started = true;
    state.finished = false;
  }

  if (!lobby.misc.computerPlayers || lobby.misc.computerPlayers.length === 0) {
    lobby.stateController.apply(startGameChange, 0);
  } else {
    const onStateUpdated = (state) => {
      const updateComps = lobby.misc.computerPlayers.filter(c => !c.working);
      if (updateComps.length === 0) { return; }

      const currentState = lobby.stateController.current();
      const sendState = copyState(currentState);
      sendState.cache = {}; // Rebuild cache in process.
      updateComps.forEach((comp) => {
        const payload = {
          state: sendState, compId: comp.compId, searchTime: 0
        };

        comp.moveFork.send(payload);
      });
    }

    lobby.stateController.apply(startGameChange, 0, onStateUpdated);
  }
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

export function updateSpeed(lobby, ply, data, ackFn) {
  if (!lobby.isHost(ply.id)) { return; }

  const speed = parseFloat(data);
  if (isNaN(speed)) { return; }

  const updateSpeedChange = (state) => { state.speed = speed; }

  lobby.stateController.apply(updateSpeedChange);
}

export function updateArenaSize(lobby, ply, data, ackFn) {
  if (!lobby.isHost(ply.id)) { return; }

  const size = parseFloat(data);
  if (isNaN(size)) { return; }

  const updateArenaSize = (state) => {
    state.arenaSize = size;
    gameResetPlayers(state);
  }

  lobby.stateController.apply(updateArenaSize);
}

export function hostDetachPlayer(lobby, ply) {
  const socket = ply.socket;

  socket.removeAllListeners('addcomputer');
  socket.removeAllListeners('begingame');
  socket.removeAllListeners('endgame');
  socket.removeAllListeners('updatespeed');
  socket.removeAllListeners('updatearenasize');
}

export function hostAttachPlayer(lobby, ply) {
  const socket = ply.socket;

  socket.on('addcomputer', (d, a) => addComputer(lobby, ply, d, a));
  socket.on('begingame', (d, a) => beginGame(lobby, ply, d, a));
  socket.on('endgame', (d, a) => endGame(lobby, ply, d, a));
  socket.on('updatespeed', (d, a) => updateSpeed(lobby, ply, d, a));
  socket.on('updatearenasize', (d, a) => updateArenaSize(lobby, ply, d, a));
}
