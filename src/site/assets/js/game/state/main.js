"use strict";

import config from "./config.js";
import createInputState from "./input.js";

export default function createState() {
	return {
		"config": config,
		"game": undefined,
		"input": createInputState(config)
	};
}