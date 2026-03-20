import { useCallback } from "react";
import { useChangeState } from "./useChangeState";

// cache requests
type CachedRequest<T = any> = {
  prevFetchedOn: any[] | undefined;
  response: T;
};
const responseCache: Record<string, CachedRequest | undefined> = {};
function getCachedResponse<T>(cacheId: string | undefined, refetchOn: any[] | undefined): T | undefined {
  if (cacheId == null) return;
  const cachedRequest = responseCache[cacheId as string];
  if (dependenciesDiffer(cachedRequest?.prevFetchedOn, refetchOn)) return undefined;
  return cachedRequest!.response;
}
function setCachedRequest<T>(cacheId: string | undefined, refetchOn: any[] | undefined, response: T) {
  if (cacheId == null) return;
  responseCache[cacheId] = { prevFetchedOn: refetchOn, response };
}

// get request
function dependenciesDiffer(a: any[] | undefined, b: any[] | undefined) {
  return a == null || b == null || a.length !== b.length || !b.every((v, i) => Object.is(v, a[i]));
}
type DefaultValue<T, D> = D extends undefined ? T | D : T;
type UseGetRequestOptions<T, D> = {
  defaultValue?: DefaultValue<T, D>;
  fetch: (abortSignal: AbortSignal) => Promise<T>;
  refetchOn?: any[];
  onError?: (errorOrResponse: any) => void;
  disabled?: boolean;
  cacheId?: string;
};
export function useGetRequest<T, D extends T | undefined = T | undefined>(
  options: UseGetRequestOptions<T, D>
): [boolean, DefaultValue<T, D>, () => Promise<T>, boolean] {
  // state
  const [state, changeState] = useChangeState({
    data: options.defaultValue as T,
    loading: true,
    initiallyLoading: true,
    prevRefetchOn: undefined as any[] | undefined,
    abortController: null as AbortController | null,
    options,
  });
  state.options = options;
  // callbacks
  const _fetchAndRerender = useCallback(
    (rerender: boolean) => {
      const { fetch, refetchOn = [], onError, cacheId } = state.options;
      if (state.abortController != null) state.abortController.abort();
      const abortController = new AbortController();
      changeState({ loading: true, prevRefetchOn: refetchOn, abortController }, rerender);
      return Promise.try(() => fetch(abortController.signal))
        .then((data: T) => {
          setCachedRequest(cacheId, refetchOn, data);
          changeState({ data: data, loading: false, initiallyLoading: false, abortController: null }, true);
          return data;
        })
        .catch((error) => {
          onError?.(error);
          return state.data;
        });
    },
    [state, changeState]
  );
  const refetch = useCallback(() => _fetchAndRerender(true), [_fetchAndRerender]);

  // update state without rerendering, and start the fetch if necessary
  const { refetchOn = [], cacheId } = options;
  if (options.disabled) {
    changeState({ loading: false, initiallyLoading: false }, false);
  } else if (dependenciesDiffer(state.prevRefetchOn, refetchOn)) {
    const cachedResponse = getCachedResponse<T>(cacheId, refetchOn);
    if (cachedResponse != null) {
      changeState({ data: cachedResponse, loading: false, initiallyLoading: false }, false);
    } else {
      _fetchAndRerender(false);
    }
  }
  return [state.loading, state.data as DefaultValue<T, D>, refetch, state.initiallyLoading];
}
