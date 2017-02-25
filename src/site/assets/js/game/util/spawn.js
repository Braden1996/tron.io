"use strict";

import {
	resetPlayer,
	updatePlayerPosition,
	updatePlayerDirection
} from "../state/actions/players.js";


export default function handleSpawnPositions(store) {
	const state = store.getState();

	const plySizeOffset = state.game.get("playerSize") / 2;
	const gridMiddle = Math.floor(state.game.get("arenaSize") / 2);
	return state.players.forEach((ply, k) => {
		let position, direction;
		switch (k) {
			case 1:
				position = [gridMiddle, config.arenaSize-plySizeOffset];
				direction = "north";
				break;

			case 2:
				position = [gridMiddle, plySizeOffset];
				direction = "south";
				break;

			case 3:
				position = [plySizeOffset, gridMiddle];
				direction = "east";
				break;

			case 4:
				position = [config.arenaSize-plySizeOffset, gridMiddle];
				direction = "west";
				break;
		}
		
		store.dispatch(resetPlayer(ply.id));
		store.dispatch(updatePlayerPosition(ply.id, position[0], position[1]));
		store.dispatch(updatePlayerDirection(ply.id, direction));
	});
}