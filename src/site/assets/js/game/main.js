"use strict";

import {DIRECTIONS, createGameState} from "./state.js";
import {KEYMAP, createInputState} from "./input.js";

let lastTick = 0;

function update(state, progress) {
	if (Object.keys(state.input.pressedKeys).length > 0) {
		let oldDirection = state.game.players[0].direction;
		if (state.input.pressedKeys["w"]) {
			state.game.players[0].direction = DIRECTIONS["north"];
		} else if (state.input.pressedKeys["a"]) {
			state.game.players[0].direction = DIRECTIONS["west"];
		} else if (state.input.pressedKeys["s"]) {
			state.game.players[0].direction = DIRECTIONS["south"];
		} else if (state.input.pressedKeys["d"]) {
			state.game.players[0].direction = DIRECTIONS["east"];
		}

		if (oldDirection !== state.game.players[0].direction) {
			let findDirectionStr = (v) => Object.keys(DIRECTIONS).find((e) => DIRECTIONS[e] == v);
			console.log(`Player 0: ${state.game.players[0].position}, moving: ${findDirectionStr(state.game.players[0].direction)}`);
		}
	}
}

function draw(state) {
	//console.log("DRAW!");
}

function tick(state, curtick) {
	let progress = curtick - lastTick;

	update(state, progress);
	draw(state);

	lastTick = curtick;
	window.requestAnimationFrame((curtick) => tick(state, curtick));
}

export default function gameMain() {
	console.log("Starting!");

	const gridSize = [100,100];
	let state = {"game": createGameState(gridSize), "input": createInputState()};
	window.requestAnimationFrame((curtick) => tick(state, curtick));
}