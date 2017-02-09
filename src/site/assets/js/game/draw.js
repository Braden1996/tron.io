"use strict";

function drawArena(ctx, state, arena) {
	ctx.clearRect(arena.x, arena.y, arena.w, arena.h);

	let cellSize;
	if (arena.w > arena.h) {
		cellSize = arena.h / state.config.arenaSize;
	} else {
		cellSize = arena.w / state.config.arenaSize;
	}

	let plySizeOffset = cellSize / 2;

	// Draw all our players.
	for (let ply of state.game.players) {
		let x = arena.x + ply.position[0]*cellSize;
		let y = arena.y + ply.position[1]*cellSize;

		// Draw trail backwards from current position.
		ctx.beginPath();
		ctx.moveTo(x, y);
		for (let i = ply.trail.length; i-- > 0; ) {
			ctx.lineTo(arena.x + ply.trail[i][0]*cellSize, arena.y + ply.trail[i][1]*cellSize);
		}
		ctx.lineWidth = cellSize;
		ctx.strokeStyle = "#90C695";
		ctx.stroke();
		ctx.closePath();

		// Draw player.
		ctx.beginPath();
		ctx.rect(x - plySizeOffset, y - plySizeOffset, cellSize, cellSize);
		ctx.fillStyle = "#3FC380";
		ctx.fill();
		ctx.closePath();
	}

	// Draw border
	ctx.beginPath();
	ctx.moveTo(arena.x, arena.y);
    ctx.lineTo(arena.x + arena.w, arena.y);
    ctx.lineTo(arena.x + arena.w, arena.y + arena.h);
    ctx.lineTo(arena.x, arena.y + arena.h);
    ctx.lineTo(arena.x, arena.y);
	ctx.strokeStyle = "#2574A9";
	ctx.stroke();
	ctx.closePath();
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