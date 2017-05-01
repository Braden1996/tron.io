import { copyState, rebuildCache } from '../operations/general';

// Lag compensation massively complicates how we interact with the game state.
// When an update needs to be applied, we must pick a state from history then
// proceed to update said state back to the current point in time. However, we
// must also keep track of all non-deterministic changes to the states, such as
// user-input, otherwise it could end up being unintentionally ignored.
export default class StateController {
  constructor(initialState, historyLimit, dependencies) {
    const { stateUpdateFork, createGameLoop } = dependencies;

    // Object containing data required to run benchmarks.
    this.benchmark = {
      startUpdateTime: undefined,
      gameBeginTime: undefined,
      captureTime: 1000,
      done: false,
    };

    const runBenchmark = (state) => {
      if (state.started) {
        if (this.benchmark.gameBeginTime === undefined) {
          this.benchmark.gameBeginTime = 0;
        } else {
          this.benchmark.gameBeginTime += state.progress;
        }

        const doCapture = this.benchmark.gameBeginTime >=
          this.benchmark.captureTime;
        if (!this.benchmark.done && doCapture) {
          const endTime = this.gameLoop.getTime();
          const duration = endTime - this.benchmark.startUpdateTime;
          console.log(`State update:\ ` +
//tick=${state.tick},\
`captureTime=${this.benchmark.captureTime},\ ` +
//progress=${state.progress}, \
`players=${state.players.length},\
duration=${duration}\
          `);
          this.benchmark.done = true;
        }
      } else {
        this.benchmark.done = false;
        this.benchmark.gameBeginTime = undefined;
      }
    }

    // History: state objects
    this.states = [initialState];

    // History: functions which change a particular state.
    this.changes = [undefined, []];

    // History: boolean indicating unapplied changes for state.
    this.unappliedChanges = [undefined, []];

    // Track the amount of ticks we've missed due to an update in progress.
    // Each element in the array represents a ticks progress.
    // This is to avoid running simultaneous updates.
    this.missedTicks = [];

    // An array of functions to be called once the current state is updated.
    // If the function returns true, it will be kept for the next update.
    // Otherwise, it will be removed from the array.
    this.updateCallbacks = [];

    // To avoid locking the event loop during our state update, we delegate the
    // updates to a separate dedicated process. Only a single state should be
    // updated at any one time.
    const onMessageCallback = (m) => {
      const { state } = m;
      let { stateIndex } = m;

      this.updating = false;

      rebuildCache(state);

      // Insert, or replace, from our state history.
      if (stateIndex === this.states.length) {
        // Add the new state to our history.
        this.states.push(state);
        this.changes.push([]);
        this.unappliedChanges.push([]);

        // If our history is now overcapacity, destroy the oldest entry.
        if (this.states.length >= historyLimit) {
          this.states.shift();
          this.changes.shift();
          this.changes[0] = undefined;

          // Slide up any unapplied changes
          const unappliedChanges = this.unappliedChanges[1];
          if (unappliedChanges.length > 0) {
            this.unappliedChanges[2] = this.unappliedChanges[2]
              .concat(unappliedChanges);
          }
          this.unappliedChanges.shift();
          this.unappliedChanges[0] = undefined;

          stateIndex -= 1;
        }
      } else {
        this.states[stateIndex] = state;
      }

      // Check if we need to catch up to the current state.
      if (stateIndex < (this.states.length + this.missedTicks.length - 1)) {
        const nextStateIdx = stateIndex + 1;

        const progress = ((nextStateIdx > (this.states.length - 1))
          ? this.missedTicks.shift()  // Missed a tick
          : this.states[nextStateIdx].progress // Catching up to state.
        );

        this.update(nextStateIdx, progress);
        return;
      }

      runBenchmark(state);

      // Alert our creator that the most-recent state has just changed.
      this.updateCallbacks = this.updateCallbacks.filter(fcn => fcn(state));

      // Check if there exists an update which was missed due to being
      // scheduled after we had updated its associated state. Ignore changes
      // for states that haven't occured yet.
      const nextStateIdx = this.unappliedChanges
        .findIndex(u => u && u.length > 0);
      if (nextStateIdx >= 1 && nextStateIdx < (this.states.length - 1)) {
        const progress = this.states[nextStateIdx].progress;
        this.update(nextStateIdx, progress);
      }
    };

    const { killFcn, sendFcn } = stateUpdateFork(onMessageCallback);
    this.updateFork = { kill: killFcn, send: sendFcn };

    // Prevent updates after we've died.
    this.dead = false;

    // Avoid running multiple updates.
    this.updating = false;

    // Delegate state updates to a dedicated process.
    const loopCallback = (progress) => {
      if (this.updating) {
        this.missedTicks.push(progress);
      } else {
        const stateIndex = this.states.length;
        this.update(stateIndex, progress);
      }
    }
    const loopTickrate = 15;
    this.gameLoop = createGameLoop(loopCallback, loopTickrate);
  }

  // Apply changes to the game state using the given function.
  // Latency is used for the purpose of lag compensation.
  apply(changeFcn, latency = 0, onUpdateFcn = undefined, stateCheckFcn = undefined) {
    // Calculate the lag compensated state index.
    let state;
    let stateIndex = this.states.length;

    // Get the state which was closest to current when we go back by latency.
    let progressSum = 0;
    while (progressSum <= latency && stateIndex > 1) {
      const previousStateIndex = stateIndex - 1;
      const previousState = this.states[previousStateIndex];

      // Check if our lag compensation should round to the current state.
      if ((latency - progressSum) <= (previousState.progress / 2)) {
        break;

      // Otherwise, move onto the previous state.
      } else {
        state = previousState;
        stateIndex = previousStateIndex;
        progressSum += state.progress;
      }
    }

    // Go forward in time to the closest state which passes the check.
    if (stateCheckFcn !== undefined) {
      while (stateIndex < this.states.length && !stateCheckFcn(state)) {
        stateIndex += 1;
        state = this.states[stateIndex];
      }
    }

    // Record the change for future reference.
    const changeObj = { changeFcn, onUpdateFcn };
    this.changes[stateIndex].push(changeObj);
    this.unappliedChanges[stateIndex].push(changeObj);

    // Only trigger an update if we're not already updating
    // and the change is for a past state.
    if (this.updating === false && stateIndex < (this.states.length - 1)) {
      const progress = this.states[stateIndex + 1].progress;
      this.update(stateIndex, progress);
    }
  }

  // Update the state starting from, and including, the state at stateIdx.
  update(stateIndex, progress) {
    if (this.updating || this.dead) { return; } // Can no longer update.

    this.updating = true;

    // Get a copy of the current state.
    const state = copyState(this.states[stateIndex - 1]);

    // Apply, in-order, all the changes we have queued for the current state.
    this.changes[stateIndex].forEach((ch, k) => {
      ch.changeFcn(state);
      if (ch.onUpdateFcn !== undefined) {
        this.updateCallbacks.push(ch.onUpdateFcn);
      }
    });
    this.unappliedChanges[stateIndex] = []; // Empty

    // Delegate the actual update to our update process.
    state.cache = {};  // Avoid communicating length state
    const updatePayload = { state, stateIndex, progress };
    this.benchmark.startUpdateTime = this.gameLoop.getTime();
    this.updateFork.send(updatePayload);
  }

  // Return the current state.
  current() {
    return this.states[this.states.length - 1];
  }

  start() {
    this.gameLoop.start();  // Kick-off our game-loop!
  }

  kill() {
    this.dead = true;
    this.gameLoop.stop();
    this.updateFork.kill();
  }
}
