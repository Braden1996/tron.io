import { updatePlayerPosition } from '../operations';

// Move all by some distance at each update tick.
export default function updateMove(state, progress) {
  const distance = progress * state.speed;
  state.players.forEach((ply) => {
    if (ply.alive) {
      let posX = ply.position[0];
      let posY = ply.position[1];

      switch (ply.direction) {
        case 'north':
          posY -= distance;
          break;
        case 'south':
          posY += distance;
          break;
        case 'west':
          posX -= distance;
          break;
        default:  // case 'east':
          posX += distance;
          break;
      }

      updatePlayerPosition(ply, [posX, posY]);
    }
  });
}
