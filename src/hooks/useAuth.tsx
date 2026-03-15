import { createContext, FC, PropsWithChildren, useContext, useReducer } from "react";

const AUTH_STORAGE_ID = "chat:auth";
type AuthState = {
  token: string | null;
  parsed: {
    sub: string;
    iat: number;
    exp: number;
  };
};
export function parseToken(jwtToken: string | null) {
  try {
    if (jwtToken == null) throw jwtToken;
    return JSON.parse(atob(jwtToken.split(".")[1]));
  } catch {
    return {};
  }
}
export function isTokenExpired(authContext: AuthContext) {
  const expiration_seconds = authContext.state.parsed.exp;
  const now_seconds = +new Date() / 1000;
  return now_seconds > expiration_seconds;
}

export type AuthContext = {
  state: AuthState;
  setToken: (newToken: string | null) => void;
};
export function useAuthContext(): AuthContext {
  return useContext(RawAuthContext)!;
}
const RawAuthContext = createContext(null as AuthContext | null);
export const AuthContextProvider: FC<PropsWithChildren> = (props) => {
  const [state, setToken] = useReducer(
    (state: AuthState, newToken: string | null) => {
      if (newToken != null) localStorage.setItem(AUTH_STORAGE_ID, JSON.stringify(newToken));
      else localStorage.removeItem(AUTH_STORAGE_ID);
      Object.assign(state, { token: newToken, parsed: parseToken(newToken) });
      return state;
    },
    undefined,
    () => {
      const initialState = {} as AuthState;
      try {
        initialState.token = JSON.parse(localStorage.getItem(AUTH_STORAGE_ID) ?? "");
      } catch {}
      initialState.parsed = parseToken(initialState.token);
      return initialState;
    }
  );
  return <RawAuthContext value={{ state, setToken }}>{props.children}</RawAuthContext>;
};
