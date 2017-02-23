import React from "react";
import MenuLobby from "./lobby.jsx";
import MenuPreLobby from "./prelobby.jsx";
import createGameState from "../../../game/state/game.js";

export default class Menu extends React.Component {
	constructor(props) {
		super(props);
		this.state = {
			inLobby: this.props.tronState.game !== undefined,
			code: undefined
		};

		this.createLobby = this.createLobby.bind(this);
		this.beginGame = this.beginGame.bind(this);
	}

	beginGame() {
    	this.props.tronState.game.started = true;
	}

	createLobby(speed, name) {
		this.props.tronState.config.speed = speed;
		this.props.tronState.game = createGameState(this.props.tronState.config);
	 	this.props.tronState.game.players[0].name = name;

		this.setState({inLobby: true, code: "blahblah264276"});
	}

  	render() {
  		let lobby = null;
		if (this.state.inLobby) {
			lobby = <MenuLobby
				players={this.props.tronState.game.players}
				code={this.state.code}
				beginGameCallback={this.beginGame}
			/>;
		} else {
			lobby = <MenuPreLobby
				tronState={this.props.tronState}
				speed={this.props.tronState.config.speed}
				createLobbyCallback={this.createLobby}
			/>;
		}

		return (
	    	<div>
		    	<h1>Lobby</h1>
		    	{lobby}
			</div>
	    )
  }
}