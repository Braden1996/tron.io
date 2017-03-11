import updateCollision from './collision';
//import updateControl from './control';
import updateMove from './move';

export default function update(state, progress) {
  state.tick = state.tick + 1;

  if (state.started && !state.finished) {
    // updateControl(state, progress);
    updateMove(state, progress);
    updateCollision(state, progress);

    // Check if the game has now finished.
    const numAlive = state.players.reduce((t, p) => t + (p.alive ? 1 : 0), 0);
    if ((state.players.length === 1 && numAlive === 0) ||
      (state.players.length !== 1 && numAlive <= 1)) {
      state.finished = true;
    }
  }
}
