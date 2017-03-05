export default class GameLoop {
  constructor() {
    this.subscribers = [];
    this.subscriberArguments = [];
    this.subscriberKeys = {};
    this.arguments = {};
    this.loopID = null;
    this.lastTick = null;
  }

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
    this.arguments.progress = curtick - this.lastTick;

    for (let i = 0; i < this.subscribers.length; i += 1) {
      this.internalCallByIdx(i);
    }

    this.loopID = window.requestAnimationFrame(this.internalLoop.bind(this));

    this.lastTick = curtick;
  }

  start() {
    if (!this.loopID) {
      const tick = performance.now();
      this.internalLoop(tick);
    }
  }

  stop() {
    window.cancelAnimationFrame(this.loopID);
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
