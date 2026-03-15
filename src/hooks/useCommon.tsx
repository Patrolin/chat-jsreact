import { useLocation } from "preact-iso";
import { useAuthContext } from "./useAuth";

export function useCommon() {
  const authContext = useAuthContext();
  const location = useLocation();
  return {
    authContext,
    currentUser: authContext.state.parsed.sub,
    ...location,
  };
}
