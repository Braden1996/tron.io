"use strict";

import Immutable from "immutable";


export const ADD_PLAYER = "ADD_PLAYER";
export function addPlayer(name, color="#0f0") {
	return {
		type: ADD_PLAYER,
		name: name,
		color: color
	};
}

export const KILL_PLAYER = "KILL_PLAYER";
export function killPlayer(plyId) {
	return {
		type: KILL_PLAYER,
		id: plyId
	};
}

export const RESET_PLAYER = "RESET_PLAYER";
export function resetPlayer(plyId) {
	return {
		type: RESET_PLAYER,
		id: plyId
	};
}

export const UPDATE_PLAYER_DIRECTION = "UPDATE_PLAYER_DIRECTION";
export function updatePlayerDirection(plyId, direction) {
	return {
		type: UPDATE_PLAYER_DIRECTION,
		id: plyId,
		value: direction
	};
}

export const UPDATE_PLAYER_POSITION = "UPDATE_PLAYER_POSITION";
export function updatePlayerPosition(plyId, positionX, positionY) {
	return {
		type: UPDATE_PLAYER_POSITION,
		id: plyId,
		value: Immutable.List([positionX, positionY])
	};
}