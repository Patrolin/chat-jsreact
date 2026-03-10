export * from "./preact";
import * as Preact from "./preact";

const SafePreact = new Proxy(Preact, {
  get(target: any, prop: string) {
    if (prop in target) return target[prop];
    throw new Error(`PROXY: preact.${String(prop)} is not yet implemented in jsreact`);
  },
});
export default SafePreact;
