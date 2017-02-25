"use strict";

import { combineReducers } from "redux";

import gameReducer from "./game.js";
import inputReducer from "./input.js";
import playersReducer from "./players.js";

export default function tronReducer(state = {}, action) {
	let newState = {
		game: gameReducer(state.game, action),
		input: inputReducer(state.input, action),
	};
	newState.players = playersReducer(state.players, action, newState.game);
	return newState;
}