import React from 'react';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import Tooltip from 'rc-tooltip';
import Slider, { Range } from 'rc-slider';
import 'rc-slider/assets/index.css';

import {
  addComputer,
  beginGame,
  endGame,
  updateSpeed,
  updateArenaSize,
} from '../../../../state/input/host/actions';

const createSliderWithTooltip = Slider.createSliderWithTooltip;

const Handle = Slider.Handle;

const handle = (props) => {
  const { value, dragging, index, ...restProps } = props;
  return (
    <Tooltip
      prefixCls="rc-slider-tooltip"
      overlay={value}
      visible={dragging}
      placement="top"
      key={index}
    >
      <Handle {...restProps} />
    </Tooltip>
  );
};

class HostPanel extends React.Component {
  render() {
    const gameState = this.props.gameState;
    const gameStarted = gameState.started;
    const arenaSize = gameState.arenaSize;
    const playerSpeed = gameState.speed;
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
        <div>
          Player Speed:
          <Slider
            min={0.001} max={0.075} step={0.001} defaultValue={playerSpeed}
            handle={handle} onAfterChange={this.props.updateSpeed}
          />
          <br />
        </div>
        {!gameStarted &&
          <div>
            Arena Size:
            <Slider
              min={16} max={128} step={2} defaultValue={arenaSize}
              handle={handle} onAfterChange={this.props.updateArenaSize}
            />
            <br />
          </div>
        }
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
  updateSpeed,
  updateArenaSize,
}, dispatch);

export default connect(undefined, mapDispatchToProps)(HostPanel);
