import { apply, compare } from 'fast-json-patch';

export function applySnapshot(state, snapshot) {
  apply(state, snapshot);
}

export function getSnapshot(oldState, newState) {
  return compare(oldState, newState)
    .filter(diff => diff.path !== '/tick');  // Ignore tick (state id).
}
