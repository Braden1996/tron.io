export default class AbstractGameLoop {
  constructor(tickLength = 15) {
    this.subscribers = [];
    this.subscriberArguments = [];
    this.subscriberKeys = {};
    this.arguments = {};
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

  internalCallByIdx(idx) {
    const callback = this.subscribers[idx];
    const iwant = this.subscriberArguments[idx];
    const iget = [];
    for (let j = 0; j < iwant.length; j += 1) {
      iget.push(this.arguments[iwant[j]]);
    }
    callback(...iget);
  }

  internalLoop(curtick) {
    if (curtick - this.lastTick >= this.tickLength) {
      this.arguments.progress = curtick - this.lastTick;

      for (let i = 0; i < this.subscribers.length; i += 1) {
        this.internalCallByIdx(i);
      }

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

  subscribe(callback, iwantArgs = [], key) {
    if (key !== undefined) {
      this.subscriberKeys[key] = callback;
    }

    this.subscribers.push(callback);
    return this.subscriberArguments.push(iwantArgs);
  }

  unsubscribe(id) {
    delete this.subscribers[id - 1];
    delete this.subscriberArguments[id - 1];
  }

  setArgument(key, value) {
    this.arguments[key] = value;
  }

  call(key) {
    const idx = this.subscribers.indexOf(this.subscriberKeys[key]);
    this.internalCallByIdx(idx);
  }
}
