"use strict";

import updateControl from "./control.js";
import updateMove from "./move.js";

export default function update(state, progress) {
	updateControl(state, progress);
	updateMove(state, progress);
}