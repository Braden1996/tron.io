import { getSnapshot } from './snapshot';

function snapshotAck(plyId) {
  // Check if we should kick this player.
  if (this.kickPlayers.indexOf(plyId) !== -1) {
    delete this.kickPlayers[plyId]; // Has effectively now been kicked.
  } else {
    const privateProcessSnapshot = processSnapshot.bind(this);
    privateProcessSnapshot(plyId);
  }
}

function processSnapshot(plyId) {
  const lastTick = this.playersLastTick[plyId];
  const curState = this.state;
  const bindedAck = snapshotAck.bind(this);
  const bindedAckCallback = () => { bindedAck(plyId); };

  if (lastTick === null) {
    this.sendFullState(plyId, curState, bindedAckCallback);
  } else {
    const lastState = this.pastStates[lastTick];
    const difference = getSnapshot(lastState, curState);

    // Check if the state has actually changed. If so, send the snapshot and
    // repeat this process as an acknowledgment. Otherwise, if there is no
    // difference, delay this snapshot until the next tick.
    if (difference && difference.length >= 1) {
      this.sendSnapshot(plyId, difference, bindedAckCallback);
    } else {
      this.nextTickTasks.push(bindedAckCallback);
    }
  }

  // Recognise this new snapshot as being the new last.
  const curTick = curState.tick;
  this.playersLastTick[plyId] = curTick;
  if (this.pastStates[curTick] === undefined) {
    const curStateCopy = JSON.parse(JSON.stringify(curState));
    this.pastStates[curTick] = curStateCopy;
  }
  this.clearCache();
}

export default class Lobby {
  constructor(initialState, sendFcn) {
    this.state = initialState;

    const stateCopy = JSON.parse(JSON.stringify(this.state));
    this.pastStates = {};  // State, identified by its tick.
    this.playersLastTick = {};  // Last tick (state id) sent to player.
    this.nextTickTasks = [];

    this.kickPlayers = [];
  }

  sendFullState(plyId, state, bindedAckCallback) {
    console.log('No `sendFullState` function has been specified for Lobby!');
  }

  sendSnapshot(plyId, snapshot, bindedAckCallback) {
    console.log('No `sendSnapshot` function has been specified for Lobby!');
  }

  onTick() {
    const curTasks = this.nextTickTasks;
    this.nextTickTasks = []; // Clear to-be completed tasks.
    curTasks.forEach((taskFn) => { taskFn(); });
  }

  clearCache() {
    const playersArray = Object.keys(this.playersLastTick);
    const keepTicks = playersArray.map(plyId => this.playersLastTick[plyId]);
    Object.keys(this.pastStates).forEach((tick) => {
      if (keepTicks.indexOf(parseInt(tick)) === -1) {
        delete this.pastStates[tick];
      }
    });
  }

  size() {
    return Object.keys(this.playersLastTick).length;
  }

  // Kill this lobby.
  kill() {
    const players = Object.keys(this.playersLastTick)
    players.forEach(plyId => this.leave(plyId));
  }

  isMember(plyId) {
    return this.playersLastTick[plyId] !== undefined;
  }

  join(plyId) {
    this.playersLastTick[plyId] = null;

    const privateProcessSnapshot = processSnapshot.bind(this);
    privateProcessSnapshot(plyId);
  }

  leave(plyId) {
    this.kickPlayers.push(plyId);
    delete this.playersLastTick[plyId];
  }
}
