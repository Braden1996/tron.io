"use strict";

export const KEYDOWN = "KEYDOWN";
export function updateKeyDown(keyCode) {
	return {
		type: KEYDOWN,
		value: keyCode
	};
}

export const KEYUP = "KEYUP";
export function updateKeyUp(keyCode) {
	return {
		type: KEYUP,
		value: keyCode
	};
}