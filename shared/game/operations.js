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

export function copyState(state) {
  return JSON.parse(JSON.stringify(state));
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

export function removePlayer(state, id) {
  const idx = state.players.findIndex(ply => ply.id === id);
  if (idx !== -1) {
    state.players.splice(idx, 1);
    resetPlayers(state);
  }
}

export function updatePlayerDirection(ply, plySize, direction) {
  if (ply.alive) {
    let newDirection;
    switch (direction) {
      case 'north':
        newDirection = 'north';
        break;
      case 'south':
        newDirection = 'south';
        break;
      case 'east':
        newDirection = 'east';
        break;
      case 'west':
        newDirection = 'west';
        break;
      default:
        newDirection = undefined;
        break;
    }

    if (newDirection !== undefined) {
      const lastPoint = ply.trail[ply.trail.length - 2];

      // No need for Pythagoras, as we can only move along one axis.
      const xDiff = lastPoint[0] - ply.position[0];
      const yDiff = lastPoint[1] - ply.position[1];
      const curDistance = Math.abs(xDiff + yDiff);

      // Player must move at least one grid cell before changing direction.
      if (curDistance >= plySize) {
        const oldDirection = ply.direction;

        if (newDirection !== oldDirection &&
          !(oldDirection === 'north' && newDirection === 'south') &&
          !(oldDirection === 'south' && newDirection === 'north') &&
          !(oldDirection === 'west' && newDirection === 'east') &&
          !(oldDirection === 'east' && newDirection === 'west')) {
          // Now we can update the change in direction.
          ply.direction = newDirection;
          ply.trail[ply.trail.length - 1] = [ply.position[0], ply.position[1]];
          ply.trail.push(ply.position);
        }
      }
    }
  }
}

export function updatePlayerPosition(ply, newPos, ignoreOldPos = false) {
  if (!ignoreOldPos) {
    const oldPos = ply.position;
    ply.trail[ply.trail.length - 1] = oldPos;
  }

  ply.position = newPos;
}
