//import getMinimaxMove from './minimax';
import getMonteCarloMove from './montecarlo';

export default function getMove(state, ply, searchTime, debugAi = false) {
  if (state.started && !state.finished) {
    const lastPoint = ply.trail[ply.trail.length - 2];

    const xDiff = lastPoint[0] - ply.position[0];
    const yDiff = lastPoint[1] - ply.position[1];
    const curDistance = Math.abs(xDiff + yDiff);
    const canMove = ply.alive && curDistance >= state.playerSize

    if (canMove) {
      const startTime = new Date().getTime();
      const shouldStopFn = (extraDelay) => {
        const curTime = new Date().getTime();
        return curTime > (startTime + searchTime + extraDelay);
      };
      const direction = getMonteCarloMove(state, ply, shouldStopFn, debugAi);
      return direction ;
    }
  }

  return ply.direction;
}