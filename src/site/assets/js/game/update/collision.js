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

	let plyLastX = ply.trail[ply.trail.length-1][0];
	let plyLastY = ply.trail[ply.trail.length-1][1];

	let distanceCheck = (pre, cur) => {
		let preDist = Math.hypot(pre[0] - plyLastX, pre[1] - plyLastY);
		let curDist = Math.hypot(cur[0] - plyLastX, cur[1] - plyLastY);
		return preDist < curDist ? pre : cur;
	};

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
					let hitPoints = [
						[plyX, minY - 1],
						[plyX, maxY + 1],
						[trailX + 1, plyY],
						[trailX - 1, plyY]
					];

					return hitPoints.reduce(distanceCheck);
				}

			// Else, if line is west-east/east-west.
			} else {
				let distance = plyY - trailY;
				let minX = Math.min(trailX, lastX);
				let maxX = Math.max(trailX, lastX);
				if (Math.abs(distance) < 1 && plyX > minX && plyX < maxX) {
					let hitPoints = [
						[minX - 1, plyY],
						[maxX + 1, plyY],
						[plyX, trailY - 1],
						[plyX, trailY + 1]
					];

					return hitPoints.reduce(distanceCheck);
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
	for (let ply of state.game.players.filter((p) => p.alive)) {
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