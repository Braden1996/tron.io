import React from "react";
import { bindActionCreators } from "redux";
import { connect } from "react-redux";
import Redirect from 'react-router-dom/Redirect';

import {
  lobbySetName
} from "../../../state/lobby/actions";


class MenuPreLobby extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      connectRandomLobby: null
    };

    this.onNameChange = this.onNameChange.bind(this);
    this.createLobby = this.createLobby.bind(this);
  }

  onNameChange(event) {
    this.props.setName(event.target.value);
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

const mapStateToProps = (state) => {
  return {
    name: state.get('lobby').get('myName'),
  };
}

const mapDispatchToProps = (dispatch) => {
  return bindActionCreators({
    setName: lobbySetName,
  }, dispatch);
}

export default connect(mapStateToProps, mapDispatchToProps)(MenuPreLobby);
