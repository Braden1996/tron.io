export const INPUT_KEYBOARD_KEYDOWN = 'INPUT_KEYBOARD_KEYDOWN';
export function keyDown(keyCode){
  return { type: INPUT_KEYBOARD_KEYDOWN, value: keyCode }
};

export const INPUT_KEYBOARD_KEYUP = 'INPUT_KEYBOARD_KEYUP';
export function keyUp(keyCode) {
  return { type: INPUT_KEYBOARD_KEYUP, value: keyCode }
};
