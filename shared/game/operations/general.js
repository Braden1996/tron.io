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
    speed: 0.02,//66,
    players: [],
    cache: {
      collisionGrid: undefined
    }
  };
}

export function copyState(state) {
  return JSON.parse(JSON.stringify(state));
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
