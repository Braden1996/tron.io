"use strict";

import {CONFIG} from "./config.js";
import draw from "./draw.js";
import {KEYMAP, createInputState} from "./input.js";
import {DIRECTIONS, createGameState} from "./state.js";

let lastTick = 0;

function update(state, progress) {
	if (Object.keys(state.input.pressedKeys).length > 0) {
		let ply = state.game.players[0];

		// Player must move at least one grid cell before changing direction.
		let lastPoint = ply.trail.slice(-1)[0];

		// No need for Pythagoras, as we can only move along one axis. 
		let curDistance = Math.abs(lastPoint[0] - ply.position[0] + lastPoint[1] - ply.position[1]);
		
		if (curDistance >= 1) {
			let oldDirection = ply.direction;
			if (state.input.pressedKeys["w"]) {
				ply.direction = "north";
			} else if (state.input.pressedKeys["a"]) {
				ply.direction = "west";
			} else if (state.input.pressedKeys["s"]) {
				ply.direction = "south";
			} else if (state.input.pressedKeys["d"]) {
				ply.direction = "east";
			}

			if (ply.direction !== oldDirection) {
				ply.trail.push(ply.position.slice());
			}
		}
	}

	// All players move the same distance for each tick.
	let distance = progress * state.config.speed;
	for (let ply of state.game.players) {
		switch(ply.direction) {
			case "north":
				ply.position[1] -= distance;
				break;
			case "south":
				ply.position[1] += distance;
				break;
			case "west":
				ply.position[0] -= distance;
				break;
			default:  // case "east":
				ply.position[0] += distance;
				break;
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
		"game": createGameState(CONFIG),
		"input": createInputState(CONFIG)
	};
	window.requestAnimationFrame((curtick) => tick(state, curtick));
}