import React from 'react';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';

import {
  addComputer,
  beginGame,
  endGame,
} from '../../../../state/input/host/actions';


class HostPanel extends React.Component {
  render() {
    const gameState = this.props.gameState;
    const gameStarted = gameState.started;
    const playerLength = gameState.players.length;

    let beginButton;
    if (gameStarted) {
      beginButton = (
        <button onClick={this.props.endGame}>
          {'End'} Game
        </button>
      );
    } else {
      beginButton = (
        <button onClick={this.props.beginGame}>
          {'Begin'} Game
        </button>
      );
    }

    return (
      <section>
        {!gameStarted && playerLength < 16 &&
          <button onClick={this.props.addComputer}>Add computer player</button>
        }
        {beginButton}
      </section>
    );
  }
}

const mapDispatchToProps = dispatch => bindActionCreators({
  addComputer,
  beginGame,
  endGame,
}, dispatch);

export default connect(undefined, mapDispatchToProps)(HostPanel);
