export default class AbstractGameLoop {
  constructor(callback, tickLength = 15) {
    this.callback = callback;
    this.started = false;

    this.lastTick = null;
    this.tickLength = tickLength;  // 15 = 66.666 tick-rate
  }

  // Abstract
  // internalGetStartTick() { ... }

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

  start() {
    if (!this.started) {
      this.started = true;
      const tick = this.internalGetStartTick();
      this.internalLoop(tick);
    }
  }

  stop() {
    this.internalCancelQueueLoop();
    this.started = false;
  }
}
