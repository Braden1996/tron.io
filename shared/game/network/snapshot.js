import { apply, compare } from 'fast-json-patch';

export function applySnapshot(state, snapshot) {
  apply(state, snapshot);
  return state;
}

export function getSnapshot(oldState, newState) {
  // Sending snapshots of the same tick can cause big problems! This is due to
  // us processing/applying player input outside of the gameloop.
  if ( oldState.tick === newState.tick) {
    return [];
  }

  const snapshot = compare(oldState, newState);
  return snapshot.filter(diff => diff.path.indexOf("/cache/") !== 0);
}

export function shouldSendSnapshot(snapshot) {
  const notImportant = snapshot.filter(diff =>
    diff.path === '/tick' || diff.path === '/progress'
  );
  const allNotImportant = notImportant.length === snapshot.length;
  return snapshot && snapshot.length > 0 && !allNotImportant;
}
