import React from "react";
import { bindActionCreators } from "redux";
import { connect } from "react-redux";
import Link from 'react-router-dom/Link';

import { lobbyConnect } from "../../../state/lobby/actions";
import { addComputer } from "../../../state/input/actions";


class MenuLobby extends React.Component {
  constructor(props) {
    super(props);
  }

  componentDidMount() {
    const lobbyKey = this.props.match.params.lobbykey;
    this.props.lobbyConnect(lobbyKey, 'Player Name', '#0f0');
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
      this.props.lobbyConnect(nextLobbyKey, 'Player Name', '#0f0');
    }
  }

  render() {
    const plyList = this.props.players.map((ply, idx) =>
      <li key={ply.id}>
        {ply.name}
      </li>
    );

    let beginButton;
    if (this.props.started) {
      beginButton = (
        <button onClick={this.props.onEndGame}>
          {"End"} Game
        </button>
      )
    } else {
      beginButton = (
        <button onClick={this.props.onStartGame}>
          {"Begin"} Game
        </button>
      )
    }

    return (
      <div>
        <h2>{this.props.lobbyKey}</h2>
        { this.props.lobbyConnected ? "Connected" : "Connecting" }
        <figure>
          <figcaption>Players:</figcaption>
          <ol>{plyList}</ol>
          <p>To invite a friend, send them a copy of your url.</p>
        </figure>
        {!this.props.started && this.props.players.length < 16 &&
          <button onClick={this.props.addComputer}>Add computer player</button>
        }
        {beginButton}
      </div>
    )
  }
}

const mapStateToProps = (state) => {
  const sockets = state.get('sockets');
  const gameState = state.get('lobby').get('gameState');
  return {
    players: gameState ? gameState.players : [],
    lobbyConnected: state.get('lobby').get('connected'),
    ready: sockets && sockets.get('receiveReady') && sockets.get('sendReady'),
  };
}

const mapDispatchToProps = (dispatch) => {
  return bindActionCreators({
    lobbyConnect: lobbyConnect,
    addComputer: addComputer,
  }, dispatch);
}

export default connect(mapStateToProps, mapDispatchToProps)(MenuLobby);
