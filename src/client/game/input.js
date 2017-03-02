import {
  updateKeyDown,
  updateKeyUp
} from "../../shared/game/state/actions/input.js";

export default function attachInput(store) {
  window.addEventListener("keydown", (evnt) => {
    store.dispatch(updateKeyDown(evnt.keyCode));
  }, false);
  window.addEventListener("keyup", (evnt) => {
    store.dispatch(updateKeyUp(evnt.keyCode));
  }, false);
}
