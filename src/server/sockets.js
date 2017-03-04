import express from 'express';
import socketio from 'socket.io';
import http from 'http';

export default function socketsInit(app) {
  const server = http.createServer(app);
  const io = socketio(server);
  io.on('connection', (socket) => {
    console.log('Connected');

    socket.on('disconnect', () => {
      console.log('A user disconnected');
    });

    // socket.on('input', (data) => {
    //   socket.emit('input', data);
    // });

    // socket.on('inputoff', (data) => {
    //   // console.log(data);
    //   socket.emit('inputoff', data);
    // });

    socket.on('lobbyconnect', (data) => {
      socket.emit('lobbyconnected', data);
    });
  });

  return server;
}
