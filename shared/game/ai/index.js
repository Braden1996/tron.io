import getMinimaxMove from './minimax';

export default function getMove(state, ply) {
  if (state.started && !state.finished) {
    const { direction } = getMinimaxMove(state, ply);
    console.log(direction);
    return direction;
  }

  return ply.direction;
}

process.on('message', (m) => {
  const { state, compId } = m;
  const ply = state.players.find(pl => pl.id === compId);

  const direction = ply === -1 ? ply.direction : getMove(state, ply);

  // Pass results back to parent process
  process.send({ direction, compId });
});
