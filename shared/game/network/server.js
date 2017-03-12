import gameLobby from './lobby';

export default class GameServer {
  constructor() {
    this.players = {};
    this.lobbies = {};
  }

  onConnect(plyId, socket) {
    this.players[plyId] = {
      id: plyId,
      socket: socket,
      lobby: null,
    }

    socket.on('disconnect', () => {
      this.onDisconnect(plyId);
    });

    socket.on('lobbyconnect', (data, ackFn) => {
      const { lobbyKey, name, color } = data;
      const playerData = { name, color };

      const ply = this.players[plyId];
      const lobby = ply.lobby;

      if (lobby === null) {
        this.joinLobby(plyId, lobbyKey, playerData);
      } else {
        this.leaveLobby(plyId, () => {
          this.joinLobby(plyId, lobbyKey, playerData);
        });
      }
    });
  }

  onDisconnect(plyId) {
    const ply = this.players[plyId];
    const lobby = ply.lobby;
    if (lobby !== null) {
      this.leaveLobby(plyId);
    }
    delete this.players[plyId];
  }

  // Abstract
  // This function should be overridden to allow for a platform dependent loop.
  createGame() {
    return { loop: null };
  }

  createLobby(lobbyKey) {
    const game = this.createGame();
    const lobby = new gameLobby(lobbyKey, game);
    lobby.start();
    return lobby;
  }

  leaveLobby(plyId, callback) {
    const ply = this.players[plyId];
    const lobby = ply.lobby;
    if (lobby !== null) {
      if (lobby.size() <= 1) {
        lobby.kill();
        delete this.lobbies[lobby.id];
      } else if (lobby.isMember(plyId)) {
        lobby.leave(plyId);
      }
      ply.lobby = null;

      if (typeof callback === 'function') {
        callback(true);
      }
    } else {
      callback(false);
    }
  }

  joinLobby(plyId, lobbyKey, playerData, callback) {
    const ply = this.players[plyId];
    const curLobby = ply.lobby;
    if (curLobby !== null) {
      throw new Error(`Player '${plyId}' trying to join lobby '${lobbyKey}', but is already in lobby '${curLobby.id}'.`);
    } else {
      const socket = ply.socket;

      let lobby = this.lobbies[lobbyKey];
      // Check if we need to create a new lobby.
      if (lobby === undefined) {
        lobby = this.createLobby(lobbyKey);
      } else if (lobby.isMember(plyId)) {
        throw new Error(`Player '${plyId}' trying to join lobby '${lobbyKey}', but is already a member.`);
      }

      this.lobbies[lobbyKey] = lobby;

      // Add player to lobby data-structures.
      ply.lobby = lobby;
      lobby.join(ply, playerData);

      if (typeof callback === 'function') {
        callback();
      }
    }
  }
}
