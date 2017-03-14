import {
  updatePlayerDirection as gameUpdatePlayerDirection,
} from '../../operations';


export function movePlayer(lobby, ply, data) {
  const inDirection = data;

  const applyMoveFn = (state) => {
    const gamePly = state.players.find(gPly => gPly.id === ply.id);
    const plySize = state.playerSize;
    gameUpdatePlayerDirection(gamePly, plySize, inDirection);
  };

  lobby.lagCompensation(ply, applyMoveFn);
}

export function playerDetachPlayer(lobby, ply) {
  const socket = ply.socket;

  socket.removeAllListeners('moveplayer');
}

export function playerAttachPlayer(lobby, ply) {
  const socket = ply.socket;
  const state = lobby.game.state;

  socket.on('moveplayer', (data, ack) => { movePlayer(lobby, ply, data); });
}
