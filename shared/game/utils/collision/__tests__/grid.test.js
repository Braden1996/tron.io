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

test('getAll() retrieves a single copy of each stored object.', () => {
  // Populate grid with a bunch of arbitrary rects.
  const addObjects = [
    new CollisionObject(7, 5, 2, 4, { id: 'rect1' }),
    new CollisionObject(6, 1, 2, 3, { id: 'rect2' }),
    new CollisionObject(1, 25, 3, 6, { id: 'rect3' }),
    new CollisionObject(2, 6, 1, 1, { id: 'rect4' }),
    new CollisionObject(5, 5, 5, 8, { id: 'rect5' }),
  ];
  addObjects.forEach(r => { testGrid.insert(r) });

  const all = testGrid.getAll();
  expect(all.length).toBe(addObjects.length);

  // Check that there is a one-to-one relationship.
  all.forEach(r => { expect(addObjects.indexOf(r)).not.toBe(-1) });
  addObjects.forEach(r => { expect(all.indexOf(r)).not.toBe(-1) });
});
