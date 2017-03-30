import { getArenaObject } from './draw';
import UniformGrid from '../../shared/game/utils/collision/grid';
import Quadtree from '../../shared/game/utils/collision/quadtree';

function drawUniformGridOverlay(canvas, arena, collisionStruct) {
  const ctx = canvas.getContext('2d');

  const boundX = collisionStruct.bounds.x;
  const boundY = collisionStruct.bounds.y;

  ctx.beginPath();
  const x = arena.x + ((arena.borderSize + boundX) * arena.cellSize);
  const y = arena.y + ((arena.borderSize + boundY) * arena.cellSize);
  const w = arena.w - (2 * arena.borderSize * arena.cellSize);
  const h = arena.h - (2 * arena.borderSize * arena.cellSize);

  const cols = collisionStruct.RESOLUTION[0];
  const xStep = (collisionStruct.bounds.w / cols) * arena.cellSize;
  for (let xi = 1; xi < cols; xi = xi + 1) {
    const xn = x + (xi * xStep);
    ctx.moveTo(xn, y);
    ctx.lineTo(xn, y + h);
  }

  const rows = collisionStruct.RESOLUTION[1];
  const yStep = (collisionStruct.bounds.h / rows) * arena.cellSize;
  for (let yi = 1; yi < rows; yi = yi + 1) {
    const yn = y + (yi * yStep);
    ctx.moveTo(x, yn);
    ctx.lineTo(x + w, yn);
  }

  ctx.lineWidth = 2;
  ctx.strokeStyle = 'rgba(255, 0, 0, 0.3)';
  ctx.stroke();
  ctx.closePath();
}

function drawQuadtreeOverlay(canvas, state, arena) {
  // const ctx = canvas.getContext('2d');

  // const players = state.players;
  // const plySize = state.playerSize;
  // const arenaSize = state.arenaSize;
  // const fakeQuadtree = setupQuadtree(players, plySize, arenaSize);

  // let nodeQueue = [fakeQuadtree];
  // while (nodeQueue.length > 0) {
  //   const curNode = nodeQueue.shift();
  //   const stroke = (fakeQuadtree.MAX_LEVELS - curNode.level) + 1;
  //   const fix = Math.round((stroke / 2) + 0.5);
  //   const x = fix + ((curNode.bounds.x + arena.borderSize) * arena.cellSize);
  //   const y = fix + ((curNode.bounds.y + arena.borderSize) * arena.cellSize);
  //   const w = curNode.bounds.w * arena.cellSize;
  //   const h = curNode.bounds.h * arena.cellSize;

  //   ctx.beginPath();
  //   ctx.moveTo(x + (w / 2), y);
  //   ctx.lineTo(x + (w / 2), y + h);
  //   ctx.moveTo(x, y + (h / 2));
  //   ctx.lineTo(x + w, y + (h / 2));
  //   ctx.lineWidth = stroke;
  //   ctx.strokeStyle = 'rgba(255, 0, 0, 0.3)';
  //   ctx.stroke();
  //   ctx.closePath();

  //   const subNodes = curNode.nodes.filter(node => node !== undefined);
  //   nodeQueue = nodeQueue.concat(subNodes);
  // }
}

export default function drawDebug(gameState, canvas) {
  if (gameState.players.length !== 0) {
    const arena = getArenaObject(canvas, gameState);
    const collisionStruct = gameState.cache.collisionStruct;
    if (collisionStruct instanceof UniformGrid) {
      drawUniformGridOverlay(canvas, arena, collisionStruct);
    } else if (gameState.cache.collisionStruct instanceof Quadtree) {
      drawQuadtreeOverlay(canvas, gameState, arena);
    }
  }
}
