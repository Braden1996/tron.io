"use strict";

export const DIRECTIONS = {"north": 0, "south": 1, "west": 2, "east": 3};

// A object factory to initialise a game state.
export function createGameState(gridSize) {
	let state = {};

	let gridMiddleWidth = Math.round(gridSize[0]/2);

	// Create default state for each of the intended players.
	state.players = [
		{"position": [gridMiddleWidth, gridSize[1]], "direction": DIRECTIONS["north"]},
		{"position": [gridMiddleWidth, 0], "direction": DIRECTIONS["south"]}
	];

	return state;
}