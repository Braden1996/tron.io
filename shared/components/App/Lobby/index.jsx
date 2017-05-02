import React from 'react';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import Link from 'react-router-dom/Link';

import { lobbyConnect } from '../../../state/lobby/actions';
import HostPanel from './host';


class Lobby extends React.Component {
  constructor(props) {
    super(props);
  }

  componentDidMount() {
    const lobbyKey = this.props.match.params.lobbykey;
    this.props.lobbyConnect(lobbyKey);
  }

  componentWillReceiveProps(nextProps) {
    // In the case where this component is mounted before our socket saga is
    // ready, our lobbyConnect dispatch will not be received.
    // We thus check to see if the socket saga 'ready' state has been enabled,
    // then dispatch a new lobbyConnect dispatch.
    const tryLobbyConnectAgain = !this.props.ready && nextProps.ready;

    const lobbyKey = this.props.match.params.lobbykey;
    const nextLobbyKey = nextProps.match.params.lobbykey;
    if (tryLobbyConnectAgain || lobbyKey !== nextLobbyKey) {
      this.props.lobbyConnect(nextLobbyKey);
    }
  }

  render() {
    const { meId, hostId, lobbyKey, gameState, connected } = this.props;

    const players = gameState.players;
    const isHost = meId === hostId;

    const plyList = players.map((ply, idx) =>
      <li key={ply.id}>
        {ply.name} { ply.id === hostId && <b>[HOST]</b> }
      </li>
    );

    return (
      <div>
        <h2>{lobbyKey}</h2>
        { connected ? 'Connected' : 'Connecting' }
        <figure>
          <figcaption>Players:</figcaption>
          <ol>{plyList}</ol>
          <p>To invite a friend, send them a copy of your url.</p>
        </figure>
        { isHost && <HostPanel gameState={gameState} /> }
      </div>
    )
  }
}

const mapStateToProps = (state) => {
  const sockets = state.get('sockets');
  const lobby = state.get('lobby');
  const me = lobby.get('me');
  const hostPlyId = lobby.get('host');

  return {
    meId: me.get('id'),
    hostId: hostPlyId,
    lobbyKey: lobby.get('key'),
    gameState: lobby.get('gameState'),
    connected: lobby.get('connected'),
    ready: sockets && sockets.get('receiveReady') && sockets.get('sendReady'),
  };
}

const mapDispatchToProps = (dispatch) => {
  return bindActionCreators({
    lobbyConnect: lobbyConnect,
  }, dispatch);
}

export default connect(mapStateToProps, mapDispatchToProps)(Lobby);
