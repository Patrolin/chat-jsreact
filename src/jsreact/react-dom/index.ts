export * from "./dom";
import * as JsReactDOM from "./dom";

const ReactDOM = new Proxy(JsReactDOM, {
  get(target: any, prop: string) {
    if (prop in target) return target[prop];
    throw new Error(`PROXY: ReactDOM.${String(prop)} is not yet implemented in jsreact`);
  },
});
export default ReactDOM;
