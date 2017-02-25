import React from "react";
import { connect } from "react-redux";
import MenuLobby from "./lobby.jsx";
import MenuPreLobby from "./prelobby.jsx";

import {createLobby, addPlayer} from "../../../game/state/actions/players.js";


export default class Menu extends React.Component {
	constructor(props) {
		super(props);
		this.state = {
			inLobby: false,
			code: undefined
		};

		this.startGame = this.startGame.bind(this);
		this.createLobby = this.createLobby.bind(this);
	}

	startGame() {
		this.props.tronStore.dispatch(START_GAME);
	}

	createLobby(speed, name) {
	 	this.props.tronStore.dispatch(createLobby(speed));
	 	this.props.tronStore.dispatch(addPlayer(name));

		this.setState({inLobby: true, code: "blahblah264276"});
	}

  	render() {
  		let lobby = null;
		if (this.state.inLobby) {
			lobby = <MenuLobby
				players={this.props.tronState.game.players}
				code={this.state.code}
				startGameCallback={this.startGame}
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