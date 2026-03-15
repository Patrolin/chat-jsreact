import { ApiClient } from "@/api/ApiClient";
import { useChangeState } from "@/hooks/useChangeState";
import { useCommon } from "@/hooks/useCommon";
import { useGetRequest } from "@/hooks/useGetRequest";
import { FC } from "react";

export const ClientPage: FC = () => {
  const { authContext, currentUser } = useCommon();
  const apiClient = new ApiClient(authContext);
  const [usersLoading, users] = useGetRequest({
    fetch: async () => {
      const rawResponse = await apiClient.listUsers();
      return await rawResponse.json();
    },
  });
  const [channelsLoading, channels] = useGetRequest({
    fetch: async () => {
      const rawResponse = await apiClient.listChannels();
      return await rawResponse.json();
    },
  });
  enum ChannelType {
    User = "User",
    Public = "Public",
  }
  type UserChannel = { type: ChannelType.User; username: string };
  type PublicChannel = { type: ChannelType.Public; id: number };
  type Channel = UserChannel | PublicChannel;
  const [state, changeState] = useChangeState({
    selectedChannel: { type: ChannelType.User, username: currentUser } as Channel,
  });
  const [messagesLoading, messages] = useGetRequest({
    fetch: async () => {
      if (state.selectedChannel?.type === ChannelType.User) {
        const rawResponse = await apiClient.listUserMessages({ username: state.selectedChannel.username, page: 0 });
        const response = await rawResponse.json();
        return response;
      } else {
        const rawResponse = await apiClient.listChannelMessages({ channelId: state.selectedChannel.id, page: 0 });
        const response = await rawResponse.json();
        return response;
      }
    },
  });
  console.log("ayaya.users", usersLoading, users);
  console.log("ayaya.channels", channelsLoading, channels);
  console.log("ayaya.messages", messagesLoading, messages);
  return "ClientPage";
};
