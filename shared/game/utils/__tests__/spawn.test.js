/* eslint-disable import/no-extraneous-dependencies */
import getSpawn from '../spawn';

const plySize = 1;
const arenaSize = 10;

describe('Correct spawn positions for 4 players', () => {
  const totalPlayers = 4;

  const plySpawns = [];

  beforeEach(() => {
    for (let k = 0; k < totalPlayers; k++) {
      const spawn = getSpawn(k, totalPlayers, plySize, arenaSize);
      plySpawns.push({ ply: k, spawn });
    }
  });

  afterEach(() => {
    plySpawns.reduce(() => false);
  });

  test('Each player got a valid spawn object', () => {
    plySpawns.forEach((plySpawn) => {
      const { spawn } = plySpawn;

      // Check the spawn direction.
      expect(spawn).toHaveProperty('direction');
      const correctDirections = ['north', 'south', 'east', 'west'];
      expect(correctDirections).toContain(spawn.direction);

      // Check the spawn position.
      expect(spawn).toHaveProperty('position');
      expect(spawn.position).toHaveLength(2);
      const x = spawn.position[0];
      const y = spawn.position[1];
      expect(x).toEqual(expect.any(Number));
      expect(y).toEqual(expect.any(Number));
    });
  });

  test('No two players were given the same spawn', () => {
    plySpawns.forEach((plySpawn) => {
      const { ply, spawn } = plySpawn;
      plySpawns.forEach((otherPlySpawn) => {
        const { otherPly, otherSpawn } = otherPlySpawn;
        if (ply !== otherPly) {
          expect(spawn).not.toEqual(otherSpawn);
        }
      });
    });
  });

  test('Each player received the expected spawn', () => {
    const nearPlyCentre = (plySize / 2);
    const midPlyCentre = arenaSize / 2;
    const farPlyCentre = arenaSize - (plySize / 2);

    const correctSpawns = [
      { direction: 'north', position: [midPlyCentre, farPlyCentre] },
      { direction: 'south', position: [midPlyCentre, nearPlyCentre] },
      { direction: 'east', position: [nearPlyCentre, midPlyCentre] },
      { direction: 'west', position: [farPlyCentre, midPlyCentre] },
    ];

    plySpawns.forEach((plySpawn) => {
      const { spawn } = plySpawn;
      expect(correctSpawns).toContainEqual(spawn);
    });
  });
});
