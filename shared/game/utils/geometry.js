// Return the amount of overlap between two lines along a single dimension.
// (x0->x1, x2->x3)
export function getOverlap1D(x0, x1, x2, x3) {
  return Math.max(0, Math.min(x1, x3) - Math.max(x0, x2));
}

// TODO: only need to perform x1 - x3??
export function getOvershoot1D(x0, x1, x2, x3) {
  return Math.max(0, x0 - x2, x1 - x3);
}

export function getDistance(p0, p1) {
  return Math.abs(Math.hypot(p0[0] - p1[0], p0[1] - p1[1]));
}
