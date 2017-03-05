import { killPlayer } from '../state/actions/players';
import Quadtree, { QuadtreeObjRect } from '../utils/quadtree';

// Return the amount of overlap between two lines along a single dimension.
// (x0->x1, x2->x3)
function getOverlap1D(x0, x1, x2, x3) {
  return Math.max(0, Math.min(x1, x3) - Math.max(x0, x2));
}

// TODO: only need to perform x1 - x3??
function getOvershoot1D(x0, x1, x2, x3) {
  return Math.max(0, x0 - x2, x1 - x3);
}

// Return a rectangle object calculated by the given two points and
// a stroke width.
function lineToRect(x0, y0, x1, y1, stroke) {
  const halfStroke = stroke / 2;
  const rect = {
    x: Math.min(x0, x1) - halfStroke,
    y: Math.min(y0, y1) - halfStroke,
    w: Math.abs(x0 - x1) + stroke,
    h: Math.abs(y0 - y1) + stroke,
  };
  return rect;
}

// Return a QuadtreeObjRect representing a trail line-segment for some player.
function rectToObjRect(rect, ply, trailIdx) {
  return new QuadtreeObjRect(rect.x, rect.y, rect.w, rect.h, { ply, trailIdx });
}

// Return an array of rectangle objects representing the trail of the
// given player at some stroke width.
function plyToObjRects(ply, stroke) {
  let plyX0 = ply.get('position').get(0);
  let plyY0 = ply.get('position').get(1);

  const objRects = [];

  // As the last element in the trail array is not the consequence of a
  // direction change, we can simply ignore it to form a larger rectangle.
  for (let i = ply.get('trail').size - 2; i >= 0; i -= 1) {
    const plyX1 = ply.get('trail').get(i).get(0);
    const plyY1 = ply.get('trail').get(i).get(1);

    const rect = lineToRect(plyX0, plyY0, plyX1, plyY1, stroke);
    const objRect = rectToObjRect(rect, ply, i);
    objRects.push(objRect);

    plyX0 = plyX1;
    plyY0 = plyY1;
  }

  return objRects;
}

// Create, populate and return a quadtree for the given state of players.
// This will be later used for efficient collision detection.
// Exported so we can draw it in debug mode.
export function setupQuadtree(players, plySize, arenaSize) {
  const quadtree = new Quadtree({ x: 0, y: 0, w: arenaSize, h: arenaSize });
  quadtree.MAX_OBJECTS = 4;  // Not sure what would be ideal.
  quadtree.MAX_LEVELS = Math.ceil(Math.log2(arenaSize / 4));
  players.map(ply => plyToObjRects(ply, plySize))
    .forEach(objRects => objRects.forEach(oRect => quadtree.insert(oRect)));
  return quadtree;
}

// Check if the given player has escaped the bounds of the arena.
// If so, return their position at the point of impact.
function collideBorder(ply, plySize, arenaSize) {
  const plyX = ply.get('position').get(0);
  const plyY = ply.get('position').get(1);
  const plySizeOffset = plySize / 2;

  if (plyX - plySizeOffset < 0) {
    return [plySizeOffset, plyY];
  } else if (plyX + plySizeOffset > arenaSize) {
    return [arenaSize - plySizeOffset, plyY];
  } else if (plyY - plySizeOffset < 0) {
    return [plyX, plySizeOffset];
  } else if (plyY + plySizeOffset > arenaSize) {
    return [plyX, arenaSize - plySizeOffset];
  }

  return undefined;
}

