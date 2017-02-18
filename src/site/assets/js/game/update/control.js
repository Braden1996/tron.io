"use strict";

// Process user input allowing them to change their player's direction.
export default function updateControl(state, progress) {
	if (Object.keys(state.input.pressedKeys).length > 0) {
		let ply = state.game.players[0];

		if (ply.alive) {
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

			if (newDirection !== undefined) {
				// Player must move at least one grid cell before changing direction.
				let lastPoint = ply.trail.slice(-1)[0];

				// No need for Pythagoras, as we can only move along one axis. 
				let curDistance = Math.abs(lastPoint[0] - ply.position[0] + lastPoint[1] - ply.position[1]);
				
				if (curDistance >= 1) {
					let oldDirection = ply.direction;

					if (newDirection !== oldDirection &&
						!(oldDirection === "north" && newDirection === "south") &&
						!(oldDirection === "south" && newDirection === "north") &&
						!(oldDirection === "west" && newDirection === "east") &&
						!(oldDirection === "east" && newDirection === "west")) {
						ply.direction = newDirection;
						ply.trail[ply.trail.length-1] = ply.position.slice();
						ply.trail.push(ply.position.slice());
					}
				}
			}
		}
	}
}