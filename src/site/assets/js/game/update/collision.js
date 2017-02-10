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