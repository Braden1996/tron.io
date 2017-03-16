// Implementation of a quadtree for collision detection.
// Heavily inspired from:
// https://gamedevelopment.tutsplus.com/tutorials/quick-tip-use-quadtrees-to-detect-likely-collisions-in-2d-space--gamedev-374

export class QuadtreeObjRect {
  constructor(x, y, w, h, obj) {
    this.x = x;
    this.y = y;
    this.w = w;
    this.h = h;
    this.object = obj;
  }
}

export default class Quadtree {
  constructor(bounds, level = 0) {
    this.MAX_OBJECTS = 10;
    this.MAX_LEVELS = 5;

    this.level = level;
    this.nodes = [];
    this.objects = [];
    this.bounds = {
      x: bounds.x,
      y: bounds.y,
      w: bounds.w,
      h: bounds.h,
    };
  }

  // Clone the quadtree.
  clone() {
    const { x, y, w, h } = this.bounds;
    const cloneNode = new Quadtree({ x, y, w, h }, this.level);
    cloneNode.MAX_OBJECTS = this.MAX_OBJECTS;
    cloneNode.MAX_LEVELS = this.MAX_LEVELS;
    cloneNode.objects = this.objects.slice(0);

    cloneNode.nodes = this.nodes.map(node => node.clone());
    return cloneNode;
  }

  // Clear the quadtree by recursively clearing all objects from all nodes.
  clear() {
    this.objects = [];
    for (let i = 0; i < this.nodes.length; i += 1) {
      if (this.nodes[i] !== undefined) {
        this.nodes[i].clear();
      }
    }
    this.nodes = [];
  }

  // Split the node into four subnodess.
  split() {
    const subLevel = this.level + 1;
    const { x, y } = this.bounds;
    let { w, h } = this.bounds;
    w /= 2;
    h /= 2;

    this.nodes[0] = new Quadtree({ x: x + w, y, w, h }, subLevel);
    this.nodes[1] = new Quadtree({ x, y, w, h }, subLevel);
    this.nodes[2] = new Quadtree({ x, y: y + h, w, h }, subLevel);
    this.nodes[3] = new Quadtree({ x: x + w, y: y + h, w, h }, subLevel);
  }

  // Determine where an object belongs in the quadtree by determining
  // which node the object can fit into.
  // If the given object cannot fit within a child node, this will return -1
  // to indicate that it is part of the parent node.
  getIndex(objRect) {
    const quadXMid = this.bounds.x + (this.bounds.w / 2);
    const quadYMid = this.bounds.y + (this.bounds.h / 2);

    // objRect can completely fit within the top quadrants.
    const topQuadrant = (objRect.y < quadYMid) && ((objRect.y + objRect.h) < quadYMid);
    // objRect can completely fit within the bottom quadrants.
    const bottomQuadrant = objRect.y > quadYMid;


    // objRect can completely fit within the left quadrants.
    if (objRect.x < quadXMid && objRect.x + objRect.w < quadXMid) {
      if (topQuadrant) {
        return 1;
      } else if (bottomQuadrant) {
        return 2;
      }
    // objRect can completely fit within the right quadrants.
    } else if (objRect.x > quadXMid) {
      if (topQuadrant) {
        return 0;
      } else if (bottomQuadrant) {
        return 3;
      }
    }

    return -1;
  }

  // Insert the object into the quadtree. If the node exceeds the capacity,
  // it will split and add all objects to their corresponding nodes.
  insert(objRect) {
    const idx = this.getIndex(objRect);

    // Check if we can first insert the object into a subnode.
    if (idx !== -1 && this.nodes[idx] !== undefined) {
      this.nodes[idx].insert(objRect);
    } else {
      this.objects.push(objRect);

      // If needed, and allowed, create a new sub-node.
      if (this.objects.length > this.MAX_OBJECTS && this.level < this.MAX_LEVELS) {
        // Check to make sure node hasn't already split.
        if (this.nodes[0] === undefined) {
          this.split();
        }

        // Filter out the objects which now belong in a subnode.
        this.objects = this.objects.filter((object) => {
          const objIdx = this.getIndex(object);
          if (objIdx === -1) {
            return true;
          }
          this.nodes[objIdx].insert(object);
          return false;
        });
      }
    }
  }

  // Return all objects that could collide with the given object.
  retrieve(objRect) {
    let outObjects = this.objects;
    const idx = this.getIndex(objRect);

    if (idx !== -1 && this.nodes[idx] !== undefined) {
      const getObjects = this.nodes[idx].retrieve(objRect);
      outObjects = getObjects.concat(outObjects);
    }

    return outObjects;
  }
}
