"use strict";

import gameMain from "./game/main.js";
import viewMain from "./view/index.jsx";
import css from "../css/main.css";

let tronState = gameMain();
viewMain(tronState);