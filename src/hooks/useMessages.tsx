import { MessageControllerApi, OutboundChatMessage } from "@/api";
import { CHAT_DEFAULT_PAGE_SIZE, getAuthConfigWithBearer } from "@/config";
import { AuthContext } from "./useAuth";
import { useGetRequest } from "./useGetRequest";
import { useCallback, useReducer } from "react";

export enum ChannelType {
  User = "USER",
  Public = "CHANNEL",
}
export type UserChannel = { type: ChannelType.User; username: string };
export type PublicChannel = { type: ChannelType.Public; id: number; name: string };
export type MessagesChannel = UserChannel | PublicChannel;
function getChannelDestination(selectedChannel: MessagesChannel) {
  const destinationType = selectedChannel.type;
  const destination = selectedChannel.type === ChannelType.User ? selectedChannel.username : String(selectedChannel.id);
  return { destinationType, destination };
}

export function useMessages(authContext: AuthContext, selectedChannel: MessagesChannel) {
  const messageApi = new MessageControllerApi(getAuthConfigWithBearer(authContext));
  const [messagesLoading, messages, refetchMessages] = useGetRequest({
    defaultValue: [],
    fetch: async () => {
      const { destinationType, destination } = getChannelDestination(selectedChannel);
      const response = await messageApi.messageList_Get({
        destinationType,
        destination,
        messageId: undefined as any,
        pageable: { page: 0, size: CHAT_DEFAULT_PAGE_SIZE, sort: undefined as any },
      });
      return response.messages;
    },
    refetchOn: [JSON.stringify(selectedChannel)],
  });
  type NewMessages = {
    atEnd: boolean;
    messages: OutboundChatMessage[];
  };
  const [_, rerender] = useReducer((v) => v, undefined);
  const addMessages = useCallback(
    (newMessages: NewMessages) => {
      if (newMessages.atEnd) {
        messages.splice(messages.length, 0, ...newMessages.messages);
      } else {
        messages.splice(0, 0, ...newMessages.messages);
      }
      rerender();
    },
    [messages, rerender]
  );
  const postMessage = useCallback(
    async (newMessage: string) => {
      const { destinationType, destination } = getChannelDestination(selectedChannel);
      await messageApi.messageCreate_Post({
        destinationType,
        destination,
        message: {
          clientId: undefined as any,
          content: newMessage,
        },
      });
      refetchMessages();
    },
    [addMessages, refetchMessages]
  );
  return { messagesLoading, messages, postMessage };
}
