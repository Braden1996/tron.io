import getMinimaxMove from './minimax';
import { rebuildCache } from '../operations/general';

export default function getMove(state, ply) {
  if (state.started && !state.finished) {
    const { direction } = getMinimaxMove(state, ply);
    console.log(direction);
    return direction;
  }

  return ply.direction;
}

process.on('message', (m) => {
  const { compId } = m;
  const state = rebuildCache(m.state);

  const ply = state.players.find(pl => pl.id === compId);

  // Pass results back to parent process
  if (ply === undefined) {
    process.send({ direction: undefined, compId: undefined }); // Panic
  } else {
    process.send({ direction: getMove(state, ply), compId });
  }
});
