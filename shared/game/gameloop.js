import now from 'performance-now';

export default class AbstractGameLoop {
  constructor(callback, tickLength = 15) {
    this.callback = callback;
    this.started = false;

    this.lastTick = null;
    this.tickLength = tickLength;  // 15 = 66.666 tick-rate
  }

  // Abstract
  // internalQueueLoop(callback) { ... }

  // Abstract
  // internalCancelQueueLoop() { ... }

  internalLoop(curtick) {
    if (curtick - this.lastTick >= this.tickLength) {
      const progress = curtick - this.lastTick;

      this.callback(progress);

      this.lastTick = curtick;
    }

    this.internalQueueLoop(this.internalLoop.bind(this));
  }

  getTime() {
    return now().toFixed(3);
  }

  start() {
    if (!this.started) {
      this.started = true;
      const tick = this.getTime();
      this.internalLoop(tick);
    }
  }

  stop() {
    this.internalCancelQueueLoop();
    this.started = false;
  }
}
