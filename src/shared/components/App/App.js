import 'normalize.css/normalize.css';
import React from 'react';
import Helmet from 'react-helmet';
import { safeConfigGet } from '../../utils/config';
import './globals.css';
import GameCanvas from './GameCanvas';
import Menu from './Menu';

function App(props) {
  const gameloop = props.gameloop;
  return (
    <div>
      {/*
        All of the following will be injected into our page header.
        @see https://github.com/nfl/react-helmet
      */}
      <Helmet
        htmlAttributes={safeConfigGet(['htmlPage', 'htmlAttributes'])}
        titleTemplate={safeConfigGet(['htmlPage', 'titleTemplate'])}
        defaultTitle={safeConfigGet(['htmlPage', 'defaultTitle'])}
        meta={safeConfigGet(['htmlPage', 'meta'])}
        link={safeConfigGet(['htmlPage', 'links'])}
        script={safeConfigGet(['htmlPage', 'scripts'])}
      />

      <GameCanvas gameloop={gameloop} />
      <section id="game__menu" className="menu">
        <h1>Tron</h1>
        <article className="menu__section" id="menuSection">
          <Menu />
        </article>
      </section>

      {/*
      <Miss component={Error404} />
      */}
    </div>
  );
}

export default App;
