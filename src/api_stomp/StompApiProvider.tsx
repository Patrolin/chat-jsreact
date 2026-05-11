import { ChannelControllerApi } from "@/api/apis";
import { LoadingSpinner } from "@/components/LoadingSpinner";
import { API_STOMP_PATH, getAuthConfigWithBearer } from "@/config";
import { useAuthContext } from "@/hooks/useAuth";
import { useGetRequest } from "@/hooks/useGetRequest";
import { StompProvider } from "@/hooks/useStomp";
import { PropsWithChildren } from "react";

export enum StompType {
  ReceiveUserMessage = "ReceiveUserMessage",
  ReceiveChannelMessage = "ReceiveChannelMessage",
}
export const StompApiProvider: React.FC<PropsWithChildren> = (props) => {
  const authContext = useAuthContext();
  const channelApi = new ChannelControllerApi(getAuthConfigWithBearer(authContext));
  const [channelsLoading, channels] = useGetRequest({
    defaultValue: [],
    fetch: async () => {
      return await channelApi.channelList_Get();
    },
    disabled: !authContext.state.token,
  });
  if (channelsLoading) return <LoadingSpinner />;
  return (
    <StompProvider
      brokerURL={API_STOMP_PATH}
      onConnect={(subscribe, { auth }) => {
        const username = auth.state.parsed.sub;
        subscribe(StompType.ReceiveUserMessage, `/receive/user/${username}/message`);
        for (const channel of channels) {
          subscribe(StompType.ReceiveChannelMessage, `/receive/channel/${channel.id}/message`);
        }
      }}
    >
      {props.children}
    </StompProvider>
  );
};
