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
  constructor(bounds, level=0) {
    this.MAX_OBJECTS = 10;
    this.MAX_LEVELS = 5;

    this.level = level;
    this.nodes = [];
    this.objects = [];
    this.bounds = {
      "x": bounds.x, "w": bounds.w,
      "y": bounds.y, "h": bounds.h,
    }
  }

  // Clear the quadtree by recursively clearing all objects from all nodes.
  clear() {
    this.objects.clear();
    for (let i = 0; i < this.nodes.length; i++) {
      if (this.nodes[i] !== undefined) {
        this.nodes[i].clear();
        delete this.nodes[i];
      }
    }
  }

  // Split the node into four subnodess.
  split() {
    const x = this.bounds.x;
    const y = this.bounds.y;
    const subW = this.bounds.w / 2;
    const subH = this.bounds.h / 2;

    const nextLevel = this.level + 1;

    this.nodes[0] = new Quadtree({x: x + subW, y, subW, subH}, nextLevel);
    this.nodes[1] = new Quadtree({x, y, subW, subH}, nextLevel);
    this.nodes[2] = new Quadtree({x, y: y + subH, subW, subH}, nextLevel);
    this.nodes[3] = new Quadtree({x: x + subW, y: y + subH, subW, subH}, nextLevel);
  }

  // Determine where an object belongs in the quadtree by determining
  // which node the object can fit into.
  // If the given object cannot fit within a child node, this will return -1
  // to indicate that it is part of the parent node.
  getIndex(objRect) {
    let index = -1;
    const quadXMid = this.bounds.x + this.bounds.w / 2;
    const quadYMid = this.bounds.y + this.bounds.h / 2;

    // objRect can completely fit within the top quadrants.
    const topQuadrant = (objRect.y < quadYMid) && ((objRect.y + objRect.h) < quadYMid);
    // objRect can completely fit within the bottom quadrants.
    const bottomQuadrant = objRect.y > quadYMid;


    // objRect can completely fit within the left quadrants.
    if (objRect.x < quadXMid && objRect.x + objRect.w < quadXMid) {
      if (topQuadrant) {
        index = 1;
      } else if (bottomQuadrant) {
        index = 2;
      }
    // objRect can completely fit within the right quadrants.
    } else if (objRect.x > quadXMid) {
      if (topQuadrant) {
        index = 0;
      } else if (bottomQuadrant) {
        index = 3;
      }
    }

    return index;
  }

  // Insert the object into the quadtree. If the node exceeds the capacity,
  // it will split and add all objects to their corresponding nodes.
  insert(objRect) {
    // Check if we can first insert the object into a subnode.
    if (this.nodes[0] !== undefined) {
      const idx = this.getIndex(objRect);

      if (idx !== -1) {
        this.nodes[idx].insert(objRect);
        return;
      }
    }

    this.objects.push(objRect);

    // If this node is allowed subnodes.
    if (this.objects.length > this.MAX_OBJECTS && this.level < this.MAX_LEVELS) {
      if (this.nodes[0] === undefined) {
        this.split();
      }

      // Filter out the objects which belong in subnodes.
      this.objects = this.objects.filter((object) => {
        const idx = this.getIndex(object);
        if (idx === -1) {
          return true;
        } else {
          this.nodes[idx].insert(object);
          return false;
        }
      });
    }
  }

  // Return all objects that could collide with the given object.
  retrieve(objRect, returnObjects = []) {
    if (this.nodes[0] !== undefined) {
      const idx = this.getIndex(objRect);
      if (idx !== -1) {
        returnObjects = this.nodes[idx].retrieve(objRect, returnObjects);
      }
    }

    return returnObjects.concat(this.objects);
 }
}
