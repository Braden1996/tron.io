import React from 'react';
import Helmet from 'react-helmet';
import { renderToString, renderToStaticMarkup } from 'react-dom/server';
import { StaticRouter } from 'react-router-dom';
import { withAsyncComponents } from 'react-async-component';
import { Provider as ReduxProvider } from 'react-redux';
import transit from 'transit-immutable-js';

import config from '../../../config';
import { rootReducer, rootSaga } from '../../../shared/state';
import configureStore from '../../../shared/state/configureStore';

import ServerHTML from './ServerHTML';
import App from '../../../shared/components/App';

/**
 * React application middleware, supports server side rendering.
 */
export default function reactApplicationMiddleware(request, response) {
  // Ensure a nonce has been provided to us.
  // See the server/middleware/security.js for more info.
  if (typeof response.locals.nonce !== 'string') {
    throw new Error('A "nonce" value has not been attached to the response');
  }
  const nonce = response.locals.nonce;

  // It's possible to disable SSR, which can be useful in development mode.
  // In this case traditional client side only rendering will occur.
  if (config('disableSSR')) {
    if (process.env.BUILD_FLAG_IS_DEV) {
      // eslint-disable-next-line no-console
      console.log('==> Handling react route without SSR');
    }
    // SSR is disabled so we will return an "empty" html page and
    // rely on the client to initialize and render the react application.
    const html = renderToStaticMarkup(<ServerHTML nonce={nonce} />);
    response.status(200).send(html);
    return;
  }

  // First create a context for <StaticRouter>, which will allow us to
  // query for the results of the render.
  const reactRouterContext = {};

  // Create the redux store.
  const store = configureStore(rootReducer, rootSaga);
  const { getState } = store;

  // Declare our React application.
  const app = (
    <StaticRouter location={request.url} context={reactRouterContext}>
      <ReduxProvider store={store}>
        <App />
      </ReduxProvider>
    </StaticRouter>
  );

  // Pass our app into the react-async-component helper so that any async
  // components are resolved for the render.
  withAsyncComponents(app).then(({ appWithAsyncComponents, state, STATE_IDENTIFIER }) => {
    // Generate the html response.
    const html = renderToStaticMarkup(
      <ServerHTML
        reactAppString={renderToString(appWithAsyncComponents)}
        nonce={nonce}
        helmet={Helmet.rewind()}
        asyncComponents={{ state, STATE_IDENTIFIER }}
        // Provide the redux store state, this will be bound to the
        // window.__APP_STATE__ so that we can rehydrate the state on the client.
        initialState={transit.toJSON(getState())}
      />,
    );

    // Check if the router context contains a redirect, if so we need to set
    // the specific status and redirect header and end the response.
    if (reactRouterContext.url) {
      response.status(302).setHeader('Location', reactRouterContext.url);
      response.end();
      return;
    }

    response
      .status(
        reactRouterContext.missed
          // If the renderResult contains a "missed" match then we set a 404 code.
          // Our App component will handle the rendering of an Error404 view.
          ? 404
          // Otherwise everything is all good and we send a 200 OK status.
          : 200,
      )
      .send(`<!DOCTYPE html>${html}`);
  });
}
