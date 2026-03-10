import { TYPE_ELEMENT, type JsReactElement } from "./jsreact";
export { Fragment } from "./jsreact";

export function jsxDEV(
  type: JsReactElement["type"],
  props: JsReactElement["props"] | null,
  key: JsReactElement["key"],
  _isStaticChildren: boolean,
  source: JsReactElement["source"],
  _self: any,
): JsReactElement {
  return { $$typeof: TYPE_ELEMENT, type, key, props: {...props, children: props?.children}, source };
}
