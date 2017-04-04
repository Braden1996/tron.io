import evaluatePlayer from './heuristics';
import { legalDirections, copyState } from '../operations/general';
import { movePlayer, directPlayer } from '../operations/player';
import update from '../update';

function getSimulationState(state, ply, direction) {
  const cState = copyState(state);
  const cPly = cState.players.find(pl => pl.id === ply.id);

  try {
    // Assume that other players will continue in their current direction.
    if (direction !== cPly.direction) {
      directPlayer(state, cPly, direction);
    }

    update(cState, cState.progress);

    // Only process the result if cPly is alive and no error has occured.
    if (cPly.alive) {
      return { state: cState, player: cPly };
    }
  } catch(e) {}

  return undefined;
}

export default function getMinimaxMove(state, ply, depth = 2, alpha=-Infinity, beta=Infinity) {
  if (depth === 0) {
    return { score: evaluatePlayer(state, ply), direction: null };
  }

  const changeDirections = legalDirections[ply.direction];
  const checkDirections = [ply.direction].concat(changeDirections);

  let bestDirection = ply.direction;
  for (let i = 0; i < checkDirections.length; i = i + 1) {
    const simulateDirection = checkDirections[i];
    const simulation = getSimulationState(state, ply, simulateDirection);
    if (!simulation) { continue; }

    const sState = simulation.state;
    const otherPly = sState.players.find(pl => pl.id !== ply.id);
    const { score } = getMinimaxMove(sState, otherPly, depth - 1, -beta, -alpha);
    const negaScore = -score;

    if (negaScore > alpha) {
      alpha = negaScore
      bestDirection = simulateDirection;

      if (alpha >= beta) {
        break; /* alpha/beta cut-off */
      }

    // If there is no benefit in score, just keep our current direction.
    } else if (negaScore === alpha && simulateDirection === ply.direction) {
      bestDirection = simulateDirection;
    }
  };
  //console.log(depth, "score", alpha, "direction", bestDirection);

  return { score: alpha, direction: bestDirection};
}
