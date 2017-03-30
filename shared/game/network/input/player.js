import {
  directPlayer as gameDirectPlayer,
} from '../../operations/player';


export function directPlayer(lobby, ply, data) {
  const inDirection = data;

  const applyMoveFn = (state) => {
    const gamePly = state.players.find(gPly => gPly.id === ply.id);

    // Check if player is alive.
    if (gamePly.alive) {
      const plySize = state.playerSize;
      try {
        gameDirectPlayer(state, gamePly, inDirection);
      } catch(e) {};
    }
  };

  lobby.lagCompensation(ply, applyMoveFn);
}

export function playerDetachPlayer(lobby, ply) {
  const socket = ply.socket;

  socket.removeAllListeners('directplayer');
}

export function playerAttachPlayer(lobby, ply) {
  const socket = ply.socket;

  socket.on('directplayer', (data, ack) => { directPlayer(lobby, ply, data); });
}
