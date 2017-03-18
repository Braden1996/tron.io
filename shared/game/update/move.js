import { movePlayer } from '../operations';

// Move all players by some distance at each update tick.
export default function updateMove(state, progress) {
  const distance = progress * state.speed;
  state.players.forEach((ply) => { ply.alive && movePlayer(ply, distance); });
}
