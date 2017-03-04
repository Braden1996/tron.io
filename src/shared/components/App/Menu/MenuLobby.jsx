import React from "react";
import { bindActionCreators } from "redux";
import { connect } from "react-redux";
import { Link } from 'react-router';

import {
  updateLobbyConnect
} from "../../../actions/gamelobby.js";


class MenuLobby extends React.Component {
  constructor(props) {
    super(props);
  }

  componentDidMount() {
    console.log(`Component mount init Lobby connect: ${this.props.lobbyKey}`);
    this.props.updateLobbyConnect(this.props.lobbyKey);
  }

  componentWillReceiveProps(nextProps) {
    if (nextProps.lobbyKey !== this.props.lobbyKey) {
      console.log(`Component lobby key changed: ${nextProps.lobbyKey}`);
      this.props.updateLobbyConnect(nextProps.lobbyKey);
    }
  }

  render() {
    const plyList = this.props.players.map((ply, idx) =>
      <li key={ply.get("id")}>
        {ply.get("name")}
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
        <figure>
          <figcaption>Players:</figcaption>
          <ol>{plyList}</ol>
          <p>To invite a friend, send them a copy of your url.</p>
        </figure>
        {!this.props.started && this.props.players.size < 16 &&
          <button onClick={this.props.onAddComputer}>Add computer player</button>
        }
        {beginButton}
      </div>
    )
  }
}

const mapStateToProps = (state) => {
  return {
    players: state.players
  };
}

const mapDispatchToProps = (dispatch) => {
  return bindActionCreators({
    updateLobbyConnect: updateLobbyConnect
  }, dispatch);
}

export default connect(mapStateToProps, mapDispatchToProps)(MenuLobby);
