import evaluatePlayer from './heuristics';
import { legalDirections, copyState } from '../operations/general';
import { movePlayer, directPlayer } from '../operations/player';

export default function getMinimaxMove(state, ply, depth = 2, alpha=-Infinity, beta=Infinity, maximizingPlayer=true) {
  if (depth === 0) {
    return { score: evaluatePlayer(state, ply), direction: ply.direction };
  }

  const checkDirections = [ply.direction]
    .concat(legalDirections[ply.direction]);

  const plySize = state.playerSize;
  const childStates = checkDirections.reduce((result, cDirection) => {
    const cState = copyState(state);
    const cPly = cState.players.find(pl => pl.id === ply.id);

    try {
      if (cDirection !== cPly.direction) {
        directPlayer(cPly, plySize, cDirection);
      }
      movePlayer(cPly, 1);

      // On push result if we have directed and/or moved without error.
      result.push({ cState, cPly, cDirection });
    } catch(e) {}

    return result;
  }, []);

  if (maximizingPlayer) {
    let v = -Infinity;
    let vDirection = ply.direction;
    for (let i = 0; i < childStates.length; i = i + 1) {
      const { cState, cPly, cDirection } = childStates[i];
      const scoreDir = getMinimaxMove(cState, cPly, depth - 1, alpha, beta, false);
      const { score } = scoreDir;

      if (score > v) {
        v = score;
        vDirection = cDirection;
      }

      alpha = Math.max(alpha, v);
      if (beta <= alpha) {
        break; /* beta cut-off */
      }
    };

    return { score: v, direction: vDirection};
  } else {
    let v = Infinity;
    let vDirection = ply.direction;
    for (let i = 0; i < childStates.length; i = i + 1) {
      const { cState, cPly, cDirection } = childStates[i];
      const scoreDir = getMinimaxMove(cState, cPly, depth - 1, alpha, beta, true);
      const { score } = scoreDir;

      if (score < v) {
        v = score;
        vDirection = cDirection;
      }

      beta = Math.min(beta, v);
      if (beta <= alpha) {
        break; /* alpha cut-off */;
      }
    };

    return { score: v, direction: vDirection};
  }
}
