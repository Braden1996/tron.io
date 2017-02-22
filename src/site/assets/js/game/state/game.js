"use strict";

// A object factory to initialise a game state.
export default function createGameState(config) {
	let state = {"started": false, "finished": false};

	let gridMiddle = Math.floor(config.arenaSize / 2);

	let plySizeOffset = config.playerSize/2;

	// Create default state for each of the intended players.
	state.players = [
		{"position": [gridMiddle, config.arenaSize-plySizeOffset], "direction": "north", "trail": [], "alive": true, "name": undefined},
		{"position": [gridMiddle, plySizeOffset], "direction": "south", "trail": [], "alive": true, "name": undefined},
		//{"position": [plySizeOffset, gridMiddle], "direction": "east", "trail": [], "alive": true, "name": undefined},
		{"position": [config.arenaSize-plySizeOffset, gridMiddle], "direction": "west", "trail": [], "alive": true, "name": undefined}
	];

	// First element is the start position.
	// The last element is the position after last tick.
	for (let ply of state.players) {
		ply.trail.push(ply.position.slice());
		ply.trail.push(ply.position.slice());
	}

	return state;
}