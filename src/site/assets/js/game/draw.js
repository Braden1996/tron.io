"use strict";

function drawArena(ctx, state, arena) {
	ctx.clearRect(arena.x, arena.y, arena.w, arena.h);

	let borderSize = 1;

	let cellSize;
	if (arena.w > arena.h) {
		cellSize = arena.h / (state.config.arenaSize + 2*borderSize);
	} else {
		cellSize = arena.w / (state.config.arenaSize + 2*borderSize);
	}

	// Draw border
	ctx.beginPath();
	ctx.moveTo(arena.x, arena.y);
    ctx.lineTo(arena.x + arena.w, arena.y);
    ctx.lineTo(arena.x + arena.w, arena.y + arena.h);
    ctx.lineTo(arena.x, arena.y + arena.h);
    ctx.lineTo(arena.x, arena.y);
	ctx.lineWidth = cellSize;
	ctx.strokeStyle = "#2574A9";
	ctx.stroke();
	ctx.closePath();

	let plySizeOffset = cellSize / 2;

	// Draw all our players.
	for (let ply of state.game.players) {
		let trailColor = ply.alive ? "#90C695" : "#C0392B";
		let playerColor = ply.alive ? "#3FC380" : "#CF000F";

		let x = arena.x + (ply.position[0] + borderSize)*cellSize;
		let y = arena.y + (ply.position[1] + borderSize)*cellSize;

		// Draw trail backwards from current position.
		ctx.beginPath();
		ctx.moveTo(x, y);
		let xi, yi;
		for (let i = ply.trail.length; i-- > 0; ) {
			xi = arena.x + (ply.trail[i][0] + borderSize)*cellSize;
			yi = arena.y + (ply.trail[i][1] + borderSize)*cellSize;

			// Player position is the centre.
			// So we need to make the first line a little longer.
			if (i == 0) {
				let lastX = x, lastY = y;
				if (ply.trail.length >= 2) {
					lastX = arena.x + (ply.trail[1][0] + borderSize)*cellSize;
					lastY = arena.y + (ply.trail[1][1] + borderSize)*cellSize;
				}
				let xDir = xi - lastX, yDir = yi - lastY;
				xi = xi + plySizeOffset*((xDir === 0) ? 0 : (xDir > 0 ? 1 : -1));
				yi = yi + plySizeOffset*((yDir === 0) ? 0 : (yDir > 0 ? 1 : -1));
			}

			ctx.lineTo(xi, yi);
		}

		ctx.lineWidth = cellSize;
		ctx.strokeStyle = trailColor;
		ctx.stroke();
		ctx.closePath();

		// Draw player.
		ctx.beginPath();
		ctx.rect(x - plySizeOffset, y - plySizeOffset, cellSize, cellSize);
		ctx.fillStyle = playerColor;
		ctx.fill();
		ctx.closePath();
	}
}

// A object factory to initialise a game state.
export default function draw(canvas, state) {
	let ctx = canvas.getContext("2d");

	let arena = {padding: 4};
	arena.x = arena.padding;
	arena.y = arena.padding;
	arena.w = canvas.clientWidth - 2*arena.padding;
	arena.h = canvas.clientHeight - 2*arena.padding;

	drawArena(ctx, state, arena);
}