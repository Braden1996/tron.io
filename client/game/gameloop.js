import AbstractGameLoop from '../../shared/game/gameloop';

export default class ClientGameLoop extends AbstractGameLoop {
  internalGetStartTick() {
    return performance.now();
  }

  internalQueueLoop(callback) {
    this.loopId = window.requestAnimationFrame(callback);
  }

  internalCancelQueueLoop() {
    window.cancelAnimationFrame(this.loopId);
  }
}
