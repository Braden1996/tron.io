import React from "react";

export default class MenuLobby extends React.Component {
	constructor(props) {
		super(props);
		this.state = {
			players: this.props.players,
		};

		this.beginGame = this.beginGame.bind(this);
	}

	beginGame(event) {
		this.props.beginGameCallback();
	}

	render() {
		// TODO: make into a player ID for networking.
		const plyList = this.state.players.map((ply, idx) =>
			<li key={idx}>
				Computer
			</li>
		);

		return (
			<div>
				Lobby code: <input type="text" name="menu_lobby_code" value={this.props.code} disabled />
				<figure>
				  <figcaption>Players:</figcaption>
				  <ol>{plyList}</ol>
				</figure>
				<button id="menu__addcomputerplayer">Add computer player</button><br />
				<button id="menu__begingame" onClick={this.beginGame}>Begin Game</button>
			</div>
		)
	}
}