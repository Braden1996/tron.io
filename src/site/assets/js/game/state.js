"use strict";

export const DIRECTIONS = {"NORTH": 0, "SOUTH": 1, "WEST": 2, "EAST": 3};

// A object factory to initialise a game state.
export function createGameState(gridSize) {
	let state = {};

	let gridMiddleWidth = Math.round(gridSize[0]/2);

	// Create default state for each of the intended players.
	state.players = [
		{"position": [gridMiddleWidth, gridSize[1]], "direction": DIRECTIONS["NORTH"]},
		{"position": [gridMiddleWidth, 0], "direction": DIRECTIONS["SOUTH"]}
	];

	return state;
}