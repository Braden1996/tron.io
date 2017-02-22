"use strict";

export function getArenaObject(canvas, state) {
	let arenaPadding = 4;
	let arena = {
		padding: arenaPadding,
		x: arenaPadding,
		y: arenaPadding,
		w: canvas.clientWidth - 2*arenaPadding,
		h: canvas.clientHeight - 2*arenaPadding,
		borderSize: 1
	}

	// Calculate arena cell-size.
	let refSize = arena.w > arena.h ? arena.h : arena.w;
	arena.cellSize = refSize / (state.config.arenaSize + 2*arena.borderSize);

	return arena;
}

export function drawBorder(ctx, state, arena) {
	ctx.beginPath();
	ctx.moveTo(arena.x, arena.y);
    ctx.lineTo(arena.x + arena.w, arena.y);
    ctx.lineTo(arena.x + arena.w, arena.y + arena.h);
    ctx.lineTo(arena.x, arena.y + arena.h);
    ctx.lineTo(arena.x, arena.y);
	ctx.lineWidth = arena.cellSize*arena.borderSize*2;
	ctx.strokeStyle = "#2574A9";
	ctx.stroke();
	ctx.closePath();
}

function drawArena(ctx, state, arena) {
	ctx.clearRect(arena.x, arena.y, arena.w, arena.h);

	drawBorder(ctx, state, arena);

	let plySize = arena.cellSize*state.config.playerSize;
	let plySizeOffset = plySize / 2;

	// Draw all our players.
	for (let ply of state.game.players) {
		let trailColor = ply.alive ? "#90C695" : "#C0392B";
		let playerColor = ply.alive ? "#3FC380" : "#CF000F";

		let x = arena.x + (ply.position[0] + arena.borderSize)*arena.cellSize;
		let y = arena.y + (ply.position[1] + arena.borderSize)*arena.cellSize;

		// Draw trail backwards from current position.
		ctx.beginPath();
		ctx.moveTo(x, y);
		let xi, yi;
		for (let i = ply.trail.length; i-- > 0; ) {
			xi = arena.x + (ply.trail[i][0] + arena.borderSize)*arena.cellSize;
			yi = arena.y + (ply.trail[i][1] + arena.borderSize)*arena.cellSize;

			// Player position is the centre.
			// So we need to make the first line a little longer.
			if (i == 0) {
				let lastX = x, lastY = y;
				if (ply.trail.length >= 2) {
					lastX = arena.x + (ply.trail[1][0] + arena.borderSize)*arena.cellSize;
					lastY = arena.y + (ply.trail[1][1] + arena.borderSize)*arena.cellSize;
				}
				let xDir = xi - lastX, yDir = yi - lastY;
				xi = xi + plySizeOffset*((xDir === 0) ? 0 : (xDir > 0 ? 1 : -1));
				yi = yi + plySizeOffset*((yDir === 0) ? 0 : (yDir > 0 ? 1 : -1));
			}

			ctx.lineTo(xi, yi);
		}

		ctx.lineWidth = plySize;
		ctx.strokeStyle = trailColor;
		ctx.stroke();
		ctx.closePath();

		// Draw player.
		ctx.beginPath();
		ctx.rect(x - plySizeOffset, y - plySizeOffset, plySize, plySize);
		ctx.fillStyle = playerColor;
		ctx.fill();
		ctx.closePath();
	}
}

// A object factory to initialise a game state.
export default function draw(canvas, state) {
	let ctx = canvas.getContext("2d");
	let arena = getArenaObject(canvas, state);
	drawArena(ctx, state, arena);
}