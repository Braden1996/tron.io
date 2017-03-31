import {
  lineToRect,
  collisionStructCompare,
  createPlayerCollisionRect
} from '../operations/collision';
import createCollisionRect from '../utils/collision/object';
import {
  getOverlap1D,
  getOvershoot1D,
  getDistance
} from '../utils/geometry';

// Check if the given player has escaped the bounds of the arena.
// If so, return their position at the point of impact.
function collideBorder(ply, plySize, arenaSize) {
  const plyX = ply.position[0];
  const plyY = ply.position[1];
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
function collideTrail(ply, plySize, collisionStruct) {
  // Calculate a rectangle representing the path from ply's
  // position in the previous tick to where they are now.
  const lineIdx = ply.trail.length - 1;
  const lastPlyPoint = ply.trail[lineIdx];

  const plyX0 = ply.position[0];
  const plyY0 = ply.position[1];
  const plyX1 = lastPlyPoint[0];
  const plyY1 = lastPlyPoint[1];
  const pObj = { player: ply, trailIndex: lineIdx };
  const { x, y, w, h } = lineToRect(plyX0, plyY0, plyX1, plyY1, plySize);
  const plyObjRect = createCollisionRect(x, y, w, h, pObj);

  const collisionCandidates = collisionStruct.retrieve(plyObjRect);

  // The closest intersection point we've discovered.
  let insectionPoint;
  let insectionDistance = Infinity; // Only want first collision.

  // Calculate this here for readability.
  const plyObjRectX0 = plyObjRect.x;
  const plyObjRectY0 = plyObjRect.y;
  const plyObjRectX1 = plyObjRect.x + plyObjRect.w;
  const plyObjRectY1 = plyObjRect.y + plyObjRect.h;

  collisionCandidates.forEach((objRect) => {
    const objPly = objRect.object.player;
    const objLineIdx = objRect.object.trailIndex;

    // If the current objRect belongs to the player we're checking, ignore
    // their three most recent line-segments; as it could flag an undesired
    // collision.
    if (objPly.id !== ply.id || lineIdx - objLineIdx > 3) {
      const objRectX0 = objRect.x;
      const objRectY0 = objRect.y;
      const objRectX1 = objRect.x + objRect.w;
      const objRectY1 = objRect.y + objRect.h;

      // Check if there was collision.
      // If there was, we need calculate ply's position at the moment of
      // impact. In the case of a mutual head-on collision, we simply move
      // both players back by half the overlap + overshoot distance.
      let collisionPoint;
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
          collisionPoint = [plyX0, newY];
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
          collisionPoint = [newX, plyY0];
        }

        if (collisionPoint !== undefined) {
          const collisionDistance = getDistance(collisionPoint, lastPlyPoint);
          if (collisionDistance < insectionDistance) {
            insectionPoint = collisionPoint;
            insectionDistance = collisionDistance;
          }
        }
      }
    }
  });

  return insectionPoint;
}

// Check to see if a collision has occured.
export default function updateCollision(state) {
  const players = state.players;
  const plySize = state.playerSize;
  const arenaSize = state.arenaSize;
  const collisionStruct = state.cache.collisionStruct;

  const killed = [];
  players.forEach((ply) => {
    if (ply.alive) {
      const deathPosition = collideTrail(ply, plySize, collisionStruct) ||
        collideBorder(ply, plySize, arenaSize);

      if (deathPosition !== undefined) {
        killed.push({ ply, deathPosition });
      }
    }
  });

  // Once we have checked all collisions, pull players back into their death
  // positions.
  killed.forEach((death) => {
    const { ply, deathPosition } = death;
    ply.alive = false;
    ply.position = deathPosition;

    const collisionRect = createPlayerCollisionRect(state, ply);
    state.cache.collisionStruct.update(collisionRect, collisionStructCompare);
  });
}
