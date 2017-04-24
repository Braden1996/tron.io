const defaultCompareFunc = (a, b) => a.object === b.object;

export default class UniformGrid {
  constructor(bounds, resolution) {
    if (!(resolution instanceof Array)) {
      resolution = [resolution, resolution]; // [#cols, #rows]
    }
    this.RESOLUTION = resolution;

    // Construct row major grid layout.
    this.nodes = [];
    for (let row=0; row < resolution[1]; row = row + 1) {
      for (let col=0; col < resolution[0]; col = col + 1) {
        this.nodes.push([]);
      }
    }

    this.bounds = {
      x: bounds.x,
      y: bounds.y,
      w: bounds.w,
      h: bounds.h,
    };
  }

  // Returns a copy of the UniformGrid.
  clone(copyObject) {
    const { x, y, w, h } = this.bounds;
    const cloneGrid = new UniformGrid({ x, y, w, h }, this.RESOLUTION);
    const oldRects = [];
    const newRects = [];

    cloneGrid.nodes = this.nodes.map(node => node.map((rect) => {
      const copyIdx = oldRects.indexOf(rect);
      if (copyIdx !== -1) {
        return newRects[copyIdx];
      } else {
        const { x, y, w, h } = rect;
        const object = copyObject(rect.object);
        const newRect = { x, y, w, h, object };

        // Store new rect, in relation to old rect, to avoid duplication.
        oldRects.push(rect);
        newRects.push(newRect);

        return newRect;
      }
    }));
    return cloneGrid;
  }

  clear() {
    this.nodes = this.nodes.map(node => []);
  }

  getAll() {
    const all = this.nodes.reduce((acc, n) => acc.concat(n), []);
    return all.filter((o, i) => all.indexOf(o) === i);
  }

  // Return an array containing the indexes for the grid cell nodes that should
  // contain the given object.
  getIndexes(objRect) {
    const cols = this.RESOLUTION[0];
    const rows = this.RESOLUTION[1];

    const getIndex = (x, y) => {
      // Calculate the precise index of the point within the grid.
      const colUnbound = (x - this.bounds.x) / (this.bounds.w / cols);
      const rowUnbound = (y - this.bounds.y) / (this.bounds.h / rows);

      // Round and bound our grid index.
      const col = Math.max(0, Math.min(Math.floor(colUnbound), cols - 1));
      const row = Math.max(0, Math.min(Math.floor(rowUnbound), rows - 1));
      return [col, row];
    };

    const startIdx = getIndex(objRect.x, objRect.y);
    const endIdx = getIndex(objRect.x + objRect.w, objRect.y + objRect.h);

    const indexes = [];
    for (let x = startIdx[0]; x <= endIdx[0]; x = x + 1) {
      for (let y = startIdx[1]; y <= endIdx[1]; y = y + 1) {
        const idx = Math.round(x + (y * this.RESOLUTION[0]));
        indexes.push(idx);
      }
    }

    return indexes;
  }

  insert(objRect) {
    const idxs = this.getIndexes(objRect);
    idxs.forEach(idx => { this.nodes[idx].push(objRect); });
  }

  // An alternative to the standard insert method.
  // Will remove all node object references that pass the given compare
  // function, but don't contain the new given object.
  update(objRect, compareFunc = defaultCompareFunc) {
    const idxs = this.getIndexes(objRect);
    this.nodes.forEach((node, idx) => {
      const shouldBeMember = idxs.indexOf(idx) !== -1;
      const oIdx = node.findIndex(o => compareFunc(o, objRect));
      if (shouldBeMember) {
        if (oIdx === -1) {
          node.push(objRect);
        } else {
          node[oIdx] = objRect;
        }
      } else if (oIdx !== -1) {
        node.splice(oIdx, 1);
      }
    });
  }

  // Return all objects that could collide with the given object.
  retrieve(objRect) {
    const idxs = this.getIndexes(objRect);
    const hits = idxs.reduce((acc, idx) => acc.concat(this.nodes[idx]), []);
    return hits.filter((o, i) => hits.indexOf(o) === i);
  }
}
