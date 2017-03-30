import { movePlayer } from '../operations/player';

// Move all players by some distance at each update tick.
export default function updateMove(state, progress) {
  const distance = progress * state.speed;
  state.players.forEach(p => { p.alive && movePlayer(state, p, distance); });
}
