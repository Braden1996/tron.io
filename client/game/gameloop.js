import AbstractGameLoop from '../../shared/game/gameloop';

export default class ClientGameLoop extends AbstractGameLoop {
  internalQueueLoop(callback) {
    this.loopId = window.requestAnimationFrame(callback);
  }

  internalCancelQueueLoop() {
    window.cancelAnimationFrame(this.loopId);
  }
}
