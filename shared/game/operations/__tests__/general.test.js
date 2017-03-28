/* eslint-disable import/no-extraneous-dependencies */
import {
  legalDirections,
  getInitialState,
  copyState,
} from '../general';

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
