"use strict";

// A object factory to initialise a game state.
export function createGameState(gridSize) {
	let state = {};

	let gridMiddleWidth = Math.floor(gridSize[0]/2);

	// Create default state for each of the intended players.
	state.players = [
		{"position": [gridMiddleWidth, gridSize[1]-1], "direction": "north"},
		{"position": [gridMiddleWidth, 0], "direction": "south"}
	];

	return state;
}