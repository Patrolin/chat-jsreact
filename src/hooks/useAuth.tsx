import { createContext, FC, PropsWithChildren, useCallback, useContext, useState } from "react";

const AUTH_STORAGE_ID = "chat:auth";
type AuthData = {
  token: string;
};

type UseAuth = [AuthData | null, (newAuth: AuthData | null) => void];
export function useAuth(): UseAuth {
  return useContext(UseAuthContext)!;
}
const UseAuthContext = createContext(null as UseAuth | null);
export const AuthContextProvider: FC<PropsWithChildren> = (props) => {
  const [auth, setAuth] = useState(() => {
    const rawStoredAuth = localStorage.getItem(AUTH_STORAGE_ID) ?? "";
    try {
      return JSON.parse(rawStoredAuth);
    } catch {
      return null;
    }
  });
  const setAndStoreAuth = useCallback(
    (newAuth: AuthData | null) => {
      if (newAuth != null) localStorage.setItem(AUTH_STORAGE_ID, JSON.stringify(newAuth));
      else localStorage.removeItem(AUTH_STORAGE_ID);
      setAuth(newAuth);
    },
    [setAuth]
  );
  return <UseAuthContext value={[auth, setAndStoreAuth]}>{props.children}</UseAuthContext>;
};
