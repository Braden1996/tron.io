export function getInitialState() {
  return {
    started: false,
    finished: undefined,
    arenaSize: 128,
    playerSize: 1,
    speed: 0.1,
    players: [],
  }
}

export function resetPlayers(players, getSpawn) {
  players.forEach((ply, k) => {
    const spawn = getSpawn(ply, k);
    ply.alive = true;
    ply.direction = spawn.direction;
    ply.position = spawn.position;
    ply.trail = [ply.position, ply.position];
  });
}

export function addPlayer(players, id, name, color) {
  const ply = {
    id,
    name,
    color,
    alive: true,
    direction: null,
    position: null,
    trail: [],
  };

  players.push(ply);
}

export function updatePlayerPosition(ply, newPos, ignoreOldPos = false) {
  if (!ignoreOldPos) {
    const oldPos = ply.position;
    ply.trail[ply.trail.length - 1] = oldPos;
  }

  ply.position = newPos;
}
