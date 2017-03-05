import 'normalize.css/normalize.css';

import React from 'react';

import './globals.css';

import GameCanvas from './GameCanvas';
import Menu from './Menu';

function App(props, context) {
  const gameloop = props.gameloop;
  return (
    <div>
      <GameCanvas gameloop={gameloop} />
      <section id="game__menu" className="menu">
        <h1>Tron</h1>
        <article className="menu__section" id="menuSection">
          <Menu />
        </article>
      </section>
    </div>
  );
}

export default App;
