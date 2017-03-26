import evaluatePlayer from './heuristics';

export default function getMinimaxMove(state, ply) {
  const score = evaluatePlayer(state, ply);
  return ply.direction;
}
