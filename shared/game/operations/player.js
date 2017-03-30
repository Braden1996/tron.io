import {
  collisionStructCompare,
  createPlayerCollisionRect
} from './collision';
import { legalDirections, movePosition } from './general';
import getSpawn from '../utils/spawn';
import createCollisionRect from '../utils/collision/object';

export function resetPlayers(state) {
  const { players, playerSize, arenaSize } = state;

  // Clear collision data-structure.
  state.cache.collisionStruct.clear();

  players.forEach((ply, k) => {
    const spawn = getSpawn(k, players.length, playerSize, arenaSize);
    ply.alive = true;
    ply.direction = spawn.direction;
    ply.position = spawn.position;
    ply.trail = [ply.position.slice(), ply.position.slice()];

    const collisionRect = createPlayerCollisionRect(state, ply);
    state.cache.collisionStruct.insert(collisionRect);
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

export function copyPlayer(ply) {
  const { id, name, color, alive, direction, position, trail } = ply;

  const newPly = { id, name, color, alive, direction };
  newPly.position = position.slice();
  newPly.trail = trail.map(point => point.slice());
  return newPly;
}

export function movePlayer(state, ply, distance) {
  if (!ply.alive) {
    throw new Error(`Unable to move player '${ply.name}' as they're dead!`);
  }

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

  const collisionRect = createPlayerCollisionRect(state, ply);
  state.cache.collisionStruct.update(collisionRect, collisionStructCompare);

  return ply.position;
}

export function directPlayer(state, ply, direction) {
  if (!ply.alive) {
    throw new Error(`Unable to direct player '${ply.name}', to direction '${ply.direction}', as they're dead!`);
  }
  if (legalDirections[ply.direction].indexOf(direction) === -1) {
    throw new Error(`Unable to direct player '${ply.name}' to an invalid direction '${ply.direction}'!`);
  }

  // At what coordinate did we last change direction? This must ignore the
  // last move position which occupies the last trail index.
  const lastPoint = ply.trail[ply.trail.length - 2];

  // No need for Pythagoras, as we can only move along one axis.
  const xDiff = lastPoint[0] - ply.position[0];
  const yDiff = lastPoint[1] - ply.position[1];
  const curDistance = Math.abs(xDiff + yDiff);

  // Player must move at least past their own size.
  if (curDistance < state.playerSize) {
    throw new Error(`Unable to direct player '${ply.name}' to direction '${ply.direction}', as they haven't move the minimum distance of '${plySize}' in their current direction!`);
  }

  ply.trail[ply.trail.length - 1] = ply.position.slice();

  // No need to update collision struct as last element in trail will not be a
  // rect endpoint.
  // const collisionRect = createPlayerCollisionRect(state, ply);
  // state.cache.collisionStruct.update(collisionRect, collisionStructCompare);

  ply.direction = direction;

  ply.trail.push(ply.position.slice());
  const turnCollisionRect = createPlayerCollisionRect(state, ply);
  state.cache.collisionStruct.insert(turnCollisionRect);
}
