import { createContext, PropsWithChildren, useContext, useInsertionEffect, useLayoutEffect } from "react";
import { Client, IFrame, IMessage } from "@stomp/stompjs";
import { useChangeState } from "./useChangeState";
import { AuthContext, useAuthContext } from "./useAuth";

type StompCallback<MessageType extends string = string> = (type: MessageType, event: IMessage) => void;
type StompContext = {
  client: Client;
  callbacks: StompCallback[];
};
const RawStompContext = createContext(null as StompContext | null);
type StompOptions<MessageType extends string = string> = {
  brokerURL: string;
  onConnect: (subscribe: (type: MessageType, path: string) => void, props: { auth: AuthContext; frame: IFrame }) => void;
};
export const StompProvider: React.FC<PropsWithChildren<StompOptions>> = (props) => {
  const auth = useAuthContext();
  const token = auth.state.token ?? "";
  const [state, _changeState] = useChangeState(null, () => {
    const client = new Client({
      brokerURL: props.brokerURL,
      onConnect: (frame) => {
        const subscribe = (type: string, path: string) =>
          client.subscribe(path, (event) => {
            for (const callback of state.callbacks) callback(type, event);
          });
        props.onConnect(subscribe, { auth, frame });
      },
      connectHeaders: { token },
      debug: console.debug,
    });
    const acc: StompContext = { client, callbacks: [] };
    return acc;
  });
  // update data
  state.client.connectHeaders.token = token;
  // activate
  useLayoutEffect(() => {
    // NOTE: run after all other components
    if (token == null) return;
    state.client.activate();
    // NOTE: close the connection if the user closes the page, or vite reloads the page
    window.addEventListener("beforeunload", () => state.client.deactivate());
  }, [token == null]);
  return <RawStompContext value={state}>{props.children}</RawStompContext>;
};
export function useStompContext(): StompContext | null {
  return useContext(RawStompContext);
}
export function useStompCallback<MessageType extends string>(callback: StompCallback<MessageType>) {
  const stomp = useStompContext();
  if (stomp == null) return;
  // NOTE: run immediately
  useInsertionEffect(() => {
    const index = stomp.callbacks.push(callback as StompCallback) - 1;
    return () => {
      stomp.callbacks.splice(index, 1);
    };
  }, [callback]);
}
