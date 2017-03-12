import { getArenaObject } from './draw';
import { setupQuadtree } from '../../shared/game/update/collision';

function drawQuadtreeOverlay(canvas, state, arena) {
  const ctx = canvas.getContext('2d');

  const players = state.players;
  const plySize = state.playerSize;
  const arenaSize = state.arenaSize;
  const fakeQuadtree = setupQuadtree(players, plySize, arenaSize);

  let nodeQueue = [fakeQuadtree];
  while (nodeQueue.length > 0) {
    const curNode = nodeQueue.shift();
    const stroke = (fakeQuadtree.MAX_LEVELS - curNode.level) + 1;
    const fix = Math.round((stroke / 2) + 0.5);
    const x = fix + ((curNode.bounds.x + arena.borderSize) * arena.cellSize);
    const y = fix + ((curNode.bounds.y + arena.borderSize) * arena.cellSize);
    const w = curNode.bounds.w * arena.cellSize;
    const h = curNode.bounds.h * arena.cellSize;

    ctx.beginPath();
    ctx.moveTo(x + (w / 2), y);
    ctx.lineTo(x + (w / 2), y + h);
    ctx.moveTo(x, y + (h / 2));
    ctx.lineTo(x + w, y + (h / 2));
    ctx.lineWidth = stroke;
    ctx.strokeStyle = 'rgba(255, 0, 0, 0.3)';
    ctx.stroke();
    ctx.closePath();

    const subNodes = curNode.nodes.filter(node => node !== undefined);
    nodeQueue = nodeQueue.concat(subNodes);
  }
}

export default function drawDebug(gameState, canvas) {
  if (gameState.players.length !== 0) {
    const arena = getArenaObject(canvas, gameState);
    drawQuadtreeOverlay(canvas, gameState, arena);
  }
}
