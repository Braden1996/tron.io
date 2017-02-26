"use strict";

import gameMain from "./gameloop.js";
import viewMain from "./view/index.jsx";
import css from "../css/main.css";


const tronStore = gameMain();
viewMain(tronStore);