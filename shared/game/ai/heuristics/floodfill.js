import { legalDirections, movePosition } from '../../operations/general';
import createCollisionRect from '../../utils/collision/object';
import { getDistance } from '../../utils/geometry';

// A queue-based Flood fill implementation.
export default function floodFill(state, ply) {
  const arenaW = state.arenaSize;
  const totalCells = arenaW ** 2;
  const directions = Object.keys(legalDirections);

  const collisionStruct = state.cache.collisionStruct;

  let dist = 0;
  let cellQueue = [];
  const cellDistanceMap = [];

  // Distance cutoff is equal to half the distance to the closest player.
  // This is a heuristic to help speed things up.
  const distanceCutoff = state.players.reduce((min, pl) =>
    pl === ply ? min : Math.min(min, getDistance(ply.position, pl.position))
  , state.arenaSize) / 2;

  const plyPos = [Math.floor(ply.position[0]), Math.floor(ply.position[1])];
  const plyIdx = plyPos[0] + arenaW*plyPos[1];

  cellQueue.push(plyPos);
  cellDistanceMap[plyIdx] = dist;

  console.log(distanceCutoff);

  while (cellQueue.length > 0 && dist < distanceCutoff) {
    dist += 1;

    let nextCellQueue = [];
    cellQueue.forEach((cellPos, i) => {
      directions.forEach((direction) => {
        let cell;
        try {
          cell = movePosition(cellPos, direction, 1);
        } catch(e) { return; }

        const cellIdx = cell[0] + arenaW*cell[1];

        const inRange = cellIdx >= 0 && cellIdx < totalCells;
        if (inRange && !cellDistanceMap[cellIdx]) {

          // Check that the current cell is not a wall.
          const cellObjRect = createCollisionRect(cell[0], cell[1], 1, 1, {});
          if (collisionStruct.retrieve(cellObjRect).length > 0) {
            cellDistanceMap[cellIdx] = dist;
            nextCellQueue.push(cell);
          }
        }
      });
    });

    cellQueue = nextCellQueue;
    nextCellQueue = [];
  };

  return cellDistanceMap;
}
