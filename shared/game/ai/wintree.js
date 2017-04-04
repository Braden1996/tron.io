export default class WinTree {
  constructor(plyId, move = null, depth = 0) {
    this.playerId = plyId;
    this.rootPlayerId = this.playerId;
    this.move = move;
    this.depth = depth;

    this.parent = null;
    this.children = [];

    this.wins = 0;
    this.total = 0;
  }

  getMoveChild(move) {
    return this.children.find(child => child.move === move);
  }

  // Get the move which our simulations show to be most successful.
  getBestChildMove() {
    // We can only make suggestions for our own player.
    if (this.rootPlayerId !== this.playerId) { return undefined; }
    if (this.children.length === 0) { return undefined; }

    const bestWinTree = this.children.reduce((best, child) => {
      if (best === undefined) { return child; }

      const bw = best.wins;
      const bt = best.total;
      if (bt === 0) { return child; }

      const cw = child.wins;
      const ct = child.total;
      if (ct === 0) { return best; }

      const br = bw / bt;
      const cr = bw / bt;
      if (cr > br || (cr === br && cw > bw)) {
        return child;
      }

      return best;
    }, undefined);

    return bestWinTree.move;
  }

  addChild(child) {
    child.parent = this;
    child.rootPlayerId = this.rootPlayerId;
    this.children.push(child);
  }

  addWin(count = 1) {
    this.wins += count;
    this.total += count;

    if (this.parent !== null) {
      this.parent.addWin();
    }
  }

  addLoss(count = 1) {
    this.total += count;

    if (this.parent !== null) {
      this.parent.addLoss(count);
    }
  }
}
