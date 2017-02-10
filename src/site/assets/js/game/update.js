"use strict";

export default function update(state, progress) {
	if (Object.keys(state.input.pressedKeys).length > 0) {
		let ply = state.game.players[0];

		// Player must move at least one grid cell before changing direction.
		let lastPoint = ply.trail.slice(-1)[0];

		// No need for Pythagoras, as we can only move along one axis. 
		let curDistance = Math.abs(lastPoint[0] - ply.position[0] + lastPoint[1] - ply.position[1]);
		
		if (curDistance >= 1) {
			let oldDirection = ply.direction;
			let newDirection;
			if (state.input.pressedKeys["w"]) {
				newDirection = "north";
			} else if (state.input.pressedKeys["a"]) {
				newDirection = "west";
			} else if (state.input.pressedKeys["s"]) {
				newDirection = "south";
			} else if (state.input.pressedKeys["d"]) {
				newDirection = "east";
			}

			if (newDirection !== oldDirection &&
				!(oldDirection === "north" && newDirection === "south") &&
				!(oldDirection === "south" && newDirection === "north") &&
				!(oldDirection === "west" && newDirection === "east") &&
				!(oldDirection === "east" && newDirection === "west")) {
				ply.direction = newDirection;
				ply.trail.push(ply.position.slice());
			}
		}
	}

	// All players move the same distance for each tick.
	let distance = progress * state.config.speed;
	for (let ply of state.game.players) {
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