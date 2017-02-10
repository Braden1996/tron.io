"use strict";

import config from "./config.js";
import createInputState from "./input.js";
import createGameState from "./game.js";

export default function createState() {
	return {
		"config": config,
		"game": createGameState(config),
		"input": createInputState(config)
	};
}