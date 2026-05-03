import { useCallback, useReducer } from "react";

export function useChangeState<D, T extends Record<string, any> = D extends object ? D : Record<string, never>>(
  defaultState: D,
  init: (defaultState: D) => T = (v) => (v ?? {}) as T
): [T, (diff: Partial<T>, rerender?: boolean) => void] {
  /* NOTE: React doesn't export a rerender function, so we do this workaround */
  const [state, forceRerender] = useReducer((v) => v, defaultState, init);
  const changeState = useCallback(
    (diff: Partial<T>, rerender = true) => {
      if (Object.keys(diff).every((k) => Object.is(diff[k], state[k]))) return;
      Object.assign(state, diff);
      if (rerender) forceRerender();
    },
    [forceRerender]
  );
  return [state, changeState];
}
export function dependenciesDiffer(a: any[] | undefined, b: any[] | undefined) {
  return a == null || b == null || a.length !== b.length || !b.every((v, i) => Object.is(v, a[i]));
}
