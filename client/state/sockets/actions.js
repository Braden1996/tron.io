export const SOCKETS_RECEIVE_READY = 'SOCKETS_RECEIVE_READY';
export function socketsReceiveReady() {
  return { type: SOCKETS_RECEIVE_READY };
}

export const SOCKETS_SEND_READY = 'SOCKETS_SEND_READY';
export function socketsSendReady() {
  return { type: SOCKETS_SEND_READY };
}

export const SOCKETS_RECEIVE = 'SOCKETS_RECEIVE';
export function socketsReceive(eventName, data, ackFn) {
  return { type: SOCKETS_RECEIVE, eventName, data, ackFn };
}

export const SOCKETS_SEND = 'SOCKETS_SEND';
export function socketsSend(eventName, data, ackFn) {
  return { type: SOCKETS_SEND, eventName, data, ackFn };
}

