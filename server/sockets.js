import socketio from 'socket.io';
import http from 'http';

import GameServer from '../shared/game/network/server';

import NodeGameLoop from './game/gameloop';

export default function socketsInit(app) {
  const server = http.createServer(app);
  const io = socketio(server);

  const gameServer = new GameServer();

  // Attach our Node compatible game-loop.
  const oldCreateGame = gameServer.createGame.bind(gameServer);
  function nodeCreateGame() {
    const partGame = oldCreateGame();
    partGame.loop = new NodeGameLoop(15);
    return partGame;
  }
  gameServer.createGame = nodeCreateGame;

  io.on('connection', (socket) => {
    const plyId = socket.id;
    gameServer.onConnect(plyId, socket);
  });

  return server;
}
