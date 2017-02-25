import React from "react";


export default class MenuLobby extends React.Component {
	constructor(props) {
		super(props);
		this.state = {
			players: this.props.players,
			gameStarted: false
		};

		this.beginGame = this.beginGame.bind(this);
	}

	startGame(event) {
		this.props.startGameCallback();
		this.setState({gameStarted: true});
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
				<button>Add computer player</button><br />
				<button onClick={this.startGame}>
					{this.state.gameStarted ? "Restart" : "Begin"} Game
				</button>
			</div>
		)
	}
}