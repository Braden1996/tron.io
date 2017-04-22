import gameUpdate from '../../../shared/game/update';
import { rebuildCache } from '../../../shared/game/operations/general';

process.on('message', (m) => {
  const { state, stateIndex, progress } = m;

  rebuildCache(state);
  gameUpdate(state, progress);

  // Pass results back to parent process
  state.cache = {};
  const payload = { state, stateIndex };
  process.send(payload);
});
