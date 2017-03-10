import AbstractGameLoop from '../../shared/game/gameloop';

function getTime() {
  const hrTime = process.hrtime();
  return (hrTime[0] * 1000) + (hrTime[1] / 1000000);
}

export default class NodeGameLoop extends AbstractGameLoop {

  internalGetStartTick() {
    return getTime();
  }

  internalQueueLoop(callback) {
    const time = getTime();
    const resolutionFix = 16;
    if (time - this.lastTick < this.tickLength - resolutionFix) {
      this.lastTimeoutTimer = setTimeout(() => callback(time));
    } else {
      this.lastImmediateTimer = setImmediate(() => callback(time));
    }
  }

  internalCancelQueueLoop() {
    if (this.lastTimer) {
      clearTimeout(this.lastTimeoutTimer);
    } else if (this.lastImmediateTimer) {
      clearImmediate(this.lastImmediateTimer);
    }
  }
}
