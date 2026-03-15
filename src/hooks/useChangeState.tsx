import { useCallback, useReducer } from "react";

export function useChangeState<T extends Record<string, any>>(defaultState: T): [T, (diff: Partial<T>) => void] {
  /* NOTE: React doesn't export a rerender function, so we do this workaround */
  const [state, rerender] = useReducer((v) => v, defaultState);
  const changeState = useCallback(
    (diff: Partial<T>) => {
      Object.assign(state, diff);
      rerender();
    },
    [rerender]
  );
  return [state, changeState];
}