// Check if the given player has hit a trail.
// If so, return their position at the point of impact.
function collideTrail(ply, plySize, quadtree) {
  // Calculate a rectangle representing the path from ply's
  // position in the previous tick to where they are now.
  const plyX0 = ply.get('position').get(0);
  const plyY0 = ply.get('position').get(1);
  const plyX1 = ply.get('trail').last().get(0);
  const plyY1 = ply.get('trail').last().get(1);
  const lineIdx = ply.get('trail').size - 1;
  const plyRect = lineToRect(plyX0, plyY0, plyX1, plyY1, plySize);
  const plyObjRect = rectToObjRect(plyRect, ply, lineIdx);

  const collisionCandidates = quadtree.retrieve(plyObjRect);

  // The closest intersection point we've discovered.
  let insectionPoint;

  // Calculate this here for readability.
  const plyObjRectX0 = plyObjRect.x;
  const plyObjRectY0 = plyObjRect.y;
  const plyObjRectX1 = plyObjRect.x + plyObjRect.w;
  const plyObjRectY1 = plyObjRect.y + plyObjRect.h;

  collisionCandidates.forEach((objRect) => {
    const objPly = objRect.object.ply;
    const objLineIdx = objRect.object.trailIdx;
    // If the current objRect belongs to the player we're checking, ignore
    // their three most recent line-segments; as it could flag an undesired
    // collision.
    if (objPly !== ply || objLineIdx < lineIdx - 3) {
      const objRectX0 = objRect.x;
      const objRectY0 = objRect.y;
      const objRectX1 = objRect.x + objRect.w;
      const objRectY1 = objRect.y + objRect.h;

      // Check if there was collision.
      // If there was, we need calculate ply's position at the moment of
      // impact. In the case of a mutual head-on collision, we simply move
      // both players back by half the overlap + overshoot distance.
      if (plyObjRectX0 < objRectX1 &&
        plyObjRectX1 > objRectX0 &&
        plyObjRectY0 < objRectY1 &&
        plyObjRectY1 > objRectY0) {
        if (plyObjRect.w === plySize) {
          let newY;
          if (objRect.h === plySize) {
            const objRectCentreY = objRect.y + (objRect.h / 2);
            const direction = Math.sign(plyY0 - plyY1);
            newY = objRectCentreY - (direction * (0.5 * (objRect.h + plySize)));
          } else if (objRect.w === plySize) {
            const overlap = getOverlap1D(
              plyObjRectY0, plyObjRectY1,
              objRectY0, objRectY1,
            );

            // For the case when plyObjRect 'overshoots' objRect.
            const overshoot = plyY0 > plyY1 ?
              getOvershoot1D(plyObjRectY0, plyObjRectY1, objRectY0, objRectY1) :
              getOvershoot1D(objRectY0, objRectY1, plyObjRectY0, plyObjRectY1);

            const direction = plyY0 > plyY1 ? -1 : 1;
            const fixOffset = direction * ((overlap + overshoot) / 2);
            newY = plyY0 + fixOffset;
          }
          insectionPoint = [plyX0, newY];
        } else if (plyObjRect.h === plySize) {
          let newX;
          if (objRect.w === plySize) {
            const objRectCentreX = objRect.x + (objRect.w / 2);
            const direction = Math.sign(plyX0 - plyX1);
            newX = objRectCentreX - (direction * (0.5 * (objRect.w + plySize)));
          } else if (objRect.h === plySize) {
            const overlap = getOverlap1D(
              plyObjRectX0, plyObjRectX1,
              objRectX0, objRectX1,
            );

            const overshoot = plyX0 > plyX1 ?
              getOvershoot1D(plyObjRectX0, plyObjRectX1, objRectX0, objRectX1) :
              getOvershoot1D(objRectX0, objRectX1, plyObjRectX0, plyObjRectX1);

            const direction = plyX0 > plyX1 ? -1 : 1;
            const fixOffset = direction * ((overlap + overshoot) / 2);
            newX = plyX0 + fixOffset;
          }
          insectionPoint = [newX, plyY0];
        }
      }
    }
  });

  return insectionPoint;
}

// Check to see if a collision has occured.
export default function updateCollision(store) {
  const state = store.getState();

  const players = state.players;
  const plySize = state.game.get('playerSize');
  const arenaSize = state.game.get('arenaSize');

  const quadtree = setupQuadtree(players, plySize, arenaSize);

  const killed = [];
  players.forEach((ply) => {
    if (ply.get('alive')) {
      const point = collideTrail(ply, plySize, quadtree) ||
        collideBorder(ply, plySize, arenaSize);

      if (point !== undefined) {
        killed.push({ ply, point });
      }
    }
  });

  // Only update players after we have checked all collisions.
  killed.forEach(p => {store.dispatch(killPlayer(p.ply.get('id'), p.point))});
}
