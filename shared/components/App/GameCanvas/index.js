import React from 'react';


class GameCanvas extends React.Component {
  constructor(props) {
    super(props);

    this.fixSize = this.fixSize.bind(this);
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
    this.props.gameloop.call('draw');
  }

  componentDidMount() {
    const canvas = this.refs.canvas;
    this.props.gameloop.setArgument('canvas', canvas);

    window.addEventListener('resize', this.fixSize, false);
    this.fixSize();

    this.props.gameloop.start();
  }

  componentWillUnmount() {
    window.removeEventListener('resize', this.fixSize, false);
    this.props.gameloop.stop();
  }

  render() {
    return <canvas ref="canvas" id="game__canvas" width="480" height="320" />;
  }
}

export default GameCanvas;
