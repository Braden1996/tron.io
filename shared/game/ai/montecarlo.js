import WinTree from './wintree';
import evaluatePlayers from './heuristics';
import { legalDirections, copyState } from '../operations/general';
import { movePlayer, directPlayer } from '../operations/player';
import update from '../update';

function doMove(state, ply, direction) {
  try {
    if (direction !== ply.direction) {
      directPlayer(state, ply, direction);
    }

    return state;
  } catch(e) { }
}

function ucb1PickMove(legalMoves, winTreeCurrent) {
  // If a legal move hasn't yet been explored, winTreeCurrent wouldn't of yet
  // added it as a child. So, we can compare array size and then search for an
  // arbitrary unexplored node.
  if (legalMoves.length > winTreeCurrent.children.length) {
    return legalMoves.find(m => winTreeCurrent.getMoveChild(m) === undefined);
  }

  // Otherwise, simply return the move with the most promising UCB1 score.
  const cTotal = winTreeCurrent.total;
  const ucb1Move = legalMoves.reduce((acc, move) => {
    const mWinTree = winTreeCurrent.getMoveChild(move);
    const mTotal = mWinTree.total;
    const mWins = mWinTree.wins;

    const ucb1 = (mWins / mTotal)
      + Math.sqrt((2 * Math.log(cTotal)) / mTotal);

    if (acc === undefined || ucb1 > acc.ucb1) {
      return { ucb1, move };
    }
  }, undefined);

  return ucb1Move === undefined ? undefined : ucb1Move.move;
}

function getMonteCarloMove(state, ply, shouldStopFn, maxDepth = 4) {
  const winTrees = state.players.map(pl => new WinTree(pl.id));

  const plyIndex = state.players.indexOf(ply);

  const actualMaxDepth = maxDepth * state.players.length;

  let playersMoved = 0;
  let curIndex = plyIndex;  // Start simulation turns from our player.
  let curState = copyState(state);
  let winTreesCurrent = winTrees;
  while (shouldStopFn() !== true) {
    const simulatePly = curState.players[curIndex];
    const legalMoves = [simulatePly.direction]
      .concat(legalDirections[simulatePly.direction]);
    const simulateWinTree = winTreesCurrent[curIndex];
    const simulateMove = ucb1PickMove(legalMoves, simulateWinTree);
    doMove(curState, simulatePly, simulateMove);
    playersMoved += 1;

    // Update the game state once all able players have moved.
    const alivePlayers = state.players.filter(pl => pl.alive).length;
    if (alivePlayers !== 0 && playersMoved >= alivePlayers) {
      update(curState, curState.progress);
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
        const otherPlayers = curState.players.length - 1;
        if (!pl.alive) {
          winTree.addLoss(otherPlayers);
          return;
        }

        // Well done for staying alive!
        // winTree.addWin();

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
  return winTreePly.getBestChildMove();
}

export default getMonteCarloMove;
