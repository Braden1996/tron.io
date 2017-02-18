"use strict";

import draw from "./draw.js";
import initMenu, {drawMenu} from "./menu.js";
import initUi from "./ui/main.js";
import update from "./update/main.js";
import createState from "./state/main.js";

let lastTick = 0;

function tick(canvas, state, curtick) {
	let progress = curtick - lastTick;

	if (state.game === undefined) {
		drawMenu(canvas, state);
	} else {
		if (!state.game.finished) {
			update(state, progress);
			draw(canvas, state);
		}
	}

	lastTick = curtick;
	window.requestAnimationFrame((curtick) => tick(canvas, state, curtick));
}

export default function gameMain() {
	let state = createState();
	initUi(state);

	let canvas = document.getElementById("game__canvas");

	let fixSize = () => {
		if (window.innerWidth > window.innerHeight) {
			canvas.width = window.innerHeight;
	        canvas.height = window.innerHeight;
		} else {
			canvas.width = window.innerWidth;
	        canvas.height = window.innerWidth;
		}

		// Redraw
		if (state.game === undefined) {
			drawMenu(canvas, state);
		} else {
			draw(canvas, state);
		}
	}

	window.addEventListener("resize", fixSize, false);
	fixSize();

	initMenu(state);

	window.requestAnimationFrame((curtick) => tick(canvas, state, curtick));
}