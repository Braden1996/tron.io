import {
  addPlayer as gameAddPlayer,
  removePlayer as gameRemovePlayer,
} from '../operations';

export default function detachPlayer(tronGame, plyId) {
  const socket = tronGame.playerSocket[plyId];

  socket.off('addcomputer');
}

export default function attachPlayer(tronGame, plyId) {
  const socket = tronGame.playerSocket[plyId];

  socket.on('addcomputer', (data, ackFn) => {
    const lobbyKey = io.tronGame.playerLobby[plyId];
    if (lobbyKey !== undefined) {
      const lobby = io.tronGame.lobbies[lobbyKey];
      gameAddPlayer(lobby.state, 'aUniqueID', 'Computer Player', '#0f0');
    }
  });
}
