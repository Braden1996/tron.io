import express from 'express';
import socketio from 'socket.io';
import http from 'http';

import {
  getInitialState,
  resetPlayers,
  addPlayer,
} from '../shared/game/operations';

import getSpawn from '../shared/game/utils/spawn';


function leaveLobbyDataStructures(socket, oldLobbyKey = undefined) {
  const io = socket.server;
  const { lobbyPlayers, playerLobby } = io.tronGame;

  if (oldLobbyKey === undefined) {
    oldLobbyKey = playerLobby[socket.id];
  }

  if (oldLobbyKey !== undefined) {
    if (lobbyPlayers[oldLobbyKey].length === 1) {
      delete lobbyPlayers[oldLobbyKey];
    } else {
      const idx = lobbyPlayers[oldLobbyKey].indexOf(socket);
      if (idx !== -1) {
        lobbyPlayers[oldLobbyKey].splice(idx, 1);
      }
    }
    delete playerLobby[socket.id];
  }
}

function leaveLobby(socket, callback) {
  const io = socket.server;
  const { playerLobby } = io.tronGame;

  const oldLobbyKey = playerLobby[socket];
  if (oldLobbyKey === undefined) {
    throw new Error(`Player '${socket}' is not currently in a lobby, so cannot leave.`);
  } else {
    socket.leave(oldLobbyKey, (err) => {
      leaveLobbyDataStructures(socket, oldLobbyKey);
      callback(err);
    });
  }
}

function joinLobby(socket, lobbyKey, playerData, ackFn) {
  const io = socket.server;
  const { lobbyPlayers, lobbyStates, playerLobby } = io.tronGame;

  const curLobby = playerLobby[socket.id];
  if (curLobby !== undefined) {
    throw new Error(`Player '${socket}' trying to join lobby '${lobbyKey}', but is already in lobby '${curLobby}'.`);
  } else {
    socket.join(lobbyKey, (err) => {
      if (lobbyPlayers[lobbyKey] === undefined) {
        lobbyPlayers[lobbyKey] = [];
        lobbyStates[lobbyKey] = getInitialState();
      } else if (lobbyPlayers[lobbyKey].indexOf(socket.id) !== -1) {
        throw new Error(`Player '${socket}' trying to join lobby '${lobbyKey}', but is already a member.`);
      }

      lobbyPlayers[lobbyKey].push(socket);
      playerLobby[socket.id] = lobbyKey;

      const state = lobbyStates[lobbyKey];
      const { name, color } = playerData;
      addPlayer(state.players, 0, name, color);

      const getSpawnFn = (ply, k) => {
        const { players, plySize, arenaSize } = state;
        const totalPlayers = players.length;
        return getSpawn(k, totalPlayers, plySize, arenaSize);
      };
      resetPlayers(state.players, getSpawnFn);

      const success = err === null;
      ackFn({ success, lobbyKey, state });
      io.to(lobbyKey).emit('playerconnected', playerData);
    });
  }
}

export default function socketsInit(app) {
  const server = http.createServer(app);
  const io = socketio(server);

  // Maintain two data-structures for speed.
  // Also, the socket API is kind of awkward to work with, and seems to change
  // quite a lot. So this is easier.
  io.tronGame = {
    lobbyPlayers: {},  // Map: lobbyKey -> [sockets]
    lobbyStates: {},  // Map: lobbyKey -> gameState
    playerLobby: {},  // Map: socket -> lobbyKey
  };

  io.on('connection', (socket) => {
    socket.on('disconnect', () => {
      if (io.tronGame.playerLobby[socket.id] !== undefined) {
        leaveLobbyDataStructures(socket);
      }
    });

    socket.on('lobbyconnect', (data, ackFn) => {
      const { lobbyKey, name, color } = data;
      const playerData = { name, color };

      if (io.tronGame.playerLobby[socket.id] !== undefined) {
        leaveLobby(socket, () => {
          joinLobby(socket, lobbyKey, playerData, ackFn);
        });
      } else {
        joinLobby(socket, lobbyKey, playerData, ackFn);
      }
    });
  });

  return server;
}
