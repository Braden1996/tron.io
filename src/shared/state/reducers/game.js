"use strict";

import Immutable from "immutable";
import {
	START_GAME,
	FINISH_GAME,
	UPDATE_ARENA_SIZE,
	UPDATE_PLAYER_SIZE,
	UPDATE_SPEED
} from "../actions/game.js";


export const INITIAL_GAME_STATE = Immutable.Map({
	started: false,
	finished: undefined,
	arenaSize: 128,
	playerSize: 1,
	speed: 0.1
});

export default function gameReducer(state = INITIAL_GAME_STATE, action) {
	switch (action.type) {
		case START_GAME:
			return state.set("started", action.value);

		case FINISH_GAME:
			return state.set("finished", action.value);

		case UPDATE_ARENA_SIZE:
			return state.set("arenaSize", action.value);

		case UPDATE_PLAYER_SIZE:
			return state.set("playerSize", action.value);

		case UPDATE_SPEED:
			return state.set("speed", action.value);

		default:
			return state;
	}
}