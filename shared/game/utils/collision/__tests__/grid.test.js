/* eslint-disable import/no-extraneous-dependencies */
import UniformGrid from '../grid';
import CollisionObject from '../object';

let testGrid;
const BOUNDS = { x: 0, y: 0, w: 10, h: 10 };
const RESOLUTION = 3;

beforeEach(() => {
  testGrid = new UniformGrid(BOUNDS, RESOLUTION);
});

test('Add and retrieve a single object.', () => {
  const obj = { id: 'rect1' };

  // Knowing the grid's bounds and resolution, we attempt to add an object
  // into the centre cell node of said grid.
  const objRect = new CollisionObject(3.5, 3.5, 2, 2, obj);
  testGrid.insert(objRect);

  // Test that the only cell node which contains an object is the centre.
  testGrid.nodes.forEach((n, i) => expect(n).toHaveLength(i === 4 ? 1 : 0));

  // Query the tree using the same object we just inserted.
  const objRects = testGrid.retrieve(objRect);
  const gotObjRect = objRects[0];
  expect(gotObjRect).toBe(objRect);
  expect(gotObjRect.object).toBe(obj);
});

test('Add and retrieve an out of bounds object.', () => {
  const obj = { id: 'rect1' };

  // Knowing the grid's bounds and resolution, we attempt to add an object
  // which we know is out of bounds in the y direction.
  const objRect = new CollisionObject(3.5, -3, 2, 2, obj);
  testGrid.insert(objRect);

  // Test that the only cell node which contains an object is the first row
  // within the centre column.
  testGrid.nodes.forEach((n, i) => expect(n).toHaveLength(i === 1 ? 1 : 0));

  // Query the tree using the same object we just inserted.
  const objRects = testGrid.retrieve(objRect);
  const gotObjRect = objRects[0];
  expect(gotObjRect).toBe(objRect);
  expect(gotObjRect.object).toBe(obj);
});
