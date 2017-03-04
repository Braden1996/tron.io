import React from "react";
import { Redirect } from 'react-router';


export default class MenuPreLobby extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      name: "Player",
      connectRandomLobby: null
    };

    this.onNameChange = this.onNameChange.bind(this);
    this.createLobby = this.createLobby.bind(this);
  }

  onNameChange(event) {
    this.setState({name: event.target.value});
  }

  createLobby(event) {
    this.setState({connectRandomLobby: "RandomLobbyString"});
  }

  render() {
    return (
      <div>
        {this.state.connectRandomLobby !== null &&
          <Redirect to={{pathname: this.state.connectRandomLobby}} push />
        }

        <h2>Welcome to Tron!</h2>
        <p>If you're looking to start a new game, just append a unique server name to the url - or click the button below!</p>
        <br />
        Name:
        <input type="text" name="menu_myname" onChange={this.onNameChange} value={this.state.name} /><br />
        <button onClick={this.createLobby}>Create Lobby</button><br />
      </div>
    )
  }
}
