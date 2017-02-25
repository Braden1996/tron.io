"use strict";

import updateCollision from "./collision.js";
import updateControl from "./control.js";
import updateMove from "./move.js";

import {finishGame} from "../state/actions/game.js";


export default function update(store, progress) {
	const state = store.getState();

	if (state.game.get("started") && !state.game.get("finished")) {
		if (!state.game.get("finished")) {
			updateControl(store, progress);
			updateMove(store, progress);
			updateCollision(store, progress);
		}

		if ((state.players.size === 1 && state.players.get(0).get("alive")) ||
			(state.players.filter(p => p.get("alive")).size <= 1)) {
			store.dispatch(finishGame());
		}
	}
}