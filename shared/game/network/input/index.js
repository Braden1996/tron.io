import { hostDetachPlayer, hostAttachPlayer } from './host';

export function detachPlayer(lobby, ply) {
  hostDetachPlayer(lobby, ply);
}

export function attachPlayer(lobby, ply) {
  hostAttachPlayer(lobby, ply);
}
