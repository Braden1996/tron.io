import WinTree from './wintree';
import evaluatePlayers from './heuristics';
import { legalDirections, copyState } from '../operations/general';
import { movePlayer, directPlayer } from '../operations/player';
import update from '../update';

function doMove(state, ply, direction, debugAi) {
  if (direction === ply.direction) { return; }
  directPlayer(state, ply, direction);
}

function ucb1PickMove(legalMoves, winTreeCurrent) {
  // If a legal move hasn't yet been explored, winTreeCurrent wouldn't of yet
  // added it as a child. So, we can compare array size and then search for an
  // arbitrary unexplored node.
  if (legalMoves.length > winTreeCurrent.children.length) {
    return legalMoves.find(m => winTreeCurrent.getMoveChild(m) === undefined);
  }

  // Otherwise, simply return the move with the most promising UCB1 score.
  const ucb1Move = legalMoves.reduce((acc, move) => {
    const ucb1 = winTreeCurrent.getMoveChild(move).getUCB1();
    if (acc === undefined || ucb1 > acc.ucb1) {
      return { ucb1, move };
    }
    return acc;
  }, undefined);

  return ucb1Move === undefined ? undefined : ucb1Move.move;
}

function getMonteCarloMove(state, ply, progress, shouldStopFcn, maxDepth = 10) {
  const winTrees = state.players.map(pl => new WinTree(pl.id));

  const plyIndex = state.players.indexOf(ply);

  let skipProgress = 0;
  const epsilon = 0.001;

  // Make sure all other alive player are currently able to move!
  const minDistance = state.players.reduce((minDistance, pl) => {
    if (!pl.alive || pl === ply) { return minDistance; }

    const lastPoint = pl.trail[pl.trail.length - 2];

    const xDiff = lastPoint[0] - pl.position[0];
    const yDiff = lastPoint[1] - pl.position[1];
    const curDistance = Math.abs(xDiff + yDiff);

    return curDistance < minDistance ? curDistance : minDistance;
  }, 0);
  if (minDistance < state.playerSize) {
    const mustMove = state.playerSize - minDistance;
    skipProgress = epsilon + (mustMove / state.speed);
    update(state, skipProgress);
  }

  // As we model the game to be turn based...
  const actualMaxDepth = maxDepth * state.players.length;

  let playersMoved = 0;
  let curIndex = plyIndex;  // Start simulation turns from our player.
  let curState = copyState(state);
  let winTreesCurrent = winTrees;
  while (!shouldStopFcn(skipProgress) && curState.players[curIndex].alive) {
    const simulatePly = curState.players[curIndex];
    const legalMoves = [simulatePly.direction]
      .concat(legalDirections[simulatePly.direction]);
    const simulateWinTree = winTreesCurrent[curIndex];
    const simulateMove = ucb1PickMove(legalMoves, simulateWinTree);
    doMove(curState, simulatePly, simulateMove);
    playersMoved += 1;

    // Update the game state once all able players have moved.
    const alivePlayers = curState.players.filter(pl => pl.alive).length;
    if (alivePlayers > 0 && playersMoved >= alivePlayers) {
      const minProgress = epsilon + (curState.playerSize / curState.speed);
      const updateProgress = Math.max(minProgress, progress);
      update(curState, updateProgress);
      playersMoved = 0;
    }

    // Get, or create if needed, the WinTree instance corresponding to the
    // picked move.
    winTreesCurrent = winTreesCurrent.map((winTree) => {
      let newWinTree = winTree.getMoveChild(simulateMove);
      if (newWinTree === undefined) {
        const newDepth = winTree.depth + 1;
        newWinTree = new WinTree(simulatePly.id, simulateMove, newDepth);
        winTree.addChild(newWinTree);
      }
      return newWinTree;
    });

    // Check if simulation run has ended.
    if (curState.finished || winTreesCurrent[0].depth >= actualMaxDepth) {
      // Score each player based upon how their evaluation scores compare.
      const scores = evaluatePlayers(curState);
      curState.players.forEach((pl, i) => {
        const winTree = winTreesCurrent[i];
        const alivePlayers = curState.players.filter(p => p.alive).length;
        if (!pl.alive) {
          const losses = Math.max(alivePlayers, 1);
          const closeDanger = 3 * state.players.length;
          if (winTree.depth < closeDanger) {
            winTree.addLoss(losses*2);
          } else {
            winTree.addLoss(losses);
          }
          return;
        }

        // Well done for staying alive!
        winTree.addWin();

        curState.players.forEach((pl2, k) => {
          if (pl === pl2) { return; }
          if (!pl2.alive || scores[i] >= scores[k]) {
            winTree.addWin();
          } else {
            winTree.addLoss();
          }
        });
      });

      // Reset for next simulation.
      curState = copyState(state);
      curIndex = plyIndex;
      winTreesCurrent = winTrees;

    // Otherwise, prepare for the next player's turn.
    } else {
      do {
        curIndex = (curIndex + 1) % winTrees.length;
      } while (curState.players[curIndex].alive !== true);
    }
  }

  const winTreePly = winTrees[plyIndex];
  let bestMove = winTreePly.getBestChildMove();
  const compPly = state.players[plyIndex];

  // No simulations could be performed. This is probably due our initial update
  // skip resulting in the player dying! Panic and change direction.
  if (bestMove === undefined) {
    bestMove = legalDirections[compPly.direction][0];
  }

  return bestMove;
}

export default getMonteCarloMove;
