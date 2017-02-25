"use strict";

import Immutable from "immutable";
import {
	ADD_PLAYER,
	KILL_PLAYER,
	RESET_PLAYER,
	UPDATE_PLAYER_DIRECTION,
	UPDATE_PLAYER_POSITION
} from "../actions/players.js";


function addPlayer(state, action) {
	const ply = Immutable.Map({
		id: state.maxBy(pl => pl.id) + 1,
		name: action.name,
		color: action.color,
		alive: true,
		direction: undefined,
		position: undefined,
		trail: Immutable.List()
	});

	return state.push(ply);
}

function killPlayer(state, action) {
	return state.update(state.findIdx(ply => ply.id === action.id), ply => {
		return ply.set("alive", false);
	});
}

function resetPlayer(state, action) {
	return state.update(state.findIdx(ply => ply.id === action.id), ply => {
		return ply.set("alive", true)
			.set("direction", undefined)
			.set("position", undefined)
			.set("trail", Immutable.List());
	});
}

function updatePlayerDirection(state, action) {
	return state.update(state.findIdx(ply => ply.id === action.id), ply => {
		const pos = Immutable.List([
			Math.round(ply.get("position").get(0)),
			Math.round(ply.get("position").get(1))
		]);
		return ply
			.set("direction", action.direction)
			.set("position", pos)
			.update("trail", t => t.insert(t.size-1, pos).push(pos));
	});
}

function updatePlayerPosition(state, action) {
	let pos = action.position;
	if (!Immutable.List.isList(pos)) {
		pos = Immutable.List(action.position);
	}

	return state.update(state.findIdx(ply => ply.id === action.id), ply => {
		if (ply.get("trail").size === 0) {
			return ply.set("position", pos)
				.set("trail", Immutable.List([pos, pos]));
		} else {
			return ply.set("position", pos)
				.update("trail", t => t.insert(ply.size-1, pos));
		}
	});
}

export default function playerReducer(state = Immutable.List(), action) {
	switch (action.type) {
		case ADD_PLAYER:
			return addPlayer(state, action);
		case KILL_PLAYER:
			return killPlayer(state, action);
		case UPDATE_PLAYER_DIRECTION:
			return updatePlayerDirection(state, action);
		case UPDATE_PLAYER_POSITION:
			return updatePlayerPosition(state, action);
		default:
			return state;
	}
}