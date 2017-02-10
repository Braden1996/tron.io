"use strict";

import draw from "./draw.js";
import update from "./update.js";
import createState from "./state/main.js";

let lastTick = 0;

function tick(canvas, state, curtick) {
	let progress = curtick - lastTick;

	update(state, progress);
	draw(canvas, state);

	lastTick = curtick;
	window.requestAnimationFrame((curtick) => tick(canvas, state, curtick));
}

export default function gameMain() {
	let canvas = document.getElementById("game__canvas");

	let state = createState();

	let fixSize = () => {
		if (window.innerWidth > window.innerHeight) {
			canvas.width = window.innerHeight;
	        canvas.height = window.innerHeight;
		} else {
			canvas.width = window.innerWidth;
	        canvas.height = window.innerWidth;
		}
        draw(canvas, state);
	}

	window.addEventListener("resize", fixSize, false);
	fixSize();

	window.requestAnimationFrame((curtick) => tick(canvas, state, curtick));
}