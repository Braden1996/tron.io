import express from 'express';
import socketio from 'socket.io';
import http from 'http';

import gameUpdate from '../shared/game/update';
import {
  getInitialState as gameGetInitialState,
  addPlayer as gameAddPlayer,
  removePlayer as gameRemovePlayer,
} from '../shared/game/operations';
import gameLobby from '../shared/game/network/server';

import NodeGameLoop from './game/gameloop';

function leaveLobby(socket, callback) {
  const io = socket.server;
  const { lobbies, playerLobby } = io.tronGame;

  const plyId = socket.id;

  const lobbyKey = playerLobby[plyId];
  if (lobbyKey !== undefined) {
    const lobby = lobbies[lobbyKey];
    const leaveDataStructures = () => {
      if (lobby.size() === 1) {
        lobby.kill();
        delete lobbies[lobbyKey];
      } else {
        lobby.leave(plyId);
      }
      delete playerLobby[plyId];
    }

    if (socket.connected) {
      socket.leave(oldLobbyKey, (err) => { leaveDataStructures(); });
    } else {
      leaveDataStructures();
    }
  }
}

function joinLobby(socket, lobbyKey, playerData) {
  const io = socket.server;
  const { lobbies, playerLobby, playerSocket } = io.tronGame;

  const plyId = socket.id;

  const curLobby = playerLobby[plyId];
  if (curLobby !== undefined) {
    throw new Error(`Player '${plyId}' trying to join lobby '${lobbyKey}', but is already in lobby '${curLobby}'.`);
  } else {
    socket.join(lobbyKey, (err) => {
      let lobby = lobbies[lobbyKey];
      // Check if we need to create a new lobby.
      if (lobby === undefined) {
        const state = gameGetInitialState();
        const gameLoop = new NodeGameLoop(15);
        gameLoop.setArgument('state', state);
        gameLoop.subscribe(gameUpdate, ['state', 'progress']);

        lobby = new gameLobby(state);

        lobby.sendFullState = function(plyId, fullState, bindedAckCallback) {
          const socket = playerSocket[plyId];
          socket.emit('fullstate', { lobbyKey, fullState }, bindedAckCallback);
        }

        lobby.sendSnapshot = function(plyId, snapshot, bindedAckCallback) {
          const socket = playerSocket[plyId];
          socket.emit('snapshot', snapshot, bindedAckCallback);
        }

        const oldKill = lobby.kill.bind(lobby);
        lobby.kill = function() { oldKill(); gameLoop.stop(); };

        const oldLeave = lobby.leave.bind(lobby);
        lobby.leave = function(plyId) {
          oldLeave(plyId);
          gameRemovePlayer(this.state, plyId);
        };
        lobby.leave.bind(lobby);

        lobbies[lobbyKey] = lobby;

        // Attach our lobby to the gameloop, so it can make use of the ticks.
        gameLoop.subscribe(lobby.onTick.bind(lobby));
        gameLoop.start();  // Kick-off our game loop!

      } else if (lobby.isMember(plyId)) {
        throw new Error(`Player '${plyId}' trying to join lobby '${lobbyKey}', but is already a member.`);
      }

      // Add player to game state data-structures.
      const { name, color } = playerData;
      gameAddPlayer(lobby.state, plyId, name, color);

      // Add player to lobby data-structures.
      lobby.join(plyId);
      playerLobby[plyId] = lobbyKey;
    });
  }
}

export default function socketsInit(app) {
  const server = http.createServer(app);
  const io = socketio(server);

  // Maintain two data-structures for speed.
  io.tronGame = {
    lobbies: {},  // Map: lobbyKey -> [Lobby]
    playerLobby: {},  // Map: plyId -> lobbyKey
    playerSocket: {},  // Map: plyId -> socket
  };

  io.on('connection', (socket) => {
    const plyId = socket.id;
    io.tronGame.playerSocket[plyId] = socket;

    socket.on('disconnect', () => {
      leaveLobby(socket);
      delete io.tronGame.playerSocket[plyId];
    });

    socket.on('lobbyconnect', (data, ackFn) => {
      const { lobbyKey, name, color } = data;
      const playerData = { name, color };

      const lobby = io.tronGame.playerLobby[plyId];

      if (lobby !== undefined) {
        leaveLobby(socket, () => {
          joinLobby(socket, lobbyKey, playerData);
        });
      } else {
        joinLobby(socket, lobbyKey, playerData);
      }
    });
  });

  return server;
}
