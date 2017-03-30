/* eslint-disable import/no-extraneous-dependencies */
import {
  legalDirections,
  getInitialState,
  copyState,
} from '../general';
import {
  addPlayer,
  movePlayer,
  directPlayer,
} from '../player';

// Cretae an arbitrary game.
let gameState = getInitialState();
const ply = addPlayer(gameState, '1337', 'TestPlayer', '#0F0');
const ply2 = addPlayer(gameState, '1338', 'TestPlayer2', '#00F');

movePlayer(gameState, ply, 5);
directPlayer(gameState, ply, legalDirections[ply.direction][0]);
movePlayer(gameState, ply, 20);

movePlayer(gameState, ply2, 10);
directPlayer(gameState, ply2, legalDirections[ply2.direction][0]);
movePlayer(gameState, ply2, 15);

describe('copyState(...)', () => {
  let stateCopy;

  beforeAll(() => { stateCopy = copyState(gameState); });

  test('Provides a new object reference', () => {
    expect(stateCopy).not.toBe(gameState);
  });

  test('Players object was copied.', () => {
    expect(stateCopy.players).not.toBe(gameState.players);
  });

  test('All properties were copied.', () => {
    expect(stateCopy).toEqual(gameState);
  });

  test('Each player, and their positions, were copied.', () => {
    stateCopy.players.forEach((ply, k) => {
      const pl = gameState.players[k];
      expect(ply).toEqual(pl);
      expect(ply).not.toBe(pl);

      // Check that the position is a copy.
      expect(ply.position).toEqual(pl.position);
      expect(ply.position).not.toBe(pl.position);

      // Check if each trail position is a copy.
      pl.trail.forEach((xy, k) => {
        expect(ply.trail[k]).toEqual(xy);
        expect(ply.trail[k]).not.toBe(xy);
      });
    });
  });

  test('Collision struct objects copied.', () => {
    const allOldRects = gameState.cache.collisionStruct.getAll();
    const allNewRects = stateCopy.cache.collisionStruct.getAll();

    allNewRects.forEach((rect, k) => {
      const rect2 = allOldRects.find(r =>
        r.object.player.id === rect.object.player.id
        && r.object.trailIndex === rect.object.trailIndex
      );

      expect(rect).toEqual(rect2);
      expect(rect).not.toBe(rect2);

      expect(rect.object).toEqual(rect2.object);
      expect(rect.object).not.toBe(rect2.object);
    });
  });

  test('Collision struct objects updated with new player references.', () => {
    const allObjects = stateCopy.cache.collisionStruct.getAll();
    allObjects.forEach(o => {
      const ply = o.object.player;
      const ply2 = gameState.players.find(pl => pl.id === ply.id);
      const ply3 = stateCopy.players.find(pl => pl.id === ply.id);

      expect(ply).toEqual(ply2);
      expect(ply).not.toBe(ply2);

      expect(ply).toBe(ply3);
    });
  });
});
