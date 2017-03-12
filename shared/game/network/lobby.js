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

function processSnapshot(ply) {
  const curState = this.game.state;
  const curTick = curState.tick;
  const bindedAck = snapshotAck.bind(this);
  const bindedAckCallback = () => { bindedAck(ply); };

  if (ply.lastTick === null) {
    this.sendFullState(ply, curState, bindedAckCallback);
  } else {
    const lastState = this.pastStates[ply.lastTick];
    const difference = getSnapshot(lastState, curState);

    // Check if the state has actually changed. If so, send the snapshot and
    // repeat this process as an acknowledgment. Otherwise, if there is no
    // difference, delay this snapshot until the next tick.
    if (shouldSendSnapshot(difference)) {
      this.sendSnapshot(ply, difference, bindedAckCallback);
    } else {
      this.snapshotNextTick.push(bindedAckCallback);
    }
  }

  // Recognise this snapshot as being the new last.
  ply.lastTick = curTick;
  if (this.pastStates[curTick] === undefined) {
    this.pastStates[curTick] = copyState(curState);
  }
  this.clearCache();
}

export default class Lobby {
  constructor(id, game = {}) {
    this.id = id;
    this.game = game;

    // Make sure our input game object is as expected!
    this.game.state = this.game.state || getInitialState();
    if (this.game.loop) {
      this.game.loop.subscribe(this.onTick.bind(this));
    }
    this.game.loop.setArgument('state', this.game.state);
    this.game.loop.subscribe(gameUpdate, ['state', 'progress']);

    this.pastStates = {};  // State, identified by its tick.

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
    const payload = { lobbyKey, gameState, plyId, hostId };
    socket.emit('fullstate', payload, bindedAckCallback);
  }

  sendSnapshot(ply, snapshot, bindedAckCallback) {
    const socket = ply.socket;
    socket.emit('snapshot', snapshot, bindedAckCallback);
  }

  start() {
    this.game.loop.start();  // Kick-off our game-loop!
  }

  onTick() {
    const curSnapshots = this.snapshotNextTick;
    this.snapshotNextTick = []; // Clear to-be completed tasks.
    curSnapshots.forEach((snapshotFn) => { snapshotFn(); });
  }

  clearCache() {
    const keepTicks = this.players.map(ply => ply.lastTick);
    Object.keys(this.pastStates).forEach((tick) => {
      if (keepTicks.indexOf(parseInt(tick)) === -1) {
        delete this.pastStates[tick];
      }
    });
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
      lastTick: null,
      socket: serverPly.socket,
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
}
