"use strict";

import Immutable from "immutable";

import {
	ADD_PLAYER,
	KILL_PLAYER,
	RESET_PLAYERS,
	UPDATE_PLAYER_DIRECTION,
	UPDATE_PLAYER_POSITION,
	resetPlayers as resetPlayersAction
} from "../actions/players.js";
import getSpawn from "../../utils/spawn.js";

function addPlayer(state, action, gameState) {
	const lastId = state.size > 0 ? state.max(pl => pl.get("id")).get("id") : -1;
	const ply = Immutable.Map({
		id: lastId + 1,
		name: action.name,
		color: action.color,
		alive: true,
		direction: undefined,
		position: undefined,
		trail: Immutable.List()
	});

	return resetPlayers(state.push(ply), resetPlayersAction(), gameState);
}

function killPlayer(state, action) {
	return state.update(state.findIndex(ply => ply.get("id") === action.id), ply => {
		ply = ply.set("alive", false)
		if (!action.position.isEmpty()) {
			ply = ply
				.set("position", action.position)
				.update("trail", t => t.set(t.size-1, action.position));
		}
		return ply;
	});
}

function resetPlayers(state, action, gameState) {
	const plySize = gameState.get("playerSize");
	const arenaSize = gameState.get("arenaSize");

	return state.map((ply, k) => {
		const spawn = getSpawn(k, state.size, plySize, arenaSize);
		if (!Immutable.List.isList(spawn.position)) {
			spawn.position = Immutable.List(spawn.position);
		}

		return ply.set("alive", true)
			.set("direction", spawn.direction)
			.set("position", spawn.position)
			.set("trail", Immutable.List([spawn.position, spawn.position]));
	});
}

function updatePlayerDirection(state, action) {
	return state.update(state.findIndex(ply => ply.get("id") === action.id), ply => {
		const pos = Immutable.List([
			Math.round(ply.get("position").get(0)),
			Math.round(ply.get("position").get(1))
		]);
		return ply
			.set("direction", action.value)
			.set("position", pos)
			.update("trail", t => t.set(t.size-1, pos).push(pos));
	});
}

function updatePlayerPosition(state, action) {
	return state.update(state.findIndex(ply => ply.get("id") === action.id), ply => {
		const oldPos = ply.get("position");
		return ply.set("position", action.value)
			.update("trail", t => t.set(t.size-1, oldPos));
	});
}

export default function playerReducer(state=Immutable.List(), action, gameState) {
	switch (action.type) {
		case ADD_PLAYER:
			return addPlayer(state, action, gameState);
		case KILL_PLAYER:
			return killPlayer(state, action);
		case RESET_PLAYERS:
			return resetPlayers(state, action, gameState);
		case UPDATE_PLAYER_DIRECTION:
			return updatePlayerDirection(state, action);
		case UPDATE_PLAYER_POSITION:
			return updatePlayerPosition(state, action);
		default:
			return state;
	}
}
