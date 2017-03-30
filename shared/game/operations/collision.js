import createCollisionRect from '../utils/collision/object';

// Return a rectangle object calculated by the given two points and
// a stroke width.
export function lineToRect(x0, y0, x1, y1, stroke) {
  const halfStroke = stroke / 2;
  const rect = {
    x: Math.min(x0, x1) - halfStroke,
    y: Math.min(y0, y1) - halfStroke,
    w: Math.abs(x0 - x1) + stroke,
    h: Math.abs(y0 - y1) + stroke,
  };
  return rect;
}

// Compare function to appropriately updates to the collision data-structure.
export function collisionStructCompare(a, b) {
  return a.object.player === b.object.player
    && a.object.trailIndex === b.object.trailIndex;
}

// Create a collision rect object for the players most-recent line-segment.
export function createPlayerCollisionRect(state, ply) {
  const obj = { player: ply, trailIndex: ply.trail.length - 2 };

  // As the last element in the trail array is not the consequence of a
  // direction change, we can simply ignore it to form a larger rectangle.
  const stroke = state.playerSize;
  const [ newX, newY ] = ply.position;
  const [ lastX, lastY ] = ply.trail[ply.trail.length - 2];
  const { x, y, w, h } = lineToRect(lastX, lastY, newX, newY, stroke);

  return createCollisionRect(x, y, w, h, obj);
}
