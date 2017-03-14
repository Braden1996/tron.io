import { apply, compare } from 'fast-json-patch';

export function applySnapshot(state, snapshot) {
  apply(state, snapshot);
}

export function getSnapshot(oldState, newState) {
  // Sending snapshots of the same tick can cause big problems! This is due to
  // us processing/applying player input outside of the gameloop.
  return oldState.tick === newState.tick ? [] : compare(oldState, newState);
}

export function shouldSendSnapshot(snapshot) {
  const notImportant = snapshot.filter((diff) => {
    return diff.path === '/tick' || diff.path === '/progress';
  });
  const allNotImportant = notImportant.length === snapshot.length;
  return snapshot && snapshot.length > 0 && !allNotImportant;
}
