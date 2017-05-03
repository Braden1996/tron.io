//import getMinimaxMove from './minimax';
import getMonteCarloMove from './montecarlo';

export default function getMove(state, ply, searchTime, debugAi = false) {
  if (ply.alive && state.started && !state.finished) {
    const startTime = new Date().getTime();
    const shouldStopFn = () => {
      const curTime = new Date().getTime();
      return curTime > startTime + searchTime;
    };
    const direction = getMonteCarloMove(state, ply, shouldStopFn, debugAi);
    return direction;
  }

  return ply.direction;
}


