export * from "./jsreact";
import * as JsReact from "./jsreact";

const React = new Proxy(JsReact, {
  get(target: any, prop: string) {
    if (prop in target) return target[prop];
    throw new Error(`PROXY: React.${String(prop)} is not yet implemented in jsreact`);
  },
});
export default React;
