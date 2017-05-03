import React from 'react';
import { connect } from 'react-redux';

import config from '../../../../config';

// It would be ideal to have this exist only within client :L
import gameDraw from '../../../../client/game/draw';
import ClientGameLoop from '../../../../client/game/gameloop';

import gameUpdate from '../../../game/update';


class GameCanvas extends React.Component {
  constructor(props) {
    super(props);

    this.gameLoop = null;
    this.debugMode = config('tron.debugDraw');
  }

  fixSize() {
    const canvas = this.refs.canvas;
    if (window.innerWidth > window.innerHeight) {
      canvas.width = window.innerHeight;
      canvas.height = window.innerHeight;
    } else {
      canvas.width = window.innerWidth;
      canvas.height = window.innerWidth;
    }

    // Redraw
    const state = this.props.gameState;
    gameDraw(state, canvas, this.debugMode);
  }

  // The component will only be able to mount on the client, so this shouldn't
  // interfere with server-side rendering.
  componentDidMount() {
    // Create and configure our game's loop.
    const gameLoopFn = (progress) => {
      const state = this.props.gameState;
      const canvas = this.refs.canvas;

      gameUpdate(state, progress);
      gameDraw(state, canvas, this.debugMode);
    };
    this.gameLoop = new ClientGameLoop(gameLoopFn, 15);

    window.addEventListener('resize', this.fixSize.bind(this), false);
    this.fixSize();

    this.gameLoop.start();
  }

  componentWillUnmount() {
    window.removeEventListener('resize', this.fixSize.bind(this), false);
    this.gameLoop.stop();
    this.gameLoop
  }

  render() {
    return <canvas ref="canvas" id="game__canvas" width="480" height="320" />;
  }
}

const mapStateToProps = (state) => {
  return {
    gameState: state.get('lobby').get('gameState'),
  };
}

export default connect(mapStateToProps)(GameCanvas);
