"use strict";

export const START_GAME = "START_GAME";
export function updateStartGame(inValue) {
	return {
		type: START_GAME,
		value: inValue
	};
}

export const FINISH_GAME = "FINISH_GAME";
export function finishGame() {
	return { 
		type: FINISH_GAME
	};
}

export const UPDATE_ARENA_SIZE = "UPDATE_ARENA_SIZE";
export function updateArenaSize(size) {
	return {
		type: UPDATE_ARENA_SIZE,
		value: size
	};
}

export const UPDATE_PLAYER_SIZE = "UPDATE_PLAYER_SIZE";
export function updatePlayerSize(speed) {
	return {
		type: UPDATE_PLAYER_SIZE,
		value: speed
	};
}

export const UPDATE_SPEED = "UPDATE_SPEED";
export function updateSpeed(speed) {
	return {
		type: UPDATE_SPEED,
		value: speed
	};
}