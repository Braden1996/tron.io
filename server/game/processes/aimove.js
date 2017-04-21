import getMove from '../../../shared/game/ai';
import { rebuildCache } from '../../../shared/game/operations/general';

process.on('message', (m) => {
  const { compId, searchTime } = m;
  const state = rebuildCache(m.state);

  const ply = state.players.find(pl => pl.id === compId);

  // Pass results back to parent process
  if (ply === undefined) {
    process.send({ direction: undefined, compId: undefined }); // Panic
  } else {
    process.send({ direction: getMove(state, ply, searchTime), compId });
  }
});
