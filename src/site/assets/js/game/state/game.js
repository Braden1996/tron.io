"use strict";

// A object factory to initialise a game state.
export default function createGameState(config) {
	let state = {};

	let gridMiddleX = Math.floor(config.arenaSize / 2);

	// Create default state for each of the intended players.
	state.players = [
		{"position": [gridMiddleX, config.arenaSize], "direction": "north", "trail": [], "alive": true},
		//{"position": [gridMiddleX, 0], "direction": "south", "trail": [], "alive": true}
	];

	// Add clone of start position to trail array.
	for (let ply of state.players) {
		ply.trail.push(ply.position.slice());
	}

	return state;
}