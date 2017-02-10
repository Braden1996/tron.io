"use strict";

export const KEYMAP = {
  65: "a",
  68: "d",
  83: "s",
  87: "w"
};

// An object factory to initialise an input state.
export default function createInputState() {
	let state = {"pressedKeys": {}};
	window.addEventListener("keydown", (evnt) => {
		if (KEYMAP[evnt.keyCode] !== undefined) {
			state.pressedKeys[KEYMAP[evnt.keyCode]] = true;
		}
	}, false);
	window.addEventListener("keyup", (evnt) => {
		if (KEYMAP[evnt.keyCode] !== undefined) {
			delete state.pressedKeys[KEYMAP[evnt.keyCode]];
		}
	}, false);
	return state;
}