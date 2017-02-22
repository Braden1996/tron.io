"use strict";

function collideBorder(state, ply) {
	let plySizeOffset = state.config.playerSize/2;
	if (ply.position[0] - plySizeOffset < 0) {
		return [plySizeOffset, ply.position[1]];
	} else if (ply.position[0] + plySizeOffset > state.config.arenaSize) {
		return [state.config.arenaSize - plySizeOffset, ply.position[1]];
	} else if (ply.position[1] - plySizeOffset < 0) {
		return [ply.position[0], plySizeOffset];
	} else if (ply.position[1] + plySizeOffset > state.config.arenaSize) {
		return [ply.position[0], state.config.arenaSize - plySizeOffset];
	} else {
		return undefined;
	}
}

function lineToRect(x0, y0, x1, y1, expand) {
	return {
		x: Math.min(x0, x1) - expand/2,
		y: Math.min(y0, y1) - expand/2,
		w: Math.abs(x0 - x1) + expand,
		h: Math.abs(y0 - y1) + expand
	};
}

function collideTrail(state, ply) {
	let plySize = state.config.playerSize;

	// Convert ply's line-segment from this tick into a rectangle.
	let plyX0 = ply.position[0];
	let plyY0 = ply.position[1];
	let plyX1 = ply.trail[ply.trail.length-1][0];
	let plyY1 = ply.trail[ply.trail.length-1][1];

	let plyRect = lineToRect(plyX0, plyY0, plyX1, plyY1, plySize);

	// For now, we check for collisions against every trail in the arena.
	// There may be room for optimisation here...
	for (let ply2 of state.game.players) {
		// Check backwards from each players' current position.
		// But ignore plys most recent trail progress.
		let ply2X0 = ply2.position[0];
		let ply2Y0 = ply2.position[1];

		// As the last element in the trail array is not the consequence of a direction change,
		// we can simply ignore it to form a larger rectangle.
		for (let i = ply2.trail.length - 2; i >= 0; i--) {
			let ply2X1 = ply2.trail[i][0];
			let ply2Y1 = ply2.trail[i][1];

			// Ignore ply's two most-recent trail line-segments.
			if (ply !== ply2 || i < ply.trail.length - 3) {
				let ply2Rect = lineToRect(ply2X0, ply2Y0, ply2X1, ply2Y1, plySize);

				if (plyRect.x < ply2Rect.x + ply2Rect.w &&
			        plyRect.x + plyRect.w > ply2Rect.x &&
			        plyRect.y < ply2Rect.y + ply2Rect.h &&
			        plyRect.h + plyRect.y > ply2Rect.y) {

					// Idea is to position ply using where they came from, not
					// where they've ended up. In the case of a head-on collision (e.g. | | or _ _),
					// we effectively move the colliding players back by half the overlapping distance.
					if (plyRect.w === plySize) {
						if (ply2Rect.w === plySize) {
							let overlapPart = Math.min(plyRect.y + plyRect.h, ply2Rect.y + ply2Rect.h);
            				let overlap = Math.max(0, overlapPart - Math.max(plyRect.y, ply2Rect.y));

            				// In the case when ply 'overshoots' ply2, add dy to overlap.
							if (plyY0 > plyY1) {
            					overlap += Math.max((plyRect.y+plyRect.h) - (ply2Rect.x+ply2Rect.h), 0);
							} else {
								overlap += Math.max(ply2Rect.y - plyRect.y, 0);
							}

							return [plyX0, plyY0 + (((plyY0 > plyY1 ? -1 : 1)*overlap)/2)];
						} else if (ply2Rect.h === plySize) {
							return [plyX0, ply2Y0 - (plySize+ply2Rect.h)*0.5*Math.sign(ply2Y0 - plyY1)];
						}
					} else if (plyRect.h === plySize) {
						if (ply2Rect.w === plySize) {
							return [ply2X0 - (plySize+ply2Rect.w)*0.5*Math.sign(ply2X0 - plyX1), plyY0];
						} else if (ply2Rect.h === plySize) {
							let overlapPart = Math.min(plyRect.x + plyRect.w, ply2Rect.x + ply2Rect.w)
							let overlap = Math.max(0, overlapPart - Math.max(plyRect.x, ply2Rect.x)) / 2;

							if (plyX0 > plyX1) {
            					overlap += Math.max((plyRect.x+plyRect.w) - (ply2Rect.x+ply2Rect.w), 0);
							} else {
								overlap += Math.max(ply2Rect.x - plyRect.x, 0);
							}

							return [plyX0 + (plyX0 > plyX1 ? -1 : 1)*overlap, plyY0];
						}
					}
				}
			}

			ply2X0 = ply2X1;
			ply2Y0 = ply2Y1;
		}
	}
	return undefined;
}

// Check to see if a collision has occured.
export default function updateCollision(state, progress) {
	let newPositions = [];
	for (let ply of state.game.players.filter((p) => p.alive)) {
		let intersectPoint = collideTrail(state, ply);
		if (intersectPoint === undefined) {
			intersectPoint = collideBorder(state, ply);
		}

		if (intersectPoint !== undefined) {
			newPositions.push([ply, intersectPoint]);
		};
	}

	// Only update players after we have checked all collisions.
	for (let p of newPositions) {
		p[0].alive = false;
		p[0].position = p[1];
		p[0].trail[p[0].trail.length-1] = p[1];
	}
}