export * from "./preact-iso";
import * as PreactIso from "./preact-iso";

const SafePreactIso = new Proxy(PreactIso, {
  get(target: any, prop: string) {
    if (prop in target) return target[prop];
    throw new Error(`PROXY: preact.${String(prop)} is not yet implemented in jsreact`);
  },
});
export default SafePreactIso;
