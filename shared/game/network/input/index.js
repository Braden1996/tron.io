import { hostDetachPlayer, hostAttachPlayer } from './host';
import { playerDetachPlayer, playerAttachPlayer } from './player';

export function detachPlayer(lobby, ply) {
  hostDetachPlayer(lobby, ply);
  playerDetachPlayer(lobby, ply);
}

export function attachPlayer(lobby, ply) {
  hostAttachPlayer(lobby, ply);
  playerAttachPlayer(lobby, ply);
}
