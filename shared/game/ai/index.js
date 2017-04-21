//import getMinimaxMove from './minimax';
import getMonteCarloMove from './montecarlo';

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


