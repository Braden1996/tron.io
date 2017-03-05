import { createStore, applyMiddleware, compose } from 'redux';
import createSagaMiddleware from 'redux-saga';

function configureStore(reducer, rootSaga, initialState) {
  const sagaMiddleware = createSagaMiddleware();

  const enhancers = compose(
    // Middleware store enhancer.
    applyMiddleware(
      sagaMiddleware
    ),
    // Redux Dev Tools store enhancer.
    // @see https://github.com/zalmoxisus/redux-devtools-extension
    // We only want this enhancer enabled for development and when in a browser
    // with the extension installed.
    process.env.BUILD_FLAG_IS_DEV
      && typeof window !== 'undefined'
      && typeof window.devToolsExtension !== 'undefined'
      // Call the brower extension function to create the enhancer.
      ? window.devToolsExtension()
      // Else we return a no-op function.
      : f => f,
  );

  const store = initialState
    ? createStore(reducer, initialState, enhancers)
    : createStore(reducer, enhancers);

  if (rootSaga) {
    sagaMiddleware.run(rootSaga);
  }

  if (process.env.BUILD_FLAG_IS_DEV && module.hot) {
    // Enable Webpack hot module replacement for reducers and sagas.T
    // his is so that we don't lose all of our current application state
    // during hot reloading.
    module.hot.accept('../state', () => {
      const nextRootReducer = require('../state').rootReducer; // eslint-disable-line global-require
      const nextRootSaga = require('../state').rootSaga; // eslint-disable-line global-require
      store.replaceReducer(nextRootReducer);
      sagaMiddleware.run(nextRootSaga);
    });
  }

  return store;
}

export default configureStore;
