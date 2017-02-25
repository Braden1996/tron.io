"use strict";

import { createStore } from "redux";

import draw from "./draw.js";
import update from "./update/index.js";
import handleSpawnPositions from "./util/spawn.js";
import tronReducer from "./state/reducers/index.js";
import { updateKeyDown, updateKeyUp } from "./state/actions/input.js";


let lastTick = 0;

function tick(canvas, store, curtick) {
	let progress = curtick - lastTick;

	update(store, progress);
	draw(canvas, store.getState());

	lastTick = curtick;
	window.requestAnimationFrame((curtick) => tick(canvas, store, curtick));
}

export default function gameMain() {
	const store = createStore(tronReducer);

	// Begin to listen for keyboard input.
	window.addEventListener("keydown", (evnt) => {
		store.dispatch(updateKeyDown(evnt.keyCode));
	}, false);
	window.addEventListener("keyup", (evnt) => {
		store.dispatch(updateKeyUp(evnt.keyCode));
	}, false);

	// Subscribe to store so we can set initial spawn positions.
	const unsubscribe = store.subscribe(() => handleSpawnPositions(store));

	const canvas = document.getElementById("game__canvas");

	const fixSize = () => {
		if (window.innerWidth > window.innerHeight) {
			canvas.width = window.innerHeight;
	        canvas.height = window.innerHeight;
		} else {
			canvas.width = window.innerWidth;
	        canvas.height = window.innerWidth;
		}

		// Redraw
		draw(canvas, store.getState());
	}

	window.addEventListener("resize", fixSize, false);
	fixSize();

	window.requestAnimationFrame((curtick) => tick(canvas, store, curtick));
	return store;
}