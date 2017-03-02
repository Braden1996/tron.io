"use strict";

import {
	resetPlayer,
	updatePlayerPosition,
	updatePlayerDirection
} from "../state/actions/players.js";


export default function getSpawn(k, totalPlayers, plySize, arenaSize) {
	const plySizeOffset = plySize / 2;
  const side = k % (4);
  const sidePos = Math.floor(k / 4);
  const sidePlayers = totalPlayers / 4;
  const sideStart = (1+sidePos)*arenaSize/(sidePlayers+1);

	switch (side) {
		case 0:
			return {
				direction: "north",
				position: [sideStart, arenaSize-plySizeOffset]
			};

		case 1:
			return {
				direction: "south",
				position: [sideStart, plySizeOffset]
			};

		case 2:
			return {
				direction: "east",
				position: [plySizeOffset, sideStart]
			};

		case 3:
			return {
				direction: "west",
				position: [arenaSize-plySizeOffset, sideStart]
			};
	}
}
