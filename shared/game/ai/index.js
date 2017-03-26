import getMinimaxMove from './minimax';

export default function getMove(state, ply) {
  const chance = Math.random()*100;
  if (chance < 10) {
    return getMinimaxMove(state, ply);
  }

  return ply.direction;
}
