/* eslint-disable import/no-extraneous-dependencies */
import {
  legalDirections,
  getInitialState,
  copyState,
  resetPlayers,
  addPlayer,
  movePlayer,
  directPlayer,
} from '../operations';

let gameState = getInitialState();

describe('copyState(...)', () => {
  let stateCopy;

  beforeAll(() => { stateCopy = copyState(gameState); });

  test('Copy isn\'t the same object reference', () => {
    expect(stateCopy).not.toBe(gameState);
  });

  test('Copy was actually a deep-copy', () => {
    expect(stateCopy.players).not.toBe(gameState.players);
  });

  test('All properties were copied.', () => {
    expect(stateCopy).toEqual(gameState);
  });
});

describe('resetPlayers(...)', () => {
  beforeEach(() => {
    addPlayer(gameState, '1337', 'TestPlayer', '#0F0');
    addPlayer(gameState, '1338', 'TestPlayer2', '#00F');
  });

  afterEach(() => {
    gameState = getInitialState();
  });

  test('Players who were previously dead are now flagged as alive.', () => {
    gameState.players[0].alive = false; // Kill 'em!
    resetPlayers(gameState);
    gameState.players.forEach(ply => expect(ply.alive).toBe(true));
  });

  test('Each player has a valid default trail and position', () => {
    resetPlayers(gameState);
    gameState.players.forEach((ply) => {
      expect(ply.position).toHaveLength(2);
      ply.trail.forEach((trailPos) => {
        expect(trailPos).toHaveLength(2);

        // Trail position must be a copy of position.
        expect(trailPos).toEqual(ply.position);
        expect(trailPos).not.toBe(ply.position);
      });
    });
  });
});

describe('movePlayer(...)', () => {
  let ply;
  beforeAll(() => {
    ply = addPlayer(gameState, '1337', 'TestPlayer', '#0F0');
  });

  afterEach(() => {
    resetPlayers(gameState);
  });

  afterAll(() => {
    gameState = getInitialState();
  });

  test('Player position set as expected.', () => {
    const moveDistance = 10;

    const [ x, y ] = ply.position;
    const expectedPositions = {
      north: [x, y - moveDistance],
      south: [x, y + moveDistance],
      west: [x - moveDistance, y],
      east: [x + moveDistance, y],
    };
    const expectedPosition = expectedPositions[ply.direction];

    movePlayer(ply, moveDistance);

    expect(ply.position).toEqual(expectedPosition);
  });

  test('Player last position updated in trail.', () => {
    const oldPos = ply.position.slice();
    movePlayer(ply, 10);
    expect(ply.trail[ply.trail.length - 1]).toEqual(oldPos);
  });
});

describe('directPlayer(...)', () => {
  const plySize = gameState.playerSize;

  let ply, legal, allDirections, illegal;
  beforeAll(() => {
    ply = addPlayer(gameState, '1337', 'TestPlayer', '#0F0');

    // Figure out the legal and illegal moves the player could make.
    legal = legalDirections[ply.direction];
    allDirections = Object.keys(legalDirections);
    illegal = allDirections.filter(d => legal.indexOf(d) === -1);
  });

  afterEach(() => {
    resetPlayers(gameState);
  });

  afterAll(() => {
    gameState = getInitialState();
  });

  test('Error on to direct player in a non-existent direction', () => {
    const fake = 'FakeDirection';
    expect(() => { directPlayer(ply, plySize, fake); }).toThrow();
  });

  test('Error on attempt to direct player in an illegal direction', () => {
    illegal.forEach((tryDirection) => {
      expect(() => { directPlayer(ply, plySize, tryDirection); }).toThrow();
    });
  });

  test('Error on attempt to direct player if they haven\'t yet moved the minimum distance.', () => {
    expect(() => { directPlayer(ply, plySize, legal[0]); }).toThrow();
  });

  test('Error on attempt to direct player if they\'re not alive.', () => {
    const moveDistance = plySize + 1;
    movePlayer(ply, moveDistance);
    ply.alive = false; // Kill 'em!
    expect(() => { directPlayer(ply, plySize, legal[0]); }).toThrow();
  });

  test('Allow legal attempt to move.', () => {
    const moveDistance = plySize + 1;
    movePlayer(ply, moveDistance);
    directPlayer(ply, plySize, legal[0]);
    expect(ply.direction).toBe(legal[0]);
  });
});

