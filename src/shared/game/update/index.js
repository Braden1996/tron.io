"use strict";

import updateCollision from "./collision.js";
import updateControl from "./control.js";
import updateMove from "./move.js";

import { updateFinishGame } from "../state/actions/game.js";


export default function update(store, progress) {
	const state = store.getState();

	if (state.game.get("started") && !state.game.get("finished")) {
		updateControl(store, progress);
		updateMove(store, progress);
		updateCollision(store, progress);

		if ((state.players.size === 1 && !state.players.get(0).get("alive")) ||
			(state.players.size !== 1 && state.players.count(p => p.get("alive")) <= 1)) {
			store.dispatch(updateFinishGame(true));
		}
	}
}
