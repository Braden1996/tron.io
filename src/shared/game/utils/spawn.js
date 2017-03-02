"use strict";

import {
	resetPlayer,
	updatePlayerPosition,
	updatePlayerDirection
} from "../state/actions/players.js";


export default function getSpawn(ply, k, plySize, arenaSize) {
	const plySizeOffset = plySize / 2;
	const gridMiddle = Math.floor(arenaSize / 2);
	switch (k) {
		case 0:
			return {
				direction: "north",
				position: [gridMiddle, arenaSize-plySizeOffset]
			};

		case 1:
			return {
				direction: "south",
				position: [gridMiddle, plySizeOffset]
			};

		case 2:
			return {
				direction: "east",
				position: [plySizeOffset, gridMiddle]
			};

		case 3:
			return {
				direction: "west",
				position: [arenaSize-plySizeOffset, gridMiddle]
			};
	}
}