import express from 'express';
import socketio from 'socket.io';
import http from 'http';

import gameUpdate from '../shared/game/update';
import GameServer from '../shared/game/network/server';

import NodeGameLoop from './game/gameloop';

export default function socketsInit(app) {
  const server = http.createServer(app);
  const io = socketio(server);

  const gameServer = new GameServer();

  // Attach our Node compatible game-loop.
  const oldCreateGame = gameServer.createGame.bind(gameServer);
  gameServer.createGame = function() {
    const partGame = oldCreateGame();
    partGame.loop = new NodeGameLoop(15);
    partGame.loop.setArgument('state', partGame.state);
    partGame.loop.subscribe(gameUpdate, ['state', 'progress']);
    return partGame;
  };

  io.on('connection', (socket) => {
    const plyId = socket.id;
    gameServer.onConnect(plyId, socket);
  });

  return server;
}
