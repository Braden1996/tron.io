"use strict";

import { combineReducers } from "redux";

import inputReducer from "./input.js";
import gameReducer from "Shared/state/reducers/game.js";
import playersReducer from "Shared/state/reducers/players.js";

export default function tronReducer(state = {}, action) {
	let newState = {
		game: gameReducer(state.game, action),
		input: inputReducer(state.input, action),
	};
	newState.players = playersReducer(state.players, action, newState.game);
	return newState;
}