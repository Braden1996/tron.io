"use strict";

import { combineReducers } from "redux";

import gameReducer from "./game.js";
import inputReducer from "./input.js";
import playersReducer from "./players.js";


const tronReducer = combineReducers({
	game: gameReducer,
	input: inputReducer,
	players: playersReducer
});

export default tronReducer;