import now from 'performance-now';

import StateController from './statecontroller.js';
import { getSnapshot, shouldSendSnapshot } from './snapshot';
import { detachPlayer, attachPlayer } from './input';
import { getInitialState, copyState } from '../operations/general';
import { addPlayer, removePlayer } from '../operations/player';

function snapshotAck(ply) {
  // Check if this player has been kicked.
  const kickIdx = this.kickPlayers.findIndex(plyId => ply.id === plyId);
  if (kickIdx !== -1) {
    this.kickPlayers.splice(kickIdx, 1);
    return;
  }

  const privateProcessSnapshot = processSnapshot.bind(this);
  privateProcessSnapshot(ply);
}

// Determine and set the latency from a previous communication.
function updateLatencyPrivate(ply, pong) {
  const curTime = now().toFixed(3);
  const fullLatency = curTime - pong;
  const halfLatency = fullLatency === 0 ? 0 : fullLatency / 2;
  ply.latency = Math.max(0, halfLatency);
}

function processSnapshot(ply) {
  const curState = this.stateController.current();

  const bindedAck = snapshotAck.bind(this);
  const updateLatency = updateLatencyPrivate.bind(this);
  const bindedAckCallback = t => { updateLatency(ply, t); bindedAck(ply); };

  // Is this the first time we're sending the state?
  if (ply.lastState === null) {
    this.sendFullState(ply, curState, bindedAckCallback);
  } else {
    // Construct an object the player can use to reconstruct the state.
    const difference = getSnapshot(ply.lastState, curState);

    // Confirm that this snapshot actually contains data worth sending.
    // Otherwise, schedule to check again later.
    if (!shouldSendSnapshot(difference)) {
      const checkLaterCallback = (pong) => { bindedAck(ply); };
      this.snapshotNextTick.push(checkLaterCallback);
      return;
    }

    // Send the snapshot and schedule for the next snapshot after acknowledgment.
    this.sendSnapshot(ply, difference, bindedAckCallback);
  }

  // Recognise this state as being the last communicated to the player.
  ply.lastState = copyState(curState);
}

export default class Lobby {
  constructor(id, dependencies) {
    this.id = id;

    const { createGameLoop, stateUpdateFork, aiMoveFork } = dependencies;
    this.dependencies = { createGameLoop, stateUpdateFork, aiMoveFork };

    const state = getInitialState();
    const hLimit = 100;  // How many states shall we keep in history?
    const sDeps = { createGameLoop, stateUpdateFork };
    this.stateController = new StateController(state, hLimit, sDeps);

    // Try to process any delayed snapshots when the current state changes.
    const checkSnapshots = () => {
      const curSnapshots = this.snapshotNextTick;
      this.snapshotNextTick = []; // Clear to-be completed tasks.
      curSnapshots.forEach((snapshotFn) => { snapshotFn(); });
      return true;
    }
    this.stateController.updateCallbacks.push(checkSnapshots);

    // If we decide not to send a snapshot, a callback will be added to the
    // following array. This allows us to keep track of the snapshots we need
    // to resend next tick.
    this.snapshotNextTick = [];

    this.players = [];  // An array of all the connected players.
    this.host = null;  // Host player's ID.

    // Keep track of players that have recently left the lobby.
    // We do this so we can cancel their snapshot updates.
    this.kickPlayers = [];

    // An array of function to be called when this lobby dies.
    this.onDeath = [];

    // A place to attach arbitrary data to a lobby.
    this.misc = {};
  }

  sendFullState(ply, gameState, bindedAckCallback) {
    const socket = ply.socket;

    const lobbyKey = this.id;
    const plyId = ply.id;
    const hostId = this.host;
    const ping = this.stateController.gameLoop.getTime();
    const payload = { lobbyKey, gameState, plyId, hostId, ping };
    socket.emit('fullstate', payload, bindedAckCallback);
  }

  sendSnapshot(ply, snapshot, bindedAckCallback) {
    const socket = ply.socket;
    const ping = this.stateController.gameLoop.getTime();
    const payload = { snapshot, ping };
    socket.emit('snapshot', payload, bindedAckCallback);
  }

  start() {
    this.stateController.start();
  }

  size() {
    return this.players.length;
  }

  // Kill this lobby.
  kill() {
    this.onDeath.forEach(fn => { fn(); });
    this.stateController.kill();
    this.players.forEach(ply => this.leave(ply.id));
  }

  isMember(plyId) {
    return this.players.some(ply => ply.id === plyId);
  }

  isHost(plyId) {
    return plyId === this.host;
  }

  setHost(ply) {
    this.host = ply === null ? null : ply.id;
    this.players.forEach(pl => pl.socket.emit('sethost', this.host));
  }

  join(serverPly, plyData) {
    const ply = {
      id: serverPly.id,
      lastState: null,
      socket: serverPly.socket,
      latency: null,
    };

    this.players.push(ply);
    if (this.players.length === 1) {
      this.setHost(ply);
    }

    this.stateController.apply((state) => {
      addPlayer(state, ply.id, plyData.name, plyData.color);
    });

    const privateProcessSnapshot = processSnapshot.bind(this);
    privateProcessSnapshot(ply);

    attachPlayer(this, ply);
  }

  leave(plyId) {
    const plyIdx = this.players.findIndex(ply => ply.id === plyId);
    if (plyIdx === -1) { return; }

    const ply = this.players[plyIdx];
    detachPlayer(this, ply);

    this.players.splice(plyIdx, 1);

    // Check if we need to find a new host.
    if (this.isHost(plyId)) {
      if (this.players.length > 0) {
        this.setHost(this.players[0]);
      } else {
        this.setHost(null);
      }
    }

    this.stateController.apply((state) => {
      removePlayer(state, ply.id);
    });

    this.kickPlayers.push(ply.id);
  }
}
