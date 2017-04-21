import AbstractGameLoop from '../../shared/game/gameloop';

export default class NodeGameLoop extends AbstractGameLoop {
  internalQueueLoop(callback) {
    const time = this.getTime();
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
