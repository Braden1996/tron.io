import React from "react";
import { bindActionCreators } from "redux";
import { connect } from "react-redux";
import MenuLobby from "./lobby.jsx";
import MenuPreLobby from "./prelobby.jsx";

import {
  updateStartGame,
  updateFinishGame,
  updateSpeed
} from "../../../game/state/actions/game.js";
import {
  addPlayer,
  resetPlayers
} from "../../../game/state/actions/players.js";


class Menu extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      computerPlayers: 0
    }
  }

  onStartGame() {
    this.props.startGame(true);
    this.props.finishGame(false);
  }

  onEndGame() {
    this.props.startGame(false);
    this.props.resetPlayers();
  }

  onAddComputer() {
    const computerPlayers = this.state.computerPlayers + 1;
    this.props.addPlayer(`Computer ${computerPlayers}`);
    this.setState({computerPlayers});
  }

  onCreateLobby(speed, name) {
    this.props.updateSpeed(speed);
    this.props.addPlayer(name);
  }

  render() {
    let lobby = null;
    if (this.props.players.size > 0) {
      lobby = <MenuLobby
        started={this.props.started}
        players={this.props.players}
        code={"blahblah264276"}
        onStartGame={this.onStartGame.bind(this)}
        onEndGame={this.onEndGame.bind(this)}
        onAddComputer={this.onAddComputer.bind(this)}
      />;
    } else {
      lobby = <MenuPreLobby
        speed={this.props.speed}
        onCreateLobby={this.onCreateLobby.bind(this)}
      />;
    }

    return (
      <div>
        <h1>Lobby</h1>
        {lobby}
      </div>
    );
  }
}

const mapStateToProps = (state) => {
  return {
    started: state.game.get("started"),
    finished: state.game.get("finished"),
    arenaSize: state.game.get("arenaSize"),
    playerSize: state.game.get("playerSize"),
    speed: state.game.get("speed"),
    players: state.players
  };
}

const mapDispatchToProps = (dispatch) => {
  return bindActionCreators({
    startGame: updateStartGame,
    finishGame: updateFinishGame,
    updateSpeed: updateSpeed,
    addPlayer: addPlayer,
    resetPlayers: resetPlayers
  }, dispatch);
}

export default connect(mapStateToProps, mapDispatchToProps)(Menu);
