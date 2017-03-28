import { legalDirections, movePosition } from '../../operations/general';
import { setupQuadtree } from '../../update/collision';
import CollisionObject from '../../utils/collision/object';

// A queue-based Flood fill implementation.
export default function floodFill(state, ply) {
  const arenaW = state.arenaSize;
  const totalCells = arenaW ** 2;
  const directions = Object.keys(legalDirections);

  let dist = 0;
  let cellQueue = [];
  const cellDistanceMap = [];

  const plyPos = [Math.floor(ply.position[0]), Math.floor(ply.position[1])];
  const plyIdx = plyPos[0] + arenaW*plyPos[1];

  cellQueue.push(plyPos);
  cellDistanceMap[plyIdx] = dist;

  const quadtree = setupQuadtree(state.players, state.playerSize, state.arenaSize);

  while (cellQueue.length > 0) {
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
          const cellObjRect = new CollisionObject(cell[0], cell[1], 1, 1);
          if (quadtree.retrieve(cellObjRect).length > 0) {
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
