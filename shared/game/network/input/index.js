import { hostDetachPlayer, hostAttachPlayer } from './host';
import { playerDetachPlayer, playerAttachPlayer } from './player';

export function detachPlayer(lobby, ply, detachDeps) {
  hostDetachPlayer(lobby, ply, detachDeps.host);
  playerDetachPlayer(lobby, ply);
}

export function attachPlayer(lobby, ply, attachDeps) {
  hostAttachPlayer(lobby, ply, attachDeps.host);
  playerAttachPlayer(lobby, ply);
}
