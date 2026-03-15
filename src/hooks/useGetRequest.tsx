import { useChangeState } from "./useChangeState";

type Options<T> = {
  defaultValue?: NoInfer<T>;
  fetch: (abortSignal: AbortSignal) => Promise<T>;
  disabled?: boolean;
  refetchOn?: any[];
};
export function useGetRequest<T>(options: Options<T>) {
  const { defaultValue, fetch, disabled, refetchOn = [] } = options;
  const [state, changeState] = useChangeState({
    data: defaultValue,
    loading: true,
    initiallyLoading: true,
    prevRefetchOn: null as any[] | null,
    abortController: null as AbortController | null,
  });
  if (disabled) {
    state.loading = false;
    state.initiallyLoading = false;
  } else if (state.prevRefetchOn == null || refetchOn == null || refetchOn.some((v, i) => !Object.is(v, state.prevRefetchOn?.[i]))) {
    if (state.abortController != null) state.abortController.abort();
    const abortController = new AbortController();
    state.loading = true;
    state.prevRefetchOn = refetchOn;
    state.abortController = abortController;
    Promise.try(() => fetch(abortController.signal)).then((data) => {
      changeState({ data, loading: false, initiallyLoading: false, abortController: null });
    });
  }
  if (disabled) state.loading = false;
  return [state.loading, state.data, state.initiallyLoading];
}
