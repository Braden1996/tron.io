import getSpawn from './utils/spawn';

export let legalDirections = {
  north: ['east', 'west'],
  south: ['east', 'west'],
  east: ['north', 'south'],
  west: ['north', 'south'],
};

export function getInitialState() {
  return {
    tick: 0,
    progress: null,
    started: false,
    finished: undefined,
    arenaSize: 128,
    playerSize: 1,
    speed: 0.01,//66,
    players: [],
  };
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
    ply.trail = [ply.position.slice(), ply.position.slice()];
  });
}

export function addPlayer(state, id, name, color) {
  const ply = {
    id,
    name,
    color,
    alive: true,
    direction: null,
    position: null,
    trail: [],
  };

  state.players.push(ply);

  // Reset all player positions.
  resetPlayers(state);

  return ply;
}

export function removePlayer(state, id) {
  const idx = state.players.findIndex(ply => ply.id === id);
  if (idx !== -1) {
    state.players.splice(idx, 1);
    resetPlayers(state);
  }
}

export function movePosition(oldPosition, direction, distance) {
  const newPosition = oldPosition.slice();
  switch (direction) {
    case 'north':
      newPosition[1] -= distance;
      break;
    case 'south':
      newPosition[1] += distance;
      break;
    case 'west':
      newPosition[0] -= distance;
      break;
    case 'east':
      newPosition[0] += distance;
      break;
    default:
      throw new Error(`Unable to move position '${oldPosition}' as '${ply.direction} is not a valid direction!`);
  }
  return newPosition;
}

export function movePlayer(ply, distance) {
  if (!ply.alive) {
    throw new Error(`Unable to move player '${ply.name}' as they're dead!`);
  } else {
    // Update trail's last move position with a copy of ply's current position.
    const oldPos = ply.position.slice();

    try {
      ply.position = movePosition(ply.position, ply.direction, distance);
    } catch(e) {
      throw new Error(`Unable to move player '${ply.name}' as '${ply.direction} is not a valid direction!`);
      return;
    }

    // Update the trail only after we've checked for all errors.
    ply.trail[ply.trail.length - 1] = oldPos;

    return ply.position;
  }
}

export function directPlayer(ply, plySize, direction) {
  if (!ply.alive) {
    throw new Error(`Unable to direct player '${ply.name}', to direction '${ply.direction}', as they're dead!`);
  } else {
    if (legalDirections[ply.direction].indexOf(direction) === -1) {
      throw new Error(`Unable to direct player '${ply.name}' to an invalid direction '${ply.direction}'!`);
    } else {
      // At what coordinate did we last change direction? This must ignore the
      // last move position which occupies the last trail index.
      const lastPoint = ply.trail[ply.trail.length - 2];

      // No need for Pythagoras, as we can only move along one axis.
      const xDiff = lastPoint[0] - ply.position[0];
      const yDiff = lastPoint[1] - ply.position[1];
      const curDistance = Math.abs(xDiff + yDiff);

      // Player must move at least past their own size.
      if (curDistance < plySize) {
        throw new Error(`Unable to direct player '${ply.name}' to direction '${ply.direction}', as they haven't move the minimum distance of '${plySize}' in their current direction!`);
      } else {
        ply.direction = direction;
        ply.trail[ply.trail.length - 1] = ply.position.slice();
        ply.trail.push(ply.position.slice());
      }
    }
  }
}
