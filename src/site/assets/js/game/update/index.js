"use strict";

import updateCollision from "./collision.js";
import updateControl from "./control.js";
import updateMove from "./move.js";

import {FINISH_GAME} from "../state/actions/game.js";


export default function update(store, progress) {
	const state = store.getState();

	if (state.game.started && !state.game.finished) {
		if (!state.game.finished) {
			updateControl(store, progress);
			updateMove(store, progress);
			updateCollision(store, progress);
		}

		if (state.players.filter((p) => p.alive).length <= 1) {
			store.dispatch(FINISH_GAME);
		}
	}
}