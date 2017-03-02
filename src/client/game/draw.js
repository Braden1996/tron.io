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
	arena.cellSize = refSize / (state.game.get("arenaSize") + 2*arena.borderSize);

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

	let plySize = arena.cellSize*state.game.get("playerSize");
	let plySizeOffset = plySize / 2;

	// Draw all our players.
	state.players.forEach((ply, k) => {
		let trailColor = ply.get("alive") ? "#90C695" : "#C0392B";
		let playerColor = ply.get("alive") ? "#3FC380" : "#CF000F";

		let x = arena.x + (ply.get("position").get(0) + arena.borderSize)*arena.cellSize;
		let y = arena.y + (ply.get("position").get(1) + arena.borderSize)*arena.cellSize;

		// Draw trail backwards from current position.
		ctx.beginPath();
		ctx.moveTo(x, y);
		let xi, yi;
		for (let i = ply.get("trail").size; i-- > 0; ) {
			xi = arena.x + (ply.get("trail").get(i).get(0) + arena.borderSize)*arena.cellSize;
			yi = arena.y + (ply.get("trail").get(i).get(1) + arena.borderSize)*arena.cellSize;

			// Player position is the centre.
			// So we need to make the first line a little longer.
			if (i == 0) {
				let lastX = x, lastY = y;
				if (ply.get("trail").size >= 2) {
					lastX = arena.x + (ply.get("trail").get(1).get(0) + arena.borderSize)*arena.cellSize;
					lastY = arena.y + (ply.get("trail").get(1).get(1) + arena.borderSize)*arena.cellSize;
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
	});
}

function drawMenu(canvas, state) {
	let ctx = canvas.getContext("2d");
	let arena = getArenaObject(canvas, state);

	drawBorder(ctx, state, arena);
	ctx.font = "48px 'Lucida Sans Unicode'";
	ctx.fillStyle = '#3FC380';
	ctx.textAlign = "center";
  	ctx.fillText("TRON", canvas.clientWidth/2, canvas.clientHeight/2);
}

export default function draw(store, canvas) {
  const state = store.getState();

	let ctx = canvas.getContext("2d");
	let arena = getArenaObject(canvas, state);

	if (state.game === undefined) {
		drawMenu(canvas, state);
	} else {
		drawArena(ctx, state, arena);
	}
}
