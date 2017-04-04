//import getMinimaxMove from './minimax';
import getMonteCarloMove from './montecarlo';
import { rebuildCache } from '../operations/general';

export default function getMove(state, ply, searchTime) {
  if (ply.alive && state.started && !state.finished) {
    const startTime = new Date().getTime();
    const shouldStopFn = () => {
      const curTime = new Date().getTime();
      return curTime > startTime + searchTime;
    };
    const direction = getMonteCarloMove(state, ply, shouldStopFn);
    console.log(`Moving ${ply.id} ${direction}`);
    return direction;
  }

  return ply.direction;
}

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
