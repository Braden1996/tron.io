import floodFill from './floodFill';

import { setupQuadtree } from '../../update/collision';
import { QuadtreeObjRect } from '../../utils/quadtree';

export default function evaluatePlayer(state, ply) {
  const distancesMap = state.players.map(pl => floodFill(state, pl));

  const plyIdx = state.players.findIndex(pl => pl === ply);
  const plyDistances = distancesMap[plyIdx];

  let score = 0;
  for (let cellIdx = 0; cellIdx < state.arenaSize**2; cellIdx += 1) {
    // If ply can reach the current cell, add 1 to their score for each player
    // that cannot reach it, or is further away.
    if (distancesMap[plyIdx][cellIdx] !== undefined) {
      const furtherPlys = distancesMap.reduce((acc, distances) => {
        return acc + ((distances[cellIdx] !== undefined
          && plyDistances[cellIdx] < distances[cellIdx]) ? 1 : 0);
      }, 0);
      score += furtherPlys;
    }
  }

  return score;
}
