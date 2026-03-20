import { MessageControllerApi, OutboundChatMessage } from "@/api";
import { CHAT_DEFAULT_PAGE_SIZE, getAuthConfigWithBearer } from "@/config";
import { AuthContext } from "./useAuth";
import { useGetRequest } from "./useGetRequest";
import { useCallback } from "react";

export enum ChannelType {
  User = "USER",
  Public = "CHANNEL",
}
export type UserChannel = { type: ChannelType.User; username: string };
export type PublicChannel = { type: ChannelType.Public; id: number; name: string };
export type MessagesChannel = UserChannel | PublicChannel;
export function useMessages(authContext: AuthContext, selectedChannel: MessagesChannel) {
  const messageApi = new MessageControllerApi(getAuthConfigWithBearer(authContext));
  const [messagesLoading, messages] = useGetRequest({
    defaultValue: [],
    fetch: async () => {
      const destination = selectedChannel?.type === ChannelType.User ? selectedChannel.username : selectedChannel.id;
      const response = await messageApi.messageList_Get({
        destinationType: selectedChannel?.type,
        destination,
        pageable: { page: 0, size: CHAT_DEFAULT_PAGE_SIZE },
      } as any);
      return response.messages;
    },
    refetchOn: [JSON.stringify(selectedChannel)],
  });
  type NewMessages = {
    atEnd: boolean;
    messages: OutboundChatMessage[];
  };
  const addMessages = useCallback((newMessages: NewMessages) => {
    if (newMessages.atEnd) {
      messages.splice(messages.length, 0, ...newMessages.messages);
    } else {
      messages.splice(0, 0, ...newMessages.messages);
    }
  }, []);
  return [messagesLoading, messages, addMessages];
}
