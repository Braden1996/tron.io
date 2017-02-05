"use strict";

import {CONFIG} from "./config.js";
import draw from "./draw.js";
import {KEYMAP, createInputState} from "./input.js";
import {DIRECTIONS, createGameState} from "./state.js";

let lastTick = 0;

function update(state, progress) {
	if (Object.keys(state.input.pressedKeys).length > 0) {
		let oldDirection = state.game.players[0].direction;
		if (state.input.pressedKeys["w"]) {
			state.game.players[0].direction = "north";
		} else if (state.input.pressedKeys["a"]) {
			state.game.players[0].direction = "west";
		} else if (state.input.pressedKeys["s"]) {
			state.game.players[0].direction = "south";
		} else if (state.input.pressedKeys["d"]) {
			state.game.players[0].direction = "east";
		}

		if (oldDirection !== state.game.players[0].direction) {
			switch(state.game.players[0].direction) {
				case "north":
					state.game.players[0].position[1]--;
					break;
				case "south":
					state.game.players[0].position[1]++;
					break;
				case "west":
					state.game.players[0].position[0]--;
					break;
				default:  // case "east":
					state.game.players[0].position[0]++;
					break;
			}

			console.log(`Player 0: ${state.game.players[0].position}, moving: ${state.game.players[0].direction}`);
		}
	}
}

function tick(state, curtick) {
	let progress = curtick - lastTick;

	update(state, progress);
	draw(state);

	lastTick = curtick;
	window.requestAnimationFrame((curtick) => tick(state, curtick));
}

export default function gameMain() {
	let state = {
		"config": CONFIG,
		"game": createGameState(CONFIG.gridSize),
		"input": createInputState()
	};
	window.requestAnimationFrame((curtick) => tick(state, curtick));
}