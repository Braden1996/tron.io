"use strict";

import {getArenaObject, drawBorder} from "./draw.js";
import createGameState from "./state/game.js";

export function drawMenu(canvas, state) {
	let ctx = canvas.getContext("2d");
	let arena = getArenaObject(canvas, state);

	drawBorder(ctx, state, arena);
	ctx.font = "48px 'Lucida Sans Unicode'";
	ctx.fillStyle = '#3FC380';
	ctx.textAlign = "center";
  	ctx.fillText("TRON", canvas.clientWidth/2, canvas.clientHeight/2);
}

export default function initMenu(state) {}