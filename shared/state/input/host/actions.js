export const INPUT_HOST_ADD_COMPUTER = 'INPUT_HOST_ADD_COMPUTER';
export function addComputer() {
  return { type: INPUT_HOST_ADD_COMPUTER };
}

export const INPUT_HOST_BEGIN_GAME = 'INPUT_HOST_BEGIN_GAME';
export function beginGame() {
  return { type: INPUT_HOST_BEGIN_GAME };
}

export const INPUT_HOST_END_GAME = 'INPUT_HOST_END_GAME';
export function endGame() {
  return { type: INPUT_HOST_END_GAME };
}
