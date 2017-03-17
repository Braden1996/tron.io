/* eslint-disable import/no-extraneous-dependencies */
import Quadtree, { QuadtreeObjRect } from '../quadtree';

let testQuadTree;

beforeEach(() => {
  const bounds = { x: 0, y: 0, w: 10, h: 10 };
  testQuadTree = new Quadtree(bounds);
});

test('Add and retrieve a single object from the Quadtree.', () => {
  const obj = { id: 'rect1' };

  // Add an object into the tree and verify the array of tree objects has
  // increased.
  const objRect = new QuadtreeObjRect(0, 0, 2, 4, obj);
  testQuadTree.insert(objRect);
  expect(testQuadTree.objects).toHaveLength(1);

  // Query the tree using the same object we just inserted; that we should get
  // back.
  const objRects = testQuadTree.retrieve(objRect);
  const gotObjRect = objRects[0];
  expect(gotObjRect).toBe(objRect);
  expect(gotObjRect.object).toBe(obj);
});

test('Add and retrieve multiple objects from a Quadtree which has split.', () => {
  // To make things easier to test, set our Quadtree nodes to split when they
  // contained at least two objects.
  testQuadTree.MAX_OBJECTS = 1;

  // Create an object which should be within the bounds of two sub-nodes.
  const obj = { id: 'rect1' };
  const objRect = new QuadtreeObjRect(0, 0, 7, 4, obj);

  // Create an object which should be within the bounds of just a
  // single sub-node.
  const obj2 = { id: 'rect2' };
  const objRect2 = new QuadtreeObjRect(1, 1, 1, 1, obj2);

  // Inser the newly created nodes.
  testQuadTree.insert(objRect);  // Should lie within parent.
  testQuadTree.insert(objRect2);  // Should lie within top-left sub-node.

  // Check that the root Quadtree node has split.
  expect(testQuadTree.nodes).toHaveLength(4);

  // Check that objRect was added to the parent/root node, as it
  // couldn't fit entirely within any single node.
  expect(testQuadTree.objects).toEqual([objRect]);

  // Check that when we query the tree for objRect2, we're given two potential
  // nodes. We sort because the order of checkReceived is arbitrary.
  const checkReceived = testQuadTree.retrieve(objRect2);
  const checkExpected = [objRect, objRect2];
  const sortedReceived = checkReceived.map(obj => obj.id).sort();
  const sortedExpected = checkExpected.map(obj => obj.id).sort();
  expect(sortedExpected).toEqual(sortedReceived);

  // Check for when we query the tree with a new object, that overlaps objRect
  // in the top-right sub-node.
  const obj3 = { id: 'rect3' };
  const objRect3 = new QuadtreeObjRect(6, 0, 4, 2, obj3);
  const check2Received = testQuadTree.retrieve(objRect3);
  const check2Expected = [objRect];
  expect(check2Received).toEqual(check2Expected);
});
