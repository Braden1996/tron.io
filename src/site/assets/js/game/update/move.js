"use strict";

// Move all by some distance at each update tick.
export default function updateMove(state, progress) {
	let distance = progress * state.config.speed;
	for (let ply of state.game.players.filter((p) => p.alive)) {
		ply.trail[ply.trail.length-1] = ply.position.slice();
		switch(ply.direction) {
			case "north":
				ply.position[1] -= distance;
				break;
			case "south":
				ply.position[1] += distance;
				break;
			case "west":
				ply.position[0] -= distance;
				break;
			default:  // case "east":
				ply.position[0] += distance;
				break;
		}
	}
}