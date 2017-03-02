import express from 'express';
import socketio from 'socket.io';
import http from 'http';

const app = express();

const server = http.createServer(app);
const io = socketio(server);
io.on('connection', (client) => {
  // console.log('Connected');

  client.on('disconnect', () => {
    // console.log('A user disconnected');
  });

  client.on('input', (data) => {
    client.emit('input', data);
  });

  client.on('inputoff', (data) => {
    // console.log(data);
    client.emit('inputoff', data);
  });
});

server.listen(3000);
