"use strict";

import {getArenaObject, drawBorder} from "../draw.js";

export default function drawMenu(canvas, state) {
	let ctx = canvas.getContext("2d");
	let arena = getArenaObject(canvas, state);

	drawBorder(ctx, state, arena);
	ctx.font = "48px serif";
	ctx.fillStyle = '#3FC380';
	ctx.textAlign = "center";
  	ctx.fillText("Hit enter!", canvas.clientWidth/2, canvas.clientHeight/2);
}