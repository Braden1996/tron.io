export const SOCKETS_READ_READY = 'SOCKETS_READ_READY';
export function socketsReadReady(){
  return { type: SOCKETS_READ_READY }
};

export const SOCKETS_WRITE_READY = 'SOCKETS_WRITE_READY';
export function socketsWriteReady() {
  return { type: SOCKETS_WRITE_READY }
};
