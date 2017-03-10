import { getSnapshot } from './snapshot';

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
  const bindedAck = snapshotAck.bind(this);
  const bindedAckCallback = () => { bindedAck(ply); };

  if (ply.lastTick === null) {
    this.sendFullState(ply.id, curState, bindedAckCallback);
  } else {
    const lastState = this.pastStates[ply.lastTick];
    const difference = getSnapshot(lastState, curState);

    // Check if the state has actually changed. If so, send the snapshot and
    // repeat this process as an acknowledgment. Otherwise, if there is no
    // difference, delay this snapshot until the next tick.
    if (difference && difference.length >= 1) {
      this.sendSnapshot(ply.id, difference, bindedAckCallback);
    } else {
      this.snapshotNextTick.push(bindedAckCallback);
    }
  }

  // Recognise this snapshot as being the new last.
  const curTick = curState.tick;
  ply.lastTick = curTick;
  if (this.pastStates[curTick] === undefined) {
    this.pastStates[curTick] = this.game.copyState(curState);
  }
  this.clearCache();
}

export default class Lobby {
  constructor(id, game) {
    this.id = id;
    this.game = game;

    this.game.loop.subscribe(this.onTick.bind(this));

    const stateCopy = this.game.copyState(this.game.state);
    this.pastStates = {};  // State, identified by its tick.

    // An array of functions which we be called after the next game.loop tick.
    this.snapshotNextTick = [];

    this.players = [];

    // Keep track of players that have recently left the lobby.
    // This is done to allow us to stop sending them snapshot updates.
    this.kickPlayers = [];
  }

  // Abstract
  sendFullState(plyId, state, bindedAckCallback) {
    console.log('No `sendFullState` function has been specified for Lobby!');
  }

  // Abstract
  sendSnapshot(plyId, snapshot, bindedAckCallback) {
    console.log('No `sendSnapshot` function has been specified for Lobby!');
  }

  start() {
    // Kick-off our game-loop!
    this.game.loop.start();
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

  join(plyId, plyData) {
    const ply = {
      id: plyId,
      lastTick: null
    };

    this.players.push(ply);

    this.game.addPlayer(ply.id, plyData);

    const privateProcessSnapshot = processSnapshot.bind(this);
    privateProcessSnapshot(ply);
  }

  leave(plyId) {
    const plyIdx = this.players.findIndex(ply => ply.id === plyId);
    if (plyIdx !== -1) {
      const ply = this.players[plyIdx];
      this.players.splice(plyIdx, 1);
      this.game.removePlayer(ply.id);
      this.kickPlayers.push(ply.id);
    }
  }
}
