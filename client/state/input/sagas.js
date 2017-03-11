import inputHostSaga from './host/sagas';

export default function* inputSaga() {
  yield [
    inputHostSaga(),
  ]
}
