import inputKeyboardSaga from './keyboard/sagas';
import inputHostSaga from './host/sagas';
import inputPlayerSaga from './player/sagas';

export default function* inputSaga() {
  yield [
    inputKeyboardSaga(),
    inputHostSaga(),
    inputPlayerSaga(),
  ]
}
