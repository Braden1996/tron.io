import getSpawn from './utils/spawn';

export function getInitialState() {
  return {
    tick: 0,
    started: false,
    finished: undefined,
    arenaSize: 128,
    playerSize: 1,
    speed: 0.1,
    players: [],
  }
}

export function resetPlayers(state) {
  const { players, playerSize, arenaSize } = state;

  players.forEach((ply, k) => {
    const spawn = getSpawn(k, players.length, playerSize, arenaSize);
    ply.alive = true;
    ply.direction = spawn.direction;
    ply.position = spawn.position;
    ply.trail = [ply.position, ply.position];
  });
}

export function addPlayer(state, id, name, color) {
  state.players.push({
    id,
    name,
    color,
    alive: true,
    direction: null,
    position: null,
    trail: [],
  });
  resetPlayers(state);
}

export function updatePlayerPosition(ply, newPos, ignoreOldPos = false) {
  if (!ignoreOldPos) {
    const oldPos = ply.position;
    ply.trail[ply.trail.length - 1] = oldPos;
  }

  ply.position = newPos;
}
