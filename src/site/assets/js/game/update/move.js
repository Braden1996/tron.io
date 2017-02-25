"use strict";

import {updatePlayerPosition} from "../state/actions/players.js";


// Move all by some distance at each update tick.
export default function updateMove(store, progress) {
	const state = store.getState();

	const distance = progress * state.game.get("speed");
	state.players.forEach((ply, k) => {
		if (ply.get("alive")) {
			let posX = ply.get("position").get(0);
			let posY = ply.get("position").get(1);

			switch (ply.get("direction")) {
				case "north":
					posY -= distance;
					break;
				case "south":
					posY += distance;
					break;
				case "west":
					posX -= distance;
					break;
				default:  // case "east":
					posX += distance;
					break;
			}

			store.dispatch(updatePlayerPosition(ply.id, posX, posY));
		}
	});
}