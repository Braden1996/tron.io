export const LOBBY_CONNECT = 'LOBBY_CONNECT';
export function lobbyConnect(lobbyKey, name, color) {
  return { type: LOBBY_CONNECT, lobbyKey, name, color };
}

export const LOBBY_CONNECT_SUCCESS = 'LOBBY_CONNECT_SUCCESS';
export function lobbyConnectSuccess(lobbyKey) {
  return { type: LOBBY_CONNECT_SUCCESS, value: lobbyKey };
}
