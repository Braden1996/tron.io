import React from 'react';
import Switch from 'react-router-dom/Switch';
import Route from 'react-router-dom/Route';

// import Error404 from './Error404';
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
        <Switch>
          <Route exact path="/" component={MenuPreLobby}/>
          <Route exactly path="/:lobbykey" component={MenuLobby}/>
          {/*<Route component={Error404} />*/}
        </Switch>
      </div>
    );
  }
}

export default Menu;
