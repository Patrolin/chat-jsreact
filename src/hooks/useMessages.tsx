import { MessageControllerApi, OutboundChatMessage } from "@/api";
import { CHAT_DEFAULT_PAGE_SIZE, CHAT_FETCH_SCROLL_DISTANCE_PX, getAuthConfigWithBearer } from "@/config";
import { AuthContext } from "./useAuth";
import { useGetRequest } from "./useGetRequest";
import { FC, useCallback, useMemo, useReducer, useState } from "react";
import { useChangeState } from "./useChangeState";
import { Icon } from "@/components/Icon";
import { useClickAway } from "./useClickAway";

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
  // TODO: reducer and keep all channels?
  // get messages
  const messageApi = new MessageControllerApi(getAuthConfigWithBearer(authContext));
  const [messagesLoading, defaultMessages] = useGetRequest({
    defaultValue: [],
    fetch: async (signal) => {
      const { destinationType, destination } = getChannelDestination(selectedChannel);
      const response = await messageApi.messageList_Get(
        {
          destinationType,
          destination,
          pageable: { page: 0, size: CHAT_DEFAULT_PAGE_SIZE, sort: undefined as any },
        },
        { signal }
      );
      return response.messages;
    },
    refetchOn: [JSON.stringify(selectedChannel)],
  });
  const messages = useMemo(() => (messagesLoading ? [] : [...defaultMessages]), [messagesLoading, defaultMessages]);

  // callbacks
  type NewMessages = {
    atEnd: boolean;
    messages: OutboundChatMessage[];
  };
  const [_, forceRerender] = useReducer((v) => v, undefined);
  const addMessages = useCallback(
    (newMessages: NewMessages) => {
      if (newMessages.atEnd) {
        messages.splice(messages.length, 0, ...newMessages.messages);
      } else {
        messages.splice(0, 0, ...newMessages.messages);
      }
      forceRerender();
    },
    [messages, forceRerender]
  );
  const submitMessage = useCallback(
    async (newMessage: string) => {
      const { destinationType, destination } = getChannelDestination(selectedChannel);
      const response = await messageApi.messageCreate_Post({
        destinationType,
        destination,
        message: { content: newMessage },
      });
      addMessages({ atEnd: true, messages: [response] });
    },
    [addMessages]
  );

  // onScroll
  const [state, changeState] = useChangeState({
    isFetchingMoreMessages: false,
    haveAllMessages: false,
  });
  if (defaultMessages.length < CHAT_DEFAULT_PAGE_SIZE) {
    changeState({ haveAllMessages: true }, false);
  }
  const messagesOnScroll = useCallback(
    async (event: React.WheelEvent<HTMLDivElement>) => {
      const element = event.target as HTMLDivElement;
      const scrollY = -element.scrollTop;
      const scrollHeight = element.scrollHeight - element.clientHeight - 1;
      const scrollFromTop = scrollHeight - scrollY;
      if (scrollFromTop < CHAT_FETCH_SCROLL_DISTANCE_PX) {
        if (state.isFetchingMoreMessages || state.haveAllMessages) return;
        changeState({ isFetchingMoreMessages: true }, false);
        const { destinationType, destination } = getChannelDestination(selectedChannel);
        // TODO: abort the request if necessary
        const response = await messageApi.messageList_Get({
          destinationType,
          destination,
          messageId: messages[0].id,
          pageable: { page: 0, size: CHAT_DEFAULT_PAGE_SIZE, sort: undefined as any },
        });
        const newMessages = response.messages;
        changeState({ isFetchingMoreMessages: false, haveAllMessages: newMessages.length < CHAT_DEFAULT_PAGE_SIZE }, false);
        addMessages({ atEnd: false, messages: newMessages });
      }
    },
    [state, addMessages]
  );
  return { messagesLoading, messages, submitMessage, messagesOnScroll };
}
type MessageProps = {
  message: OutboundChatMessage;
  currentUser: string;
};
export const Message: FC<MessageProps> = (props) => {
  const { message, currentUser } = props;
  const isSelf = message.author === currentUser;
  const [isSelected, setIsSelected] = useState(false);
  const onClickContextMenu = useClickAway((_event, inside) => setIsSelected(inside));
  return (
    <div className={`flex mb-2 ${isSelf ? "self-end text-white" : "items-start text-black"}`}>
      <div className={`rounded-lg p-2 md:max-w-xl max-w-sm ${isSelf ? "bg-blue-500" : "bg-gray-200"}`}>
        <div className={`relative text-sm font-semibold flex ${isSelf ? "justify-end" : "justify-start"}`}>
          {isSelected && (
            <div className="message-context-menu absolute right-5 bottom-0 w-48 bg-white rounded-md shadow-lg z-20">
              <ul className="py-1">
                {/* TODO: handle edit, delete message */}
                <p className="block text-sm px-4 py-2 text-gray-800 hover:bg-gray-100 cursor-pointer">Edit message</p>
                <p className="block text-sm px-4 py-2 text-gray-800 hover:bg-gray-100 cursor-pointer">Delete message</p>
              </ul>
            </div>
          )}
          <div>
            <span>{isSelf ? "You" : message.author}</span>
            <span className={`text-xs pl-2 font-normal ${isSelf ? "text-gray-200" : "text-gray-500"}`}>
              {message.timestamp.split("T")[0]}
            </span>
          </div>
          {isSelf && (
            <Icon name="more_vert" className="text-base pl-2 font-normal cursor-pointer font-semibold" onClick={onClickContextMenu} />
          )}
        </div>
        <p className="text-sm whitespace-pre-wrap break-words">{message.content}</p>
        {/* TODO: attachments */}
      </div>
    </div>
  );
};
