import 'normalize.css/normalize.css';

import React from 'react';
import Route from 'react-router-dom/Route';
import Switch from 'react-router-dom/Switch';

import Lobby from './Lobby';
import Welcome from './Welcome';

import './globals.css';

import GameCanvas from './GameCanvas';

function App(props, context) {
  const gameloop = props.gameloop;
  return (
    <div>
      <GameCanvas gameloop={gameloop} />
      <section id="game__menu" className="menu">
        <h1>Tron</h1>
        <article className="menu__section" id="menuSection">
          <Switch>
            <Route exact path="/:lobbykey" component={Lobby} />
            <Route path="/" component={Welcome} />
          </Switch>
        </article>
      </section>
    </div>
  );
}

export default App;
