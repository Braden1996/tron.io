"use strict";

import { killPlayer, updatePlayerPosition } from "../state/actions/players.js";


function collideBorder(ply, plySize, arenaSize) {
	const plyX = ply.get("position").get(0);
	const plyY = ply.get("position").get(1);
	const plySizeOffset = plySize / 2;

	if (plyX - plySizeOffset < 0) {
		return [plySizeOffset, plyY];

	} else if (plyX + plySizeOffset > arenaSize) {
		return [arenaSize - plySizeOffset, plyY];

	} else if (plyY - plySizeOffset < 0) {
		return [plyX, plySizeOffset];

	} else if (plyY + plySizeOffset > arenaSize) {
		return [plyX, arenaSize - plySizeOffset];

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

function collideTrail(ply, players, plySize) {
	// Convert ply's line-segment from this tick into a rectangle.
	const plyX0 = ply.get("position").get(0);
	const plyY0 = ply.get("position").get(1);
	const plyX1 = ply.get("trail").last().get(0);
	const plyY1 = ply.get("trail").last().get(1);

	let plyRect = lineToRect(plyX0, plyY0, plyX1, plyY1, plySize);

	let insectionPoint = undefined;

	// For now, we check for collisions against every trail in the arena.
	// There may be room for optimisation here...
	players.forEach(ply2 => {
		// Check backwards from each players' current position.
		// But ignore plys most recent trail progress.
		let ply2X0 = ply2.get("position").get(0);
		let ply2Y0 = ply2.get("position").get(1);

		// As the last element in the trail array is not the consequence of a direction change,
		// we can simply ignore it to form a larger rectangle.
		for (let i = ply2.get("trail").size - 2; i >= 0; i--) {
			const ply2X1 = ply2.get("trail").get(i).get(0);
			const ply2Y1 = ply2.get("trail").get(i).get(1);

			// Ignore ply's two most-recent trail line-segments.
			if (ply !== ply2 || i < ply.get("trail").size - 3) {
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
							const overlapPart = Math.min(plyRect.y + plyRect.h, ply2Rect.y + ply2Rect.h);
            				const overlap = Math.max(0, overlapPart - Math.max(plyRect.y, ply2Rect.y));

            				// In the case when ply 'overshoots' ply2, add dy to overlap.
            				let overshoot = 0;
							if (plyY0 > plyY1) {
            					overshoot = Math.max(
            						(plyRect.y+plyRect.h) - (ply2Rect.y+ply2Rect.h),
            						plyRect.y - ply2Rect.y,
            						0
            					);
							} else {
								overshoot = Math.max(
									ply2Rect.y - plyRect.y,
									(ply2Rect.y+ply2Rect.h) - (plyRect.y+plyRect.h),
									0
								);
							}

							const fixOffset = (plyY0 > plyY1 ? -1 : 1)*((overlap+overshoot)/2);

							insectionPoint = [plyX0, plyY0 + fixOffset];
							return false;

						} else if (ply2Rect.h === plySize) {
							insectionPoint = [plyX0, ply2Y0 - (plySize+ply2Rect.h)*0.5*Math.sign(ply2Y0 - plyY1)];
							return false;

						}
					} else if (plyRect.h === plySize) {
						if (ply2Rect.w === plySize) {
							insectionPoint = [ply2X0 - (plySize+ply2Rect.w)*0.5*Math.sign(ply2X0 - plyX1), plyY0];
							return false;

						} else if (ply2Rect.h === plySize) {
							let overlapPart = Math.min(plyRect.x + plyRect.w, ply2Rect.x + ply2Rect.w)
							let overlap = Math.max(0, overlapPart - Math.max(plyRect.x, ply2Rect.x));

							let overshoot = 0;
							if (plyX0 > plyX1) {
            					overshoot = Math.max(
            						(plyRect.x+plyRect.w) - (ply2Rect.x+ply2Rect.w),
            						plyRect.x - ply2Rect.x,
            						0
            					);
							} else {
								overshoot = Math.max(
									ply2Rect.x - plyRect.x,
									(ply2Rect.x+ply2Rect.w) - (plyRect.x+plyRect.w),
									0
								);
							}

							const fixOffset = (plyX0 > plyX1 ? -1 : 1)*((overlap+overshoot)/2);

							insectionPoint = [plyX0 + fixOffset, plyY0];
							return false;
						}
					}
				}
			}

			ply2X0 = ply2X1;
			ply2Y0 = ply2Y1;
		}
	});

	return insectionPoint;
}

// Check to see if a collision has occured.
export default function updateCollision(store, progress) {
	const state = store.getState();

	const players = state.players;
	const plySize = state.game.get("playerSize");
	const arenaSize = state.game.get("arenaSize");

	let newPositions = [];
	state.players.map((ply, k) => {
		if (ply.get("alive")) {
			let intersectPoint = collideTrail(ply, players, plySize);
			if (intersectPoint === undefined) {
				intersectPoint = collideBorder(ply, plySize, arenaSize);
			}

			if (intersectPoint !== undefined) {
				newPositions.push({ply, intersectPoint});
			};
		}
	});

	// Only update players after we have checked all collisions.
	for (let p of newPositions) {
		store.dispatch(killPlayer(p.ply.get("id"), p.intersectPoint));
	}
}