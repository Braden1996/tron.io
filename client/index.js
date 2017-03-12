/* eslint-disable global-require */

import React from 'react';
import { render } from 'react-dom';
import { Provider as ReduxProvider } from 'react-redux';
import BrowserRouter from 'react-router-dom/BrowserRouter';
import { withAsyncComponents } from 'react-async-component';
import transit from 'transit-immutable-js';

import './polyfills';
import { rootReducer, rootSaga } from './state';
import gameDraw from './game/draw';
import ClientGameLoop from './game/gameloop';

import App from '../shared/components/App';
import configureStore from '../shared/state/configureStore';
import gameUpdate from '../shared/game/update';

// Create our Redux store.
// Server side rendering would have mounted our state on this global.
const appState = window.__APP_STATE__; // eslint-disable-line no-underscore-dangle
const initialState = appState ? transit.fromJSON(appState) : undefined;
const store = configureStore(rootReducer, rootSaga, initialState);

// Setup the draw function for our game.
// Enable 'debug' features if the dev build flag is set.
let gameDrawFunc = gameDraw;
if (process.env.BUILD_FLAG_IS_DEV) {
  const gameDrawDebug = require('./game/drawdebug').default;
  gameDrawFunc = (s, c) => { gameDraw(s, c); gameDrawDebug(s, c); };
}

// Get game state directly from store at each tick.
const getState = () => store.getState().get('lobby').get('gameState');
const gameUpdateFunc = (p) => { gameUpdate(getState(), p); };
const gameDrawFunc2 = (c) => { gameDrawFunc(getState(), c); };

// Get the DOM Element that will host our React application.
const container = document.querySelector('#app');

// Does the user's browser support the HTML5 history API?
const supportsHistory = 'pushState' in window.history;

/**
 * Renders the given React Application component.
 */
function renderApp(TheApp) {
  // Create and configure our game loop object.
  const mainLoop = new ClientGameLoop(15);
  mainLoop.subscribe(gameUpdateFunc, ['progress']);
  mainLoop.subscribe(gameDrawFunc2, ['canvas'], 'draw');

  // Firstly, define our full application component, wrapping the given
  // component app with a browser based version of react router.
  const app = (
    // If the user's browser doesn't support the HTML5 history API then we
    // will force full page refreshes on each page change.
    <ReduxProvider store={store}>
      <BrowserRouter forceRefresh={!supportsHistory}>
          <TheApp gameloop={mainLoop} />
      </BrowserRouter>
    </ReduxProvider>
  );

  // We use the react-async-component in order to support code splitting of
  // our bundle output. It's important to use this helper.
  // @see https://github.com/ctrlplusb/react-async-component
  withAsyncComponents(app).then(({ appWithAsyncComponents }) =>
    render(appWithAsyncComponents, container),
  );
}

// Execute the first render of our app.
renderApp(App);

// This registers our service worker for asset caching and offline support.
// Keep this as the last item, just in case the code execution failed (thanks
// to react-boilerplate for that tip.)
require('./registerServiceWorker');

// The following is needed so that we can support hot reloading our application.
if (process.env.BUILD_FLAG_IS_DEV && module.hot) {
  // Accept changes to this file for hot reloading.
  module.hot.accept('./index.js');
  // Any changes to our App will cause a hotload re-render.
  module.hot.accept(
    '../shared/components/App',
    () => renderApp(require('../shared/components/App').default),
  );
}
