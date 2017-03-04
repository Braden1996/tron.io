import React from "react";
import { Match, Link } from 'react-router';
import { CodeSplit } from 'code-split-component';

class Menu extends React.Component {
  constructor(props) {
    super(props);
  }

  render() {
    return (
      <div>
        <h1>Lobby</h1>
        <Match
          exactly
          pattern="/"
          render={routerProps =>
            <CodeSplit chunkName="menuprelobby" modules={{ MenuPreLobby: require('./MenuPreLobby') }}>
              { ({ MenuPreLobby }) => {
                if (MenuPreLobby) {
                  return <MenuPreLobby
                    {...routerProps}
                  />
                }
              }}
            </CodeSplit>
          }
        />

        <Match
          pattern="/:lobbykey"
          render={routerProps =>
            <CodeSplit chunkName="MenuLobby" modules={{ MenuLobby: require('./MenuLobby') }}>
              { ({ MenuLobby }) => {
                if (MenuLobby) {
                  return <MenuLobby lobbyKey={routerProps.params.lobbykey} />
                }
              }}
            </CodeSplit>
          }
        />
      </div>
    );
  }
}

export default Menu;
