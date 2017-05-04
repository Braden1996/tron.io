import GameLobby from './lobby';

export default class GameServer {
  constructor(lobbyDependencies, config) {
    this.players = {};
    this.lobbies = {};

    // Allows us to create lobbies with platform dependent configurations.
    this.lobbyDependencies = {
      createGameLoop: lobbyDependencies.createGameLoop,
      stateUpdateFork: lobbyDependencies.stateUpdateFork,
      aiMoveFork: lobbyDependencies.aiMoveFork,
    };

    // Config defaults
    this.config = {
      lobby: {
        stateHistoryLimit: 100,
      },
      ai: {
        maxDepth: 10,
        searchTime: 100,
      }
    };

    // Merge default config with parameter values.
    if (config.ai) {
    this.config.ai.maxDepth = config.ai.maxDepth === undefined
      ? this.config.ai.maxDepth
      : config.ai.maxDepth;

      this.config.ai.searchTime = config.ai.searchTime === undefined
        ? this.config.ai.searchTime
        : config.ai.searchTime;
    }
  }

  onConnect(plyId, socket) {
    this.players[plyId] = {
      id: plyId,
      socket,
      lobby: null,
    };

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

  createLobby(lobbyKey) {
    const lobby = new GameLobby(lobbyKey, this.lobbyDependencies, this.config);
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
