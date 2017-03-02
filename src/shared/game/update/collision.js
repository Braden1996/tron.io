import { killPlayer } from '../state/actions/players';


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

function lineToRect(x0, y0, x1, y1, stroke) {
  const halfStroke = stroke;
  const rect = {
    x0: Math.min(x0, x1) - halfStroke,
    y0: Math.min(y0, y1) - halfStroke,
    w: Math.abs(x0 - x1) + stroke,
    h: Math.abs(y0 - y1) + stroke,
  };

  rect.x1 = rect.x0 + rect.w;
  rect.y1 = rect.y0 + rect.h;
  return rect;
}

function getOverlap1D(x0, x1, x2, x3) {
  return Math.max(0, Math.min(x1, x3) - Math.max(x0, x2));
}

function getOvershoot1D(x0, x1, x2, x3) {
  return Math.max(0, x0 - x2, x1 - x3);
}

function collideTrail(ply, players, plySize) {
  // Convert ply's line-segment from this tick into a rectangle.
  const plyX0 = ply.get('position').get(0);
  const plyY0 = ply.get('position').get(1);
  const plyX1 = ply.get('trail').last().get(0);
  const plyY1 = ply.get('trail').last().get(1);

  const plyRect = lineToRect(plyX0, plyY0, plyX1, plyY1, plySize);

  let insectionPoint;

  // For now, we check for collisions against every trail in the arena.
  // There may be room for optimisation here...
  players.forEach((ply2) => {
    // Check backwards from each players' current position.
    // But ignore plys most recent trail progress.
    let ply2X0 = ply2.get('position').get(0);
    let ply2Y0 = ply2.get('position').get(1);

    // As the last element in the trail array is not the consequence of a direction change,
    // we can simply ignore it to form a larger rectangle.
    for (let i = ply2.get('trail').size - 2; i >= 0; i -= 1) {
      const ply2X1 = ply2.get('trail').get(i).get(0);
      const ply2Y1 = ply2.get('trail').get(i).get(1);

      // Ignore ply's two most-recent trail line-segments.
      if (ply !== ply2 || i < ply.get('trail').size - 3) {
        const ply2Rect = lineToRect(ply2X0, ply2Y0, ply2X1, ply2Y1, plySize);

        // Check if there was collision.
        if (plyRect.x0 < ply2Rect.x1 &&
          plyRect.x1 > ply2Rect.x0 &&
          plyRect.y0 < ply2Rect.y1 &&
          plyRect.y1 > ply2Rect.y0) {
          // Now we need calculate ply's position at the moment of impact.
          // In the case of a mutual head-on collision, we simply move both
          // players back by half the overlap + overshoot distance.
          if (plyRect.w === plySize) {
            let newY;
            if (ply2Rect.w === plySize) {
              const overlap = getOverlap1D(
                plyRect.y0, plyRect.y1,
                ply2Rect.y0, ply2Rect.y1,
              );

              // For the case when plyRect 'overshoots' ply2Rect.
              const overshoot = plyY0 > plyY1 ?
                getOvershoot1D(plyRect.y0, plyRect.y1, ply2Rect.y0, ply2Rect.y1) :
                getOvershoot1D(ply2Rect.y0, ply2Rect.y1, plyRect.y0, plyRect.y1);

              const direction = plyY0 > plyY1 ? -1 : 1;
              const fixOffset = direction * ((overlap + overshoot) / 2);
              newY = plyY0 + fixOffset;
            } else if (ply2Rect.h === plySize) {
              const direction = Math.sign(ply2Y0 - plyY1);
              newY = ply2Y0 - ((plySize + ply2Rect.h) * 0.5 * direction);
            }

            insectionPoint = [plyX0, newY];
            return false;
          } else if (plyRect.h === plySize) {
            let newX;
            if (ply2Rect.w === plySize) {
              const direction = Math.sign(ply2X0 - plyX1);
              newX = ply2X0 - ((plySize + ply2Rect.w) * 0.5 * direction);
            } else if (ply2Rect.h === plySize) {
              const overlap = getOverlap1D(
                plyRect.x, plyRect.x1,
                ply2Rect.x, ply2Rect.x1,
              );

              const overshoot = plyX0 > plyX1 ?
                getOvershoot1D(plyRect.x0, plyRect.x1, ply2Rect.x0, ply2Rect.x1) :
                getOvershoot1D(ply2Rect.x0, ply2Rect.x1, plyRect.x0, plyRect.x1);

              const direction = plyX0 > plyX1 ? -1 : 1;
              const fixOffset = direction * ((overlap + overshoot) / 2);
              newX = plyX0 + fixOffset;
            }

            insectionPoint = [newX, plyY0];
          }

          return false;
        }
      }

      ply2X0 = ply2X1;
      ply2Y0 = ply2Y1;
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

  const newPositions = [];
  state.players.map((ply) => {
    if (ply.get('alive')) {
      const intersectPoint = collideTrail(ply, players, plySize) ||
        collideBorder(ply, plySize, arenaSize);

      if (intersectPoint !== undefined) {
        newPositions.push({ ply, intersectPoint });
      }
    }
  });

  // Only update players after we have checked all collisions.
  for (const p of newPositions) {
    store.dispatch(killPlayer(p.ply.get('id'), p.intersectPoint));
  }
}
