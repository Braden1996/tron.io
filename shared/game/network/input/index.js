import { hostDetachPlayer, hostAttachPlayer } from './host';
import { playerDetachPlayer, playerAttachPlayer } from './player';

export function detachPlayer(lobby, ply, serverConfig) {
  hostDetachPlayer(lobby, ply, serverConfig);
  playerDetachPlayer(lobby, ply, serverConfig);
}

export function attachPlayer(lobby, ply, serverConfig) {
  hostAttachPlayer(lobby, ply, serverConfig);
  playerAttachPlayer(lobby, ply, serverConfig);
}
