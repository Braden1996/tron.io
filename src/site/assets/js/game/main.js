"use strict";

import {DIRECTIONS, createGameState} from "./state.js";

let lastTick = 0;

function update(state, progress) {
	let findDirectionStr = (v) => Object.keys(DIRECTIONS).find((e) => DIRECTIONS[e] == v);
	console.log(`Player 0: ${state.players[0].position}, moving: ${findDirectionStr(state.players[0].direction)}`);
	console.log(`Player 1: ${state.players[1].position}, moving: ${findDirectionStr(state.players[1].direction)}`);
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
	let state = createGameState(gridSize);
	window.requestAnimationFrame((curtick) => tick(state, curtick));
}