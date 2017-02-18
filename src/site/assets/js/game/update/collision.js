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
	// Line segment created at the current tick.
	let plyX0 = ply.position[0];
	let plyY0 = ply.position[1];
	let plyX1 = ply.trail[ply.trail.length-1][0];
	let plyY1 = ply.trail[ply.trail.length-1][1];

	// Reduce function that will return the point closest to the
	// start point of ply's current line segment.
	let distanceCheck = (pre, cur) => {
		let preDist = Math.hypot(pre[0] - plyX1, pre[1] - plyY1);
		let curDist = Math.hypot(cur[0] - plyX1, cur[1] - plyY1);
		return preDist < curDist ? pre : cur;
	};

	// For now, we check for collisions against every trail in the arena.
	// There may be room for optimisation here...
	for (let ply2 of state.game.players) {
		// Check backwards from each players' current position.
		let ply2X0 = ply2.position[0];
		let ply2Y0 = ply2.position[1];

		let trailLength = ply2.trail.length;

		// Ignore ply's most recent trail.
		if (ply === ply2) {
			trailLength -= 1;
			ply2X0 = ply2.trail[trailLength][0];
			ply2Y0 = ply2.trail[trailLength][1];
		}

		for (let i = trailLength; i-- > 0; ) {
			let ply2X1 = ply2.trail[i][0];
			let ply2Y1 = ply2.trail[i][1];

			// If line is north-south/south-north.
			if (ply2X0 === ply2X1) {
				let ply2MinY = Math.min(ply2Y0, ply2Y1);
				let ply2MaxY = ply2MinY === ply2Y0 ? ply2Y1 : ply2Y0;
				if (plyY0 > ply2MinY && plyY0 < ply2MaxY && (plyX0 === ply2X0 && plyX1 === ply2X0 ||
					Math.sign(plyX0 - ply2X0) !== Math.sign(plyX1 - ply2X0))) {
					let hitPoints = [
						[plyX0, ply2MinY - 1],
						[plyX0, ply2MaxY + 1],
						[ply2X0 + 1, plyY0],
						[ply2X0 - 1, plyY0]
					];

					return hitPoints.reduce(distanceCheck);
				}

			// Else, if line is west-east/east-west.
			} else {
				let ply2MinX = Math.min(ply2X0, ply2X1);
				let ply2MaxX = ply2MinX === ply2X0 ? ply2X1 : ply2X0;
				if (plyX0 > ply2MinX && plyX0 < ply2MaxX && (plyY0 === ply2Y0 && plyY1 === ply2Y0 ||
					Math.sign(plyY0 - ply2Y0) !== Math.sign(plyY1 - ply2Y0))) {
					let hitPoints = [
						[ply2MinX - 1, plyY0],
						[ply2MaxX + 1, plyY0],
						[plyX0, ply2Y0 - 1],
						[plyX0, ply2Y0 + 1]
					];

					return hitPoints.reduce(distanceCheck);
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
		let intersectPoint = collideBorder(state, ply);
		if (intersectPoint === undefined) {
			intersectPoint = collideTrail(state, ply);
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