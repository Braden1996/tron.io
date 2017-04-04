import { lineToRect, createPlayerCollisionRect } from './collision';
import { copyPlayer } from './player';
import UniformGrid from '../utils/collision/grid';
import createCollisionRect from '../utils/collision/object';

export let legalDirections = {
  north: ['east', 'west'],
  south: ['east', 'west'],
  east: ['north', 'south'],
  west: ['north', 'south'],
};

export function getInitialState() {
  const state = {
    tick: 0,
    progress: null,
    started: false,
    finished: undefined,
    arenaSize: 64,
    playerSize: 1,
    speed: 0.015,
    players: [],
    cache: {
      collisionStruct: undefined
    }
  };

  return rebuildCache(state);
}

export function copyState(state) {
  const newState = {
    tick: state.tick,
    progress: state.progress,
    started: state.started,
    finished: state.finished,
    arenaSize: state.arenaSize,
    playerSize: state.playerSize,
    speed: state.speed,
    players: state.players.map(ply => copyPlayer(ply)),
    cache: {
      collisionStruct: state.cache.collisionStruct
    }
  };

  newState.cache.collisionStruct = state.cache.collisionStruct.clone((obj) => {
    const trailIndex = obj.trailIndex;
    const player = newState.players.find(ply => ply.id === obj.player.id);
    return { player, trailIndex };
  });

  return newState;
}

export function rebuildCache(state) {
  const arenaBounds = { x: 0, y: 0, w: state.arenaSize, h: state.arenaSize };
  const resolution = state.arenaSize / (8 * state.playerSize);
  state.cache.collisionStruct = new UniformGrid(arenaBounds, resolution);

  // Build collision struct from known trails.
  state.players.forEach((ply) => {
    if (ply.trail.length > 2) {
      const stroke = state.playerSize;
      let [ lastX, lastY ] = ply.trail[0];
      for (let i = 0; i < ply.trail.length - 2; i = i + 1) {
        const obj = { player: ply, trailIndex: i };
        const [ newX, newY ] = ply.trail[i + 1];
        const { x, y, w, h } = lineToRect(lastX, lastY, newX, newY, stroke);

        const trailRect = createCollisionRect(x, y, w, h, obj);
        state.cache.collisionStruct.insert(trailRect);

        lastX = newX;
        lastY = newY;
      }
    }

    // Use existing function for most recent trail rect.
    const collisionRect = createPlayerCollisionRect(state, ply);
    state.cache.collisionStruct.insert(collisionRect);
  });

  return state;
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
      throw new Error(`Unable to move position '${oldPosition}' as '${direction} is not a valid direction!`);
  }

  return newPosition;
}
