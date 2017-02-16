"use strict";

import createGameState from "../state/game.js";

export default function updateMenu(state, progress) {
	if (state.input.pressedKeys["enter"]) {
		state.game = createGameState(state.config);
	}
}