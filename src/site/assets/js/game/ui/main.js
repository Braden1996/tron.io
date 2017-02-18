"use strict";

import riot from "riot";
import menuTag from "./tags/menu.tag";
// Need to still find a way to use ES6 imports inside tag file.
import createGameState from "../state/game.js";

export default function initUi(state) {
	riot.mount(menuTag, {"state": state, "imports": {"createGameState": createGameState}});
}