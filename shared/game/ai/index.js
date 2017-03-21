import {
  directPlayer,
  legalDirections
} from '../operations';

export default function update(state, computerPlayers) {
  computerPlayers.forEach((ply) => {
    const chance = Math.random()*100;
    if (chance < 10) {
      const plySize = state.playerSize;
      const plyLegalDirections = legalDirections[ply.direction];
      const randomIdx = Math.floor(Math.random()*plyLegalDirections.length);
      const newDirection = plyLegalDirections[randomIdx];
      try {
        directPlayer(ply, plySize, newDirection);
      } catch(e) {};
    }
  });
}
