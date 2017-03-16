export const INPUT_PLAYER_MOVE = 'INPUT_PLAYER_MOVE';
export function move(direction) {
  return { type: INPUT_PLAYER_MOVE, value: direction };
}
