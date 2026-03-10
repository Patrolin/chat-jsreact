import { TYPE_ELEMENT, type JsReactElement } from "./jsreact";
export { Fragment } from "./jsreact";

export function jsx(type: JsReactElement["type"], props: JsReactElement["props"] | null, key: JsReactElement["key"]): JsReactElement {
  return { $$typeof: TYPE_ELEMENT, type, key, props: {...props, children: props?.children} };
}
export const jsxs = jsx;
