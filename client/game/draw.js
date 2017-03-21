function drawBorder(canvas, arena) {
  const ctx = canvas.getContext('2d');
  ctx.beginPath();
  ctx.moveTo(arena.x, arena.y);
  ctx.lineTo(arena.x + arena.w, arena.y);
  ctx.lineTo(arena.x + arena.w, arena.y + arena.h);
  ctx.lineTo(arena.x, arena.y + arena.h);
  ctx.lineTo(arena.x, arena.y);
  ctx.lineWidth = arena.cellSize * arena.borderSize * 2;
  ctx.strokeStyle = '#2574A9';
  ctx.stroke();
  ctx.closePath();
}

function drawArena(canvas, state, arena) {
  const ctx = canvas.getContext('2d');
  ctx.clearRect(arena.x, arena.y, arena.w, arena.h);

  drawBorder(canvas, arena);

  const plySize = arena.cellSize * state.playerSize;
  const plySizeOffset = plySize / 2;

  // Draw all our players.
  state.players.forEach((ply) => {
    const trailColor = ply.alive ? '#90C695' : '#C0392B';
    const playerColor = ply.alive ? '#3FC380' : '#CF000F';

    const x = arena.x + ((ply.position[0] + arena.borderSize) * arena.cellSize);
    const y = arena.y + ((ply.position[1] + arena.borderSize) * arena.cellSize);

    // Draw trail backwards from current position.
    ctx.beginPath();
    ctx.moveTo(x, y);
    let xi;
    let yi;
    for (let i = ply.trail.length - 1; i >= 0; i -= 1) {
      xi = arena.x + ((ply.trail[i][0] + arena.borderSize) * arena.cellSize);
      yi = arena.y + ((ply.trail[i][1] + arena.borderSize) * arena.cellSize);

      // Player position is the centre.
      // So we need to make the first line a little longer.
      if (i === 0) {
        let lastX = x;
        let lastY = y;
        if (ply.trail.length >= 2) {
          lastX = arena.x + ((ply.trail[1][0] + arena.borderSize) * arena.cellSize);
          lastY = arena.y + ((ply.trail[1][1] + arena.borderSize) * arena.cellSize);
        }

        const xDir = xi - lastX;
        const yDir = yi - lastY;
        xi += plySizeOffset * Math.sign(xDir);
        yi += plySizeOffset * Math.sign(yDir);
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

function drawMenu(canvas, arena) {
  drawBorder(canvas, arena);

  const ctx = canvas.getContext('2d');
  ctx.font = '48px "Lucida Sans Unicode"';
  ctx.fillStyle = '#3FC380';
  ctx.textAlign = 'center';
  ctx.fillText('TRON', canvas.clientWidth / 2, canvas.clientHeight / 2);
}

export function getArenaObject(canvas, state) {
  const arenaPadding = 4;
  const arena = {
    padding: arenaPadding,
    x: arenaPadding,
    y: arenaPadding,
    w: canvas.clientWidth - (2 * arenaPadding),
    h: canvas.clientHeight - (2 * arenaPadding),
    borderSize: 1,
  };

  // Calculate arena cell-size.
  const refSize = arena.w > arena.h ? arena.h : arena.w;
  arena.cellSize = refSize / (state.arenaSize + (2 * arena.borderSize));

  return arena;
}

export default function draw(gameState, canvas) {
  const arena = getArenaObject(canvas, gameState);

  if (gameState.players.length === 0) {
    drawMenu(canvas, arena);
  } else {
    drawArena(canvas, gameState, arena);
  }

  // Some additional draw functions which are useful for debugging.
  if (process.env.BUILD_FLAG_IS_DEV) {
    const gameDrawDebug = require('./drawdebug').default;
    gameDrawDebug(gameState, canvas);
  }
}
