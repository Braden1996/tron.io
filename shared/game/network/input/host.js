import gameAiGetMove from '../../ai';
import {
  resetPlayers as gameResetPlayers,
  addPlayer as gameAddPlayer,
  removePlayer as gameRemovePlayer,
  directPlayer as gameDirectPlayer,
} from '../../operations/player';
import { rebuildCache, copyState } from '../../operations/general';

export function addComputer(lobby, ply, data, ackFn, aiConfig) {
  if (!lobby.isHost(ply.id)) { return; }

  // How long to calculate a single move?
  const searchTime = aiConfig.searchTime;

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
      const lastPoint = compPly.trail[compPly.trail.length - 2];
      const xDiff = lastPoint[0] - compPly.position[0];
      const yDiff = lastPoint[1] - compPly.position[1];
      const curDistance = Math.abs(xDiff + yDiff);
      if (curDistance < state.playerSize) { return; } // Throw away move :(
      gameDirectPlayer(state, compPly, direction);
    }
  }

  let aiStartTime = lobby.stateController.gameLoop.getTime();

  // Called when the current game state is updated with our AI's last move.
  const nextMoveFcn = (state) => {
    const comps = lobby.misc.computerPlayers;
    const compIndex = comps.findIndex(c => c.compId === compId);
    const comp = comps[compIndex];

    // Check the AI move fork isn't busy, i.e. this function was called during
    // lag compensation for an unrelated change.
    if (comp.working) { return; }

    const compPly = state.players.find(pl => pl.id === compId);

    // Check if we can now pause looking for more moves.
    if (state.finished || !state.started || !compPly.alive) { return; }

    // Otherwise, immediately request the AI for their next move.
    const sendState = copyState(state);
    sendState.cache = {}; // Rebuild cache in process.

    // Track latency.
    const time = lobby.stateController.gameLoop.getTime()
    const latency = time - aiStartTime;
    aiStartTime = time;

    const payload = { state: sendState, compId, searchTime, latency };
    comp.moveFork.send(payload);
  }

  // Avoid lag compensation from applying the change to an invalid state.
  const checkStateFcn = (state, stateIndex) => {
    const previousState = lobby.stateController.states[stateIndex - 1];

    const compPl = previousState.players.find(pl => pl.id === compId);
    if (compPl === undefined || !compPl.alive) { return false; }

    const lastPoint = compPl.trail[compPl.trail.length - 2];

    const xDiff = lastPoint[0] - compPl.position[0];
    const yDiff = lastPoint[1] - compPl.position[1];
    const curDistance = Math.abs(xDiff + yDiff);
    return curDistance >= previousState.playerSize;
  }

  const moveFork = { kill: undefined, send: undefined };
  const onMessageCallback = (m) => {
    const { direction, compId } = m;
    const state = lobby.stateController.current();

    const comps = lobby.misc.computerPlayers;
    const compIndex = comps.findIndex(c => c.compId === compId);
    const comp = comps[compIndex];

    comp.working = false;

    // Check if the AI should die as they're no longer part of the game lobby.
    const compPly = state.players.find(pl => pl.id === compId);
    if (!compPly || lobby.players.length === 0) {
      comps.splice(compIndex, 1);
      comp.moveFork.kill();
      return;
    }

    // Apply the move if the AI wants to change direction. Otherwise, just
    // request their next move.
    if (direction === compPly.direction) {
      nextMoveFcn(state);
    } else {
      const latency = lobby.stateController.gameLoop.getTime() - aiStartTime;
      const aiMoveChange = s => { moveChangeFcn(s, direction, compId); };
      lobby.stateController.apply(
        aiMoveChange, latency, nextMoveFcn, checkStateFcn
      );
    }
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

export function hostAttachPlayer(lobby, ply, serverConfig) {
  const socket = ply.socket;

  const aiConfig = serverConfig.ai;

  socket.on('addcomputer', (d, a) => addComputer(lobby, ply, d, a, aiConfig));
  socket.on('begingame', (d, a) => beginGame(lobby, ply, d, a));
  socket.on('endgame', (d, a) => endGame(lobby, ply, d, a));
  socket.on('updatespeed', (d, a) => updateSpeed(lobby, ply, d, a));
  socket.on('updatearenasize', (d, a) => updateArenaSize(lobby, ply, d, a));
}
