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
  // Ignore tick (state id).
  const onlyTick = snapshot.length === 1 && snapshot[0].path === '/tick';
  return snapshot && snapshot.length > 0 && !onlyTick;
}
