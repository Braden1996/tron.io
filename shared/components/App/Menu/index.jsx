import React from 'react';
import Switch from 'react-router-dom/Switch';
import Route from 'react-router-dom/Route';

import MenuLobby from './MenuLobby';
import MenuPreLobby from './MenuPreLobby';

class Menu extends React.Component {
  constructor(props) {
    super(props);
  }

  render() {
    return (
      <div>
        <h1>Lobby</h1>
        {/* I cannot figure out how to use a JS condition inside a Switch. */}
        <Switch>
          <Route exact path="/:lobbykey" component={MenuLobby} />
          <Route path="/" component={MenuPreLobby}/>
        </Switch>
      </div>
    );
  }
}

export default Menu;
