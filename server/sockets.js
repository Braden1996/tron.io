import express from 'express';
import socketio from 'socket.io';
import http from 'http';

// Maintain two data-structures for speed.
// Also, the socket API is kind of awkward to work with, and seems to change
// quite a lot. So this is easier/safer.
const lobbyPlayers = {};  // Map: roomKey -> [sockets]
const playerLobby = {};  // Map: socket -> roomKey

function leaveRoomDataStructures(socket, oldLobbyKey = undefined) {
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

function leaveRoom(socket, callback) {
  const oldLobbyKey = playerLobby[socket];
  if (oldLobbyKey === undefined) {
    throw new Error(`Player '${socket}' is not current in a lobby, so cannot leave.`);
  } else {
    socket.leave(oldLobbyKey, (err) => {
      leaveRoomDataStructures(socket, oldLobbyKey);
      callback(err);
    });
  }
}

function joinRoom(socket, roomKey, callback) {
  const curLobby = playerLobby[socket.id];
  if (curLobby !== undefined) {
    throw new Error(`Player '${socket}' trying to join lobby '${roomKey}', but is already in lobby '${curLobby}'.`);
  } else {
    socket.join(roomKey, (err) => {
      if (lobbyPlayers[roomKey] === undefined) {
        lobbyPlayers[roomKey] = [];
      } else if (lobbyPlayers[roomKey].indexOf(socket.id) !== -1) {
        throw new Error(`Player '${socket}' trying to join lobby '${roomKey}', but is already a member.`);
      }

      lobbyPlayers[roomKey].push(socket);
      playerLobby[socket.id] = roomKey;

      callback(err);
    });
  }
}

export default function socketsInit(app) {
  const server = http.createServer(app);
  const io = socketio(server);
  io.on('connection', (socket) => {

    socket.on('disconnect', () => {
      leaveRoomDataStructures(socket);
    });

    socket.on('lobbyconnect', (data) => {
      const lobbyRoomKey = data;
      const joinRoomCallback = (err) => {
        socket.emit('lobbyconnected', lobbyRoomKey);
      };

      if (playerLobby[socket.id] !== undefined) {
        leaveRoom(socket, () => {
          joinRoom(socket, lobbyRoomKey, joinRoomCallback);
        });
      } else {
        joinRoom(socket, lobbyRoomKey, joinRoomCallback);
      }
    });
  });

  return server;
}
