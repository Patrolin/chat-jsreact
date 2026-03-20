import { useCallback, useReducer } from "react";

export function useChangeState<T extends Record<string, any>>(defaultState: T): [T, (diff: Partial<T>, rerender?: boolean) => void] {
  /* NOTE: React doesn't export a rerender function, so we do this workaround */
  const [state, forceRerender] = useReducer((v) => v, defaultState);
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
