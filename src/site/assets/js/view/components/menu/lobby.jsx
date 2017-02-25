import React from "react";


export default class MenuLobby extends React.Component {
	constructor(props) {
		super(props);
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
				Lobby code: <input type="text" name="menu_lobby_code" value={this.props.code} disabled />
				<figure>
				  <figcaption>Players:</figcaption>
				  <ol>{plyList}</ol>
				</figure>
				<button>Add computer player</button><br />
				{beginButton}
			</div>
		)
	}
}