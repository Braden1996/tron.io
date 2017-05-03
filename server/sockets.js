import http from 'http';
import socketio from 'socket.io';
import path from 'path';
import cp from 'child_process';
import appRootDir from 'app-root-dir';

import config from '../config';
import GameServer from '../shared/game/network/server';

import NodeGameLoop from './game/gameloop';

export default function socketsInit(app) {
  const server = http.createServer(app);
  const io = socketio(server);

  // A quick helper to make process dependencies easier.
  const processInterface = (entryFile, onMessage) => {
    const childProcess = cp.fork(entryFile);
    childProcess.on('message', m => { onMessage(m); });

    const killFcn = (signal = 'SIGINT') => { childProcess.kill(signal); };
    const sendFcn = payload => { childProcess.send(payload); };

    return { killFcn, sendFcn };
  }

  // Attach our Node specialised dependencies.
  const lobbyDependencies = {
    createGameLoop: (cb, tr) => new NodeGameLoop(cb, tr),
    stateUpdateFork: (onMessage) => {
      const rootDir = appRootDir.get();
      const entryFile = path.resolve(rootDir, 'build/tronUpdate/index.js');
      return processInterface(entryFile, onMessage);
    },
    aiMoveFork: (onMessage) => {
      const rootDir = appRootDir.get();
      const entryFile = path.resolve(rootDir, 'build/tronAi/index.js');
      return processInterface(entryFile, onMessage);
    }
  };
  const serverConfig =  config('tronServer');
  const gameServer = new GameServer(lobbyDependencies, config);

  io.on('connection', (socket) => {
    const plyId = socket.id;
    gameServer.onConnect(plyId, socket);
  });

  return server;
}
