"use strict";

import updateCollision from "./collision.js";
import updateControl from "./control.js";
import updateMove from "./move.js";

export default function update(state, progress) {
	if (state.game !== undefined && !state.game.finished) {
		if (state.game.started) {
			updateControl(state, progress);
			updateMove(state, progress);
			updateCollision(state, progress);
		}

		if (state.game.players.filter((p) => p.alive).length <= 1) {
			state.game.finished = true;
		}
	}
}