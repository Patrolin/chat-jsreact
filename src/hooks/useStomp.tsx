import { createContext, PropsWithChildren, useContext, useEffect, useLayoutEffect } from "react";
import { Client, IFrame } from "@stomp/stompjs";
import { useChangeState } from "./useChangeState";
import { AuthContext, useAuthContext } from "./useAuth";

const RawStompContext = createContext(null as Client | null);
type StompOptions = {
  brokerURL: string;
  onConnect: (props: { client: Client; frame: IFrame; auth: AuthContext }) => void;
};
export const StompProvider: React.FC<PropsWithChildren<StompOptions>> = (props) => {
  const auth = useAuthContext();
  const token = auth.state.token ?? "";
  const [state, _changeState] = useChangeState(null, () => {
    const client = new Client({
      brokerURL: props.brokerURL,
      onConnect: (frame) => props.onConnect({ client, frame, auth }),
      connectHeaders: { token },
      debug: console.debug,
    });
    return client;
  });
  useEffect(() => {
    state.connectHeaders.token = token;
  }, [token]);
  useLayoutEffect(() => {
    // NOTE: run after all other components
    if (token == null) return;
    state.activate();
    // NOTE: close the connection if the user closes the page, or vite reloads the page
    window.addEventListener("beforeunload", () => state.deactivate());
  }, [token == null]);
  return <RawStompContext value={state}>{props.children}</RawStompContext>;
};
export function useStompContext(callback: (type: string) => void) {
  const client = useContext(RawStompContext);
  if (client == null) return;
  // TODO: handle callback
}
