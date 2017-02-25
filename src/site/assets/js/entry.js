"use strict";

import gameMain from "./game/main.js";
import viewMain from "./view/index.jsx";
import css from "../css/main.css";


const tronStore = gameMain();
viewMain(tronStore);