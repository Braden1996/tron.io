"use strict";

function drawArena(ctx, state, arena) {
	ctx.clearRect(arena.x, arena.y, arena.w, arena.h);

	let cellWidth = arena.w / state.config.gridSize[0];
	let cellHeight = arena.h / state.config.gridSize[1];

	// Draw vertical lines.
	// Note: 0.5 is added to prevent rounding errors.
	for (let x0 = arena.x; x0 <= arena.x + arena.w + 0.5; x0 += cellWidth) {
	    ctx.moveTo(x0, arena.y);
	    ctx.lineTo(x0, arena.y + arena.h);
	}

	// Draw horizontal lines.
	for (let y0 = arena.y; y0 <= arena.y + arena.h + 0.5; y0 += cellHeight) {
	    ctx.moveTo(arena.x, y0);
	    ctx.lineTo(arena.x + arena.w, y0);
	}

	ctx.strokeStyle = "#2574A9";
	ctx.stroke();

	// Draw all our players.
	for (let ply of state.game.players) {
		let x = arena.x + ply.position[0]*cellWidth;
		let y = arena.y + ply.position[1]*cellHeight;
		ctx.beginPath();
		ctx.rect(x, y, cellWidth, cellHeight);
		ctx.fillStyle = "#3FC380";
		ctx.fill();
		ctx.closePath();
	}
}

// A object factory to initialise a game state.
export default function draw(state) {
	let canvas = document.getElementById("game__canvas");
	let ctx = canvas.getContext("2d");

	let arena = {padding: 4};
	arena.x = arena.padding;
	arena.y = arena.padding;
	arena.w = canvas.clientWidth - 2*arena.padding;
	arena.h = canvas.clientHeight - 2*arena.padding;

	drawArena(ctx, state, arena);
}