import { getSnapshot, shouldSendSnapshot } from './snapshot';
import { detachPlayer, attachPlayer } from './input';
import gameUpdate from '../update';
import {
  getInitialState,
  copyState,
  addPlayer,
  removePlayer,
} from '../operations';

function snapshotAck(ply) {
  const kickIdx = this.kickPlayers.findIndex(plyId => ply.id === plyId);

  // Check if we should kick this player.
  if (kickIdx !== -1) {
    this.kickPlayers.splice(kickIdx, 1);
  } else {
    const privateProcessSnapshot = processSnapshot.bind(this);
    privateProcessSnapshot(ply);
  }
}

function updateLatencyPrivate(ply, pong) {
  const curTick = this.game.state.tick;
  const fullLatency = curTick - pong;
  const halfLatency = fullLatency === 0 ? 0 : fullLatency / 2;
  ply.latency = Math.max(0, Math.min(this.latencyMax, halfLatency));
}

function processSnapshot(ply) {
  const curState = this.game.state;
  const curTick = curState.tick;
  const bindedAck = snapshotAck.bind(this);
  const updateLatency = updateLatencyPrivate.bind(this);
  const bindedAckCallback = (pong) => {
    updateLatency(ply, pong);
    bindedAck(ply);
  };

  if (ply.lastState === null) {
    this.sendFullState(ply, curState, bindedAckCallback);
  } else {
    const difference = getSnapshot(ply.lastState, curState);

    // Check if the state has actually changed. If so, send the snapshot and
    // repeat this process as an acknowledgment. Otherwise, if there is no
    // difference, delay this snapshot until the next tick.
    if (shouldSendSnapshot(difference)) {
      // console.log("LAST:", ply.lastState, "\n\nCURR:", curState);
      // console.log("Sending Snapshot:", difference);
      this.sendSnapshot(ply, difference, bindedAckCallback);
    } else {
      const checkLaterCallback = (pong) => { bindedAck(ply); };
      this.snapshotNextTick.push(checkLaterCallback);
      return;
    }
  }

  // Recognise this state as being the last communicated to the player.
  ply.lastState = copyState(curState);
}

export default class Lobby {
  constructor(id, game = {}) {
    this.id = id;
    this.game = game;

    // Make sure our input game object is as expected!
    this.game.state = this.game.state || getInitialState();
    this.game.loop.setArgument('state', this.game.state);
    this.game.loop.subscribe(gameUpdate, ['state', 'progress']);
    if (this.game.loop) {
      this.game.loop.subscribe(this.onTick.bind(this));
    }

    this.stateHistory = []; // Buffer of past states.

    // How many ticks are we willing to compensate for?
    this.latencyMax = 500 / this.game.loop.tickLength;
    this.stateHistoryLimit = Math.ceil(this.latencyMax);

    // An array of functions which we be called after the next game.loop tick.
    this.snapshotNextTick = [];

    this.players = [];
    this.host = null;  // Host's player.id

    // Keep track of players that have recently left the lobby.
    // This is done to allow us to stop sending them snapshot updates.
    this.kickPlayers = [];

    // A place to attach arbitrary data to a lobby.
    this.misc = {};
  }

  sendFullState(ply, gameState, bindedAckCallback) {
    const socket = ply.socket;

    const lobbyKey = this.id;
    const plyId = ply.id;
    const hostId = this.host;
    const ping = this.game.state.tick;
    const payload = { lobbyKey, gameState, plyId, hostId, ping };
    socket.emit('fullstate', payload, bindedAckCallback);
  }

  sendSnapshot(ply, snapshot, bindedAckCallback) {
    const socket = ply.socket;
    const ping = this.game.state.tick;
    const payload = { snapshot, ping };
    socket.emit('snapshot', payload, bindedAckCallback);
  }

  start() {
    this.game.loop.start();  // Kick-off our game-loop!
  }

  onTick() {
    const curSnapshots = this.snapshotNextTick;
    this.snapshotNextTick = []; // Clear to-be completed tasks.
    curSnapshots.forEach((snapshotFn) => { snapshotFn(); });

    // Cache past states, so we can rewind the game for lag compensation.
    if (this.stateHistory.length >= this.stateHistoryLimit) {
      const dequeueState = this.stateHistory.shift();
    }
    this.stateHistory.push(copyState(this.game.state));
  }

  size() {
    return this.players.length;
  }

  // Kill this lobby.
  kill() {
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
    this.players.forEach(ply => ply.socket.emit('sethost', this.host));
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

    addPlayer(this.game.state, ply.id, plyData.name, plyData.color);

    const privateProcessSnapshot = processSnapshot.bind(this);
    privateProcessSnapshot(ply);

    attachPlayer(this, ply);
  }

  leave(plyId) {
    const plyIdx = this.players.findIndex(ply => ply.id === plyId);
    if (plyIdx !== -1) {
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

      removePlayer(this.game.state, ply.id);
      this.kickPlayers.push(ply.id);
    }
  }

  // Rewind the game, apply a function, then update the game till we're back at
  // the expected tick. This is to compensate for player latency.
  lagCompensation(ply, applyFn) {
    const plyTick = Math.floor(this.game.state.tick - ply.latency);
    const plyStateIdx = plyTick - this.stateHistory[0].tick;

    // Check if we're out of our bounds.
    if (plyStateIdx < 0 || plyStateIdx > this.stateHistoryLimit) {
      return false;
    } else {
      const plyState = this.stateHistory[plyStateIdx];

      applyFn(plyState);
      this.stateHistory[plyStateIdx] = plyState;

      // Simmulate our game-loop and update the states, ignoring the tick-rate,
      // so we are able to catch back up to where we were.
      if (plyState.tick === this.game.state.tick) {
        this.game.state = copyState(plyState);
      } else {
        let lastState = copyState(plyState);
        while (lastState.tick < this.game.state.tick) {
          const lastIdx = lastState.tick - this.stateHistory[0].tick;
          const newIdx = lastIdx + 1;
          const newProgress = this.stateHistory[newIdx].progress;

          gameUpdate(lastState, newProgress);

          this.stateHistory[newIdx] = copyState(lastState);
        }

        this.game.state = lastState;
      }

      this.game.loop.setArgument('state', this.game.state);

      return true;
    }
  }
}
