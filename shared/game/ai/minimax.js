import evaluatePlayer from './heuristics';
import { legalDirections, copyState } from '../operations/general';
import { movePlayer, directPlayer } from '../operations/player';
import update from '../update';

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
      // To reduce performance costs, we assume that all other players will
      // continue in their current direction.
      if (cDirection !== cPly.direction) {
        directPlayer(state, cPly, cDirection);
      }

      update(cState, cState.progress);

      // On push result if we have directed and/or moved without error.
      result.push({ cState, cPly, cDirection });
    } catch(e) {}

    return result;
  }, []);

  let v = maximizingPlayer ? -Infinity : Infinity;
  let vDirection = ply.direction;
  for (let i = 0; i < childStates.length; i = i + 1) {
    const { cState, cPly, cDirection } = childStates[i];
    const scoreDir = getMinimaxMove(cState, cPly, depth - 1, alpha, beta, !maximizingPlayer);
    const { score } = scoreDir;

    if ((maximizingPlayer && score > v) || (!maximizingPlayer && score < v)) {
      v = score;
      vDirection = cDirection;
    }

    alpha = maximizingPlayer ? Math.max(alpha, v) : alpha;
    beta = maximizingPlayer ? beta : Math.min(beta, v);
    if (beta <= alpha) {
      break; /* alpha/beta cut-off */
    }
  };

  return { score: v, direction: vDirection};
}
