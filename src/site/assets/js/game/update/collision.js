"use strict";

function collideBorder(state, ply) {
	if (ply.position[0] < 0) {
		return [0, ply.position[1]];
	} else if (ply.position[0] > state.config.arenaSize) {
		return [state.config.arenaSize, ply.position[1]];
	} else if (ply.position[1] < 0) {
		return [ply.position[0], 0];
	} else if (ply.position[1] > state.config.arenaSize) {
		return [ply.position[0], state.config.arenaSize];
	} else {
		return undefined;
	}
}

function collideTrail(state, ply) {
	let plyX = ply.position[0];
	let plyY = ply.position[1];

	for (let ply2 of state.game.players) {
		let lastX = ply2.position[0];
		let lastY = ply2.position[1];

		// Ignore the current line of our own player.
		let trailLength = ply2.trail.length;
		if (ply === ply2) {
			trailLength -= 1;
			lastX = ply2.trail[trailLength][0];
			lastY = ply2.trail[trailLength][1];
		}

		for (let i = trailLength; i-- > 0; ) {
			let trailX = ply2.trail[i][0];
			let trailY = ply2.trail[i][1];

			// If line is north-south/south-north.
			if (trailX - lastX === 0) {
				let distance = plyX - trailX;
				let minY = Math.min(trailY, lastY);
				let maxY = Math.max(trailY, lastY);
				if (Math.abs(distance) < 1 && plyY > minY && plyY < maxY) {
					if (distance === 0) {
						if (Math.abs(plyY - minY) < Math.abs(plyY - maxY)) {
							return [plyX, minY + 1];
						} else {
							return [plyX, maxY + 1];
						}
					} else {
						return [trailX + (distance > 0 ? 1 : -1), plyY];
					}
				}

			// Else, if line is west-east/east-west.
			} else {
				let distance = plyY - trailY;
				let minX = Math.min(trailX, lastX);
				let maxX = Math.max(trailX, lastX);
				if (Math.abs(distance) < 1 && plyX > minX && plyX < maxX) {
					if (distance === 0) {
						if (Math.abs(plyX - minX) < Math.abs(plyX - maxX)) {
							return [minX - 1, plyY];
						} else {
							return [maxX + 1, plyY];
						}
					} else {
						return [plyX, lastY + (distance > 0 ? 1 : -1)];
					}
				}
			}
			lastX = trailX;
			lastY = trailY;
		}
	}
	return undefined;
}


// Check to see if a collision has occured.
export default function updateCollision(state, progress) {
	for (let ply of state.game.players) {
		let intersectPoint = collideBorder(state, ply);
		if (intersectPoint === undefined) {
			intersectPoint = collideTrail(state, ply);
		}

		if (intersectPoint !== undefined) {
			ply.alive = false;
			ply.position = intersectPoint;
		};
	}
}