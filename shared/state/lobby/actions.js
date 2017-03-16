export const LOBBY_CONNECT = 'LOBBY_CONNECT';
export function lobbyConnect(lobbyKey) {
  return { type: LOBBY_CONNECT, value: lobbyKey };
}

export const LOBBY_CONNECT_SUCCESS = 'LOBBY_CONNECT_SUCCESS';
export function lobbyConnectSuccess(lobbyKey, gameState, plyId, hostId) {
  return { type: LOBBY_CONNECT_SUCCESS, lobbyKey, gameState, plyId, hostId };
}

export const LOBBY_APPLY_SNAPSHOT = 'LOBBY_APPLY_SNAPSHOT';
export function lobbyApplySnapshot(snapshot) {
  return { type: LOBBY_APPLY_SNAPSHOT, value: snapshot };
}

export const LOBBY_SET_HOST = 'LOBBY_SET_HOST';
export function lobbySetHost(hostId) {
  return { type: LOBBY_SET_HOST, hostId };
}

export const LOBBY_SET_NAME = 'LOBBY_SET_NAME';
export function lobbySetName(name) {
  return { type: LOBBY_SET_NAME, value: name };
}
