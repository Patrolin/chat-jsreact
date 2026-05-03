import { API_STOMP_PATH } from "@/config";
import { StompProvider } from "@/hooks/useStomp";
import { PropsWithChildren } from "react";

const USER_RECEIVE_PREFIX = "/receive/user/";
const CHANNEL_RECEIVE_PREFIX = "/receive/channel/";
const USER_SEND_PREFIX = "/send/user/";
const CHANNEL_SEND_PREFIX = "/send/channel/";
const RECEIVE_SERVER_UPDATE_ENDPOINT = "/receive/server/update";
const MESSAGE_ENDPOINT = "/message";
const UPDATE_ENDPOINT = "/update";

export const StompApiProvider: React.FC<PropsWithChildren> = (props) => {
  return (
    <StompProvider
      brokerURL={API_STOMP_PATH}
      onConnect={({ client, auth }) => {
        const username = auth.state.parsed.sub;
        console.log("ayaya.onConnect", client, username);
        client.subscribe(`/receive/user/${username}/message`, (message) => {
          console.log("ayaya.message", message);
        });
      }}
    >
      {props.children}
    </StompProvider>
  );
};
