export default class CollisionObject {
  constructor(x, y, w, h, obj) {
    this.x = x;
    this.y = y;
    this.w = w;
    this.h = h;

    // Keep a reference back to the original object.
    this.object = obj;
  }
}
