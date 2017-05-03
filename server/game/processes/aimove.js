import getMove from '../../../shared/game/ai';
import { rebuildCache } from '../../../shared/game/operations/general';

process.on('message', (m) => {
  const { compId, searchTime, debugAi } = m;
  const state = rebuildCache(m.state);

  const ply = state.players.find(pl => pl.id === compId);

  // Pass results back to parent process
  if (ply === undefined) {
    process.send({ direction: undefined, compId: undefined }); // Panic
  } else {
  	const move = getMove(state, ply, searchTime, debugAi);
    process.send({ direction: move, compId });
  }
});
