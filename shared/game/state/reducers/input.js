import Immutable from 'immutable';
import {
  KEYDOWN,
  KEYUP,
} from '../actions/input';


export const KEYMAP = {
  13: 'enter',
  65: 'a',
  68: 'd',
  83: 's',
  87: 'w',
};

export const KEYACTIONMAP = {
  a: 'MOVE_WEST',
  d: 'MOVE_EAST',
  s: 'MOVE_SOUTH',
  w: 'MOVE_NORTH',
};

export default function inputReducer(state = Immutable.OrderedSet(), action) {
  switch (action.type) {
    case KEYDOWN:
      return state.add(KEYACTIONMAP[KEYMAP[action.value]]);
    case KEYUP:
      return state.delete(KEYACTIONMAP[KEYMAP[action.value]]);
    default:
      return state;
  }
}
