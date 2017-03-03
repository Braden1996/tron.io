import socketio from 'socket.io-client';

export default function socketsInit(store) {
  const socket = socketio("http://localhost:3000");

  socket.on('connect', () => {
    console.log('Client connected!');
  });

  return socket;
}
