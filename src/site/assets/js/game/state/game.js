"use strict";

// A object factory to initialise a game state.
export default function createGameState(config) {
	let state = {"over": false};

	let gridMiddle = Math.floor(config.arenaSize / 2);

	// Create default state for each of the intended players.
	state.players = [
		{"position": [gridMiddle, config.arenaSize], "direction": "north", "trail": [], "alive": true},
		{"position": [gridMiddle, 0], "direction": "south", "trail": [], "alive": true},
		//{"position": [0, gridMiddle], "direction": "east", "trail": [], "alive": true},
		//{"position": [config.arenaSize, gridMiddle], "direction": "west", "trail": [], "alive": true}
	];

	// Clone position into trail array.
	// First element is the start position.
	// The last element is the position after last tick.
	for (let ply of state.players) {
		ply.trail.push(ply.position.slice());
		ply.trail.push(ply.position.slice());
	}

	return state;
}