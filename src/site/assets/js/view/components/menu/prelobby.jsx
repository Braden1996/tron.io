import React from "react";

export default class MenuPreLobby extends React.Component {
	constructor(props) {
		super(props);
		this.state = {
			speed: this.props.speed,
			name: "Player"
		};

		this.onSpeedChange = this.onSpeedChange.bind(this);
		this.onNameChange = this.onNameChange.bind(this);
		this.createLobby = this.createLobby.bind(this);
	}

	onSpeedChange(event) {
		this.setState({speed: event.target.value});
	}

	onNameChange(event) {
		this.setState({name: event.target.value});
	}

	createLobby(event) {
		this.props.createLobbyCallback(this.state.speed, this.state.name);
	}

	render() {
		return (
			<div>
				Speed:
				<input type="text" name="menu_speed" onChange={this.onSpeedChange} value={this.state.speed} /><br />
				Name:
				<input type="text" name="menu_myname" onChange={this.onNameChange} value={this.state.name} /><br />
				<button onClick={this.createLobby}>Create Lobby</button><br />
				<input type="text" name="menu_lobby_join" />
				<button>Join Lobby</button>
			</div>
		)
	}
}