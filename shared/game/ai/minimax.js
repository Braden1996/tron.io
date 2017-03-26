import evaluatePlayer from './heuristics';

export default function getMinimaxMove(state, ply) {
  const score = evaluatePlayer(state, ply);
  console.log(`Player ${ply.name}, has heuristic score: ${score}`);
  return ply.direction;
}
