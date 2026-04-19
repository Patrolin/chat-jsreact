import { AttachmentControllerApi, AttachmentMetadataDto, MessageControllerApi, OutboundChatMessage } from "@/api";
import { CHAT_DEFAULT_PAGE_SIZE, CHAT_FETCH_SCROLL_DISTANCE_PX, getAuthConfigWithBearer } from "@/config";
import { AuthContext } from "./useAuth";
import { useCallback, useEffect, useReducer } from "react";

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
  const selectedChannelId = selectedChannel.type === ChannelType.User ? selectedChannel.username : String(selectedChannel.id);
  type MessagesUpdate =
    | { type: "isFetching"; channelId: string }
    | { type: "addMessages"; channelId: string; messages: OutboundChatMessage[]; isFetching?: boolean; haveAllMessages?: boolean }
    | { type: "deleteMessage"; channelId: string; message: OutboundChatMessage }
    | { type: "addAttachment"; channelId: string; message: OutboundChatMessage; attachment: AttachmentMetadataDto }
    | { type: "deleteAttachment"; channelId: string; message: OutboundChatMessage; attachment: AttachmentMetadataDto };
  type ChannelState = {
    messages: OutboundChatMessage[];
    isFetching: boolean;
    haveAllMessages: boolean;
  };
  const [channelStates, updateChannel] = useReducer(
    (prev, update: MessagesUpdate) => {
      const channelState = prev[update.channelId];
      switch (update.type) {
        case "isFetching":
          {
            channelState.isFetching = true;
          }
          break;
        case "addMessages":
          {
            const newMessages = [...channelState.messages, ...update.messages];
            newMessages.sort((a, b) => +a.timestamp - +b.timestamp);
            channelState.messages = newMessages;
            channelState.isFetching = update.isFetching ?? channelState.isFetching;
            channelState.haveAllMessages = update.haveAllMessages ?? channelState.haveAllMessages;
          }
          break;
        case "deleteMessage":
          {
            channelState.messages = channelState.messages.filter((v) => v.id !== update.message.id);
          }
          break;
        case "addAttachment":
          {
            update.message.attachments.push(update.attachment);
          }
          break;
        case "deleteAttachment":
          {
            update.message.attachments.filter((v) => v.id !== update.attachment.id);
          }
          break;
      }
      return prev;
    },
    {} as Record<string, ChannelState>
  );

  // set default value
  if (!(selectedChannelId in channelStates)) {
    channelStates[selectedChannelId] = {
      messages: [],
      isFetching: false,
      haveAllMessages: false,
    };
  }

  // load initial messages
  const messageApi = new MessageControllerApi(getAuthConfigWithBearer(authContext));
  const attachmentApi = new AttachmentControllerApi(getAuthConfigWithBearer(authContext));
  useEffect(() => {
    const asyncCallback = async () => {
      const channelState = channelStates[selectedChannelId];
      if (channelState.messages.length > 0 || channelState.haveAllMessages) return;
      updateChannel({ type: "isFetching", channelId: selectedChannelId });
      const { destinationType, destination } = getChannelDestination(selectedChannel);
      const { messages } = await messageApi.messageList_Get({
        destinationType,
        destination,
        pageable: { page: 0, size: CHAT_DEFAULT_PAGE_SIZE, sort: undefined as any },
      });
      updateChannel({
        type: "addMessages",
        channelId: selectedChannelId,
        messages,
        isFetching: false,
        haveAllMessages: messages.length < CHAT_DEFAULT_PAGE_SIZE,
      });
    };
    asyncCallback();
  }, [JSON.stringify(selectedChannel)]);

  // callbacks
  const submitMessage = useCallback(
    async (newMessage: string, newFiles: File[]) => {
      const { destinationType, destination } = getChannelDestination(selectedChannel);
      const message = await messageApi.messageCreate_Post({
        destinationType,
        destination,
        message: { content: newMessage },
      });
      updateChannel({ type: "addMessages", channelId: selectedChannelId, messages: [message] });
      const messageId = message.id;
      for (const newFile of newFiles) {
        const attachment = await attachmentApi.attachmentUpload_Post({
          messageId,
          attachment: newFile,
        });
        updateChannel({ type: "addAttachment", channelId: selectedChannelId, message, attachment });
      }
    },
    [updateChannel]
  );
  const deleteMessage = useCallback(
    async (message: OutboundChatMessage) => {
      await messageApi.messageDelete_Post({ messageId: message.id });
      updateChannel({ type: "deleteMessage", channelId: selectedChannelId, message });
    },
    [updateChannel]
  );
  const _addAttachment = useCallback(
    (message: OutboundChatMessage, attachment: AttachmentMetadataDto) => {
      updateChannel({ type: "addAttachment", channelId: selectedChannelId, message, attachment });
    },
    [updateChannel]
  );
  const deleteAttachment = useCallback(
    async (message: OutboundChatMessage, attachment: AttachmentMetadataDto) => {
      await attachmentApi.attachmentDelete_Post({ attachmentId: attachment.id });
      updateChannel({ type: "deleteAttachment", channelId: selectedChannelId, message, attachment });
    },
    [updateChannel]
  );

  // onScroll
  const messagesOnScroll = useCallback(
    async (event: React.WheelEvent<HTMLDivElement>) => {
      const element = event.target as HTMLDivElement;
      const scrollY = -element.scrollTop;
      const scrollHeight = element.scrollHeight - element.clientHeight - 1;
      const scrollFromTop = scrollHeight - scrollY;
      if (scrollFromTop < CHAT_FETCH_SCROLL_DISTANCE_PX) {
        const channelState = channelStates[selectedChannelId];
        if (channelState.isFetching || channelState.haveAllMessages) return;
        updateChannel({ type: "isFetching", channelId: selectedChannelId });
        const { destinationType, destination } = getChannelDestination(selectedChannel);
        const oldMessages = channelStates[destination].messages;
        if (oldMessages.length === 0) return;
        const oldestMessage = oldMessages[0];
        const response = await messageApi.messageList_Get({
          destinationType,
          destination,
          messageId: oldestMessage.id,
          pageable: { page: 0, size: CHAT_DEFAULT_PAGE_SIZE, sort: undefined as any },
        });
        const newMessages = response.messages;
        updateChannel({
          type: "addMessages",
          channelId: selectedChannelId,
          messages: response.messages,
          isFetching: false,
          haveAllMessages: newMessages.length < CHAT_DEFAULT_PAGE_SIZE,
        });
      }
    },
    [channelStates, updateChannel]
  );
  const { isFetching, messages } = channelStates[selectedChannelId];
  return { messagesLoading: isFetching, messages, submitMessage, messagesOnScroll, deleteMessage, deleteAttachment };
}
