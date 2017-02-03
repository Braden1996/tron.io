"use strict";

let lastTick = 0;

function update(state, progress) {
	console.log("UPDATE!")
}

function draw(state) {
	console.log("DRAW!");
}

function tick(state, curtick) {
	let progress = curtick - lastTick;

	update(progress);
	draw();

	lastTick = curtick - lastTick;
	window.requestAnimationFrame((curtick) => tick(state, curtick));
}

export default function gameMain() {
	console.log("Starting!");

	let state = 0;
	window.requestAnimationFrame((curtick) => tick(state, curtick));
}