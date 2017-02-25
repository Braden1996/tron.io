"use strict";

import React from "react";
import ReactDOM from "react-dom";
import Menu from "./components/menu/index.jsx";


export default function initMenu(tronState) {
	ReactDOM.render(<Menu tronState={tronState} />, document.getElementById("menuSection"));
}