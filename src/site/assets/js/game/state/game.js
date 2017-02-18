"use strict";

// A object factory to initialise a game state.
export default function createGameState(config) {
	let state = {"started": false, "finished": false};

	let gridMiddle = Math.floor(config.arenaSize / 2);

	// Create default state for each of the intended players.
	state.players = [
		{"position": [gridMiddle, config.arenaSize], "direction": "north", "trail": [], "alive": true, "name": undefined},
		{"position": [gridMiddle, 0], "direction": "south", "trail": [], "alive": true, "name": undefined},
		//{"position": [0, gridMiddle], "direction": "east", "trail": [], "alive": true},
		//{"position": [config.arenaSize, gridMiddle], "direction": "west", "trail": [], "alive": true}
	];

	// First element is the start position.
	// The last element is the position after last tick.
	for (let ply of state.players) {
		ply.trail.push(ply.position.slice());
		ply.trail.push(ply.position.slice());
	}

	return state;
}