"use strict";

import React from "react";
import ReactDOM from "react-dom";
import {Provider} from "react-redux";
import App from "./components/index.jsx";


export default function viewMain(tronStore) {
	ReactDOM.render(
		<Provider store={tronStore}><App /></Provider>,
		document.getElementById("menuSection")
	);
}