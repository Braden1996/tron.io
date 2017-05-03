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

  getUCB1() {
    const mWins = this.wins;
    const mTotal = this.total;
    const cTotal = this.parent.total;
    return (mWins / mTotal) + Math.sqrt((2 * Math.log(cTotal)) / mTotal);
  }

  toDebugString(depthLimit=Infinity, prefix = '', isTail = true) {
    const cLength = this.children.length;
    const ucb1 = this.parent === null ? null : this.getUCB1();
    const ratio = `${this.wins}/${this.total}`;
    const string = `${this.playerId}:${this.move}(${ucb1})[${ratio}{${cLength}}]\n`;

    let outString = `${prefix} ${(isTail ? '└─ ' : '├─ ')}${string}`;

    if (depthLimit > 0 && this.children.length > 0) {
      const newPrefix = prefix + (isTail ? '  ' : ' │ ');
      this.children.forEach((child, i) => {
        const childDepth = depthLimit - 1;
        const childIsTail = i === this.children.length - 1;
        outString += child.toDebugString(childDepth, newPrefix, childIsTail);
      });
    }

    return outString;
  }
}
