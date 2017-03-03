/* eslint-disable global-require */

import React from 'react';
import { render } from 'react-dom';
import { BrowserRouter } from 'react-router';
import { CodeSplitProvider, rehydrateState } from 'code-split-component';
import { Provider as ReduxProvider } from 'react-redux';
import transit from 'transit-immutable-js';
import configureStore from '../shared/redux/configureStore';
import ReactHotLoader from './components/ReactHotLoader';
import gameDraw from './game/draw';
import gameAttachInput from './game/input';
import gameUpdate from '../shared/game/update';
import GameLoop from '../shared/game/gameloop';
import App from '../shared/components/App';

// Get the DOM Element that will host our React application.
const container = document.querySelector('#app');

// Create our Redux store.
const store = configureStore(
  // Server side rendering would have mounted our state on this global.
  transit.fromJSON(window.__APP_STATE__), // eslint-disable-line no-underscore-dangle
);

gameAttachInput(store);

let gameDrawFunc = gameDraw;
if (process.env.NODE_ENV === 'development') {
  const gameDrawDebug = require('./game/drawdebug').default;
  gameDrawFunc = (s, c) => {gameDraw(s, c); gameDrawDebug(s, c)};
}

const mainLoop = new GameLoop();
mainLoop.setArgument('store', store);
mainLoop.subscribe(gameUpdate, ['store', 'progress']);
mainLoop.subscribe(gameDrawFunc, ['store', 'canvas'], 'draw');

function renderApp(TheApp) {
  // We use the code-split-component library to provide us with code splitting
  // within our application.  This library supports server rendered applications,
  // but for server rendered applications it requires that we rehydrate any
  // code split modules that may have been rendered for a request.  We use
  // the provided helper and then pass the result to the CodeSplitProvider
  // instance which takes care of the rest for us.  This is really important
  // to do as it will ensure that our React checksum for the client will match
  // the content returned by the server.
  // @see https://github.com/ctrlplusb/code-split-component
  rehydrateState().then(codeSplitState =>
    render(
      <ReactHotLoader>
        <CodeSplitProvider state={codeSplitState}>
          <ReduxProvider store={store}>
            <BrowserRouter>
              <TheApp gameloop={mainLoop} />
            </BrowserRouter>
          </ReduxProvider>
        </CodeSplitProvider>
      </ReactHotLoader>,
      container,
    ),
  );
}

// The following is needed so that we can support hot reloading our application.
if (process.env.NODE_ENV === 'development' && module.hot) {
  // Accept changes to this file for hot reloading.
  module.hot.accept('./index.js');
  // Any changes to our App will cause a hotload re-render.
  module.hot.accept(
    '../shared/components/App',
    () => renderApp(require('../shared/components/App').default),
  );
}

// Execute the first render of our app.
renderApp(App);

// This registers our service worker for asset caching and offline support.
// Keep this as the last item, just in case the code execution failed (thanks
// to react-boilerplate for that tip.)
require('./registerServiceWorker');
