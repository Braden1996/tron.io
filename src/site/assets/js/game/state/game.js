"use strict";

// A object factory to initialise a game state.
export default function createGameState(config) {
	let state = {};

	let gridMiddle = Math.floor(config.arenaSize / 2);

	// Create default state for each of the intended players.
	state.players = [
		{"position": [gridMiddle, config.arenaSize], "direction": "north", "trail": [], "alive": true},
		//{"position": [gridMiddle, 0], "direction": "south", "trail": [], "alive": true},
		//{"position": [0, gridMiddle], "direction": "east", "trail": [], "alive": true},
		//{"position": [config.arenaSize, gridMiddle], "direction": "west", "trail": [], "alive": true}
	];

	// Add clone of start position to trail array.
	for (let ply of state.players) {
		ply.trail.push(ply.position.slice());
	}

	return state;
}