export const LOBBY_CONNECT = 'LOBBY_CONNECT';
export function lobbyConnect(lobbyKey, name, color) {
  return { type: LOBBY_CONNECT, lobbyKey, name, color };
}

export const LOBBY_CONNECT_SUCCESS = 'LOBBY_CONNECT_SUCCESS';
export function lobbyConnectSuccess(lobbyKey, gameState) {
  return { type: LOBBY_CONNECT_SUCCESS, lobbyKey, gameState };
}

export const LOBBY_APPLY_SNAPSHOT = 'LOBBY_APPLY_SNAPSHOT';
export function lobbyApplySnapshot(snapshot) {
  return { type: LOBBY_APPLY_SNAPSHOT, value: snapshot };
}

export const LOBBY_ADD_COMPUTER = 'LOBBY_ADD_COMPUTER';
export function lobbyAddComputer() {
  return { type: LOBBY_ADD_COMPUTER };
}

