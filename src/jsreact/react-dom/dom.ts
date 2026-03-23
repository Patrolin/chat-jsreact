export { createPortal, findDOMNode } from "../jsreact";

export function flushSync(callback: () => void) {
  callback();
  /* NOTE: we could clear FLAGS_IS_RENDERING and stuff here, but eh... */
}
