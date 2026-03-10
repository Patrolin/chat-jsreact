import { useRerender } from "@/jsreact";
import { createContext, FC, PropsWithChildren, RefObject, useContext, useMemo } from "react";

const AUTH_STORAGE_ID = "chat:auth";
type AuthData = {
  token: string;
};
export function isTokenExpired(token: string) {
  return false;
}

export type AuthContext = {
  data: RefObject<AuthData | null>;
  setData: (newAuth: AuthData | null) => void;
};
export function useAuthContext(): AuthContext {
  return useContext(RawAuthContext)!;
}
const RawAuthContext = createContext(null as AuthContext | null);
export const AuthContextProvider: FC<PropsWithChildren> = (props) => {
  const rerender = useRerender();
  const authContext = useMemo(() => {
    // get stored data
    const rawStoredAuth = localStorage.getItem(AUTH_STORAGE_ID) ?? "";
    let data = Object.seal({ current: null as AuthData | null });
    try {
      data.current = JSON.parse(rawStoredAuth);
    } catch {}
    // setter
    const setData = (newAuth: AuthData | null) => {
      if (newAuth != null) localStorage.setItem(AUTH_STORAGE_ID, JSON.stringify(newAuth));
      else localStorage.removeItem(AUTH_STORAGE_ID);
      data.current = newAuth ?? null;
      rerender();
    };

    const authContext: AuthContext = { data, setData };
    return authContext;
  }, [rerender]);
  return <RawAuthContext value={authContext}>{props.children}</RawAuthContext>;
};
