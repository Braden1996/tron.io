import floodFill from './floodFill';

export default function evaluatePlayers(state) {
  const distancesMap = state.players.map(ply => floodFill(state, ply));

  const scores = state.players.map(ply => 0);
  for (let cellIdx = 0; cellIdx < state.arenaSize**2; cellIdx += 1) {
    state.players.forEach((ply, i) => {
      if (distancesMap[i][cellIdx] === undefined) { return; }

      state.players.forEach((pl, k) => {
        if (pl === ply) { return; }
        if (distancesMap[k][cellIdx] === undefined) {
          scores[i] += 2;
        } else if (distancesMap[i][cellIdx] <= distancesMap[k][cellIdx]) {
          scores[i] += 1;
        }
      });
    });
  }
  return scores;
}
