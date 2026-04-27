import { ChannelControllerApi, OutboundChatMessage, UserControllerApi } from "@/api";
import { Icon } from "@/components/Icon";
import { LoadingSpinner } from "@/components/LoadingSpinner";
import { Message, NewAttachment } from "@/components/Message";
import { SideViewItem } from "@/components/SideViewItem";
import { getAuthConfigWithBearer } from "@/config";
import { useChangeState } from "@/hooks/useChangeState";
import { useCommon } from "@/hooks/useCommon";
import { useGetRequest } from "@/hooks/useGetRequest";
import { MessagesChannel, ChannelType, PublicChannel, useMessages, UserChannel } from "@/hooks/useMessages";
import { FC, useCallback, useRef } from "react";

function isVisibleInSideView(label: string, search: string) {
  return search === "" || label.toLowerCase().includes(search);
}
export const ClientPage: FC = () => {
  // static data
  const { authContext, currentUser } = useCommon();
  const userApi = new UserControllerApi(getAuthConfigWithBearer(authContext));
  const [usersLoading, users] = useGetRequest({
    defaultValue: [],
    fetch: async () => {
      return await userApi.userList_Get();
    },
  });
  const channelApi = new ChannelControllerApi(getAuthConfigWithBearer(authContext));
  const [channelsLoading, channels] = useGetRequest({
    defaultValue: [],
    fetch: async () => {
      return await channelApi.channelList_Get();
    },
  });
  // selected view
  const [state, changeState] = useChangeState({
    selectedView: ChannelType.User,
    search: "",
    selectedChannel: { type: ChannelType.User, username: currentUser } as MessagesChannel,
    newText: "",
    newFiles: [] as File[],
    messageToEdit: undefined as OutboundChatMessage | undefined,
  });
  const sideView: React.ReactNode = (() => {
    if (state.selectedView === ChannelType.User) {
      return users.map((user: any, i) => {
        const { username, displayName } = user;
        if (!isVisibleInSideView(displayName, state.search)) return undefined;
        const isSelected = username === (state.selectedChannel as UserChannel).username;
        const isYou = username === currentUser;
        const isOnline = false;
        return (
          <SideViewItem
            key={i}
            selected={isSelected}
            onClick={() =>
              changeState({
                selectedChannel: { type: ChannelType.User, username },
              })
            }
          >
            <span>
              {displayName}
              {isYou ? " (You)" : ""}
            </span>
            <span className={`rounded-full px-2 py-2 text-white font-bold ${isOnline ? "bg-purple-500" : "bg-red-500"}`}>
              {isOnline ? "online" : "offline"}
            </span>
          </SideViewItem>
        );
      });
    } else {
      return channels.map((channel: any, i) => {
        const { id, name } = channel;
        if (!isVisibleInSideView(name, state.search)) return undefined;
        const isSelected = (state.selectedChannel as PublicChannel).id === id;
        return (
          <SideViewItem
            key={i}
            selected={isSelected}
            onClick={() =>
              changeState({
                selectedChannel: { type: ChannelType.Public, id, name },
              })
            }
          >
            <span>{name}</span>
          </SideViewItem>
        );
      });
    }
  })();
  // messages
  const selectedChannelName = (() => {
    if (state.selectedChannel.type === ChannelType.User) {
      const { username } = state.selectedChannel;
      return username === currentUser ? `Chatting with yourself` : `Chatting with ${username}`;
    } else {
      return `Chatting in ${state.selectedChannel.name}`;
    }
  })();
  const { messagesLoading, messages, submitMessage, messagesOnScroll, deleteMessage, deleteAttachment } = useMessages(
    authContext,
    state.selectedChannel
  );
  console.log("ayaya.ClientPage", state);
  const channelTypeOptions: { value: ChannelType; label: string }[] = [
    { value: ChannelType.Public, label: "Channels" },
    { value: ChannelType.User, label: "Users" },
  ];
  const addFiles = useCallback(
    (newFiles: File[]) => {
      changeState({
        newFiles: [...state.newFiles, ...newFiles],
      });
    },
    [state]
  );
  const removeFile = useCallback(
    (index: number) => {
      const newFiles = [...state.newFiles];
      newFiles.splice(index, 1);
      changeState({ newFiles });
    },
    [state]
  );
  const getFileInput = () => document.querySelector<HTMLInputElement>("input[type='file']");
  const inputRef = useRef<HTMLTextAreaElement | null>(null);
  const onSubmit = useCallback(() => {
    const inputElement = inputRef.current;
    if (inputElement && state.newText) {
      submitMessage(state.newText, state.newFiles, state.messageToEdit);
      inputElement.value = "";
      changeState({ newText: "", newFiles: [], messageToEdit: undefined });
    }
  }, [state, submitMessage]);
  return (
    <div className="bg-gray-100 flex h-screen">
      <div className="z-80 bg-gray-100 border-r border-gray-300 md:p-4 p-2 md:block hidden md:w-1/4 w-full md:relative fixed h-full overflow-y-auto">
        <div className="flex justify-between items-center mb-4">
          <div className="flex">
            {channelTypeOptions.map((option, i) => {
              const isSelected = state.selectedView === option.value;
              return (
                <h2
                  key={i}
                  className={`text-lg md:text-md hover:bg-blue-600 rounded-full cursor-pointer px-4 py-2 mr-2 text-white font-bold ${isSelected ? "bg-blue-500" : "bg-blue-400"}`}
                  onClick={() => changeState({ selectedView: option.value })}
                >
                  {option.label}
                </h2>
              );
            })}
          </div>
        </div>
        <div>
          <input
            className="rounded-lg border-b-2 border-gray-300 focus:border-blue-500 focus:outline-none w-full p-2 mb-2"
            type="text"
            placeholder={state.selectedView === ChannelType.User ? "Search users..." : "Search channels..."}
            onInput={(event) => changeState({ search: (event.target as HTMLInputElement).value })}
          />
          {sideView}
        </div>
      </div>
      <div className="flex-1 flex flex-col md:w-3/4 w-full">
        <div className="bg-white border-b border-gray-300 md:p-4 p-2 flex justify-between items-center">
          <h2 className="text-lg font-bold">{selectedChannelName}</h2>
        </div>
        <div className="flex-1 flex flex-col-reverse overflow-y-auto px-4 py-2 w-full" onScroll={messagesOnScroll}>
          <div className="flex flex-col">
            {messagesLoading ? (
              <LoadingSpinner className="mx-auto mb-2 text-black" />
            ) : (
              messages.map((message, i) => (
                <Message
                  key={i}
                  message={message}
                  currentUser={currentUser}
                  startEditingMessage={(message) => changeState({ messageToEdit: message })}
                  onDeleteMessage={(message) => deleteMessage(message)}
                  onDeleteAttachment={(attachment) => deleteAttachment(message, attachment)}
                />
              ))
            )}
          </div>
        </div>
        <form
          className="bg-white border-t border-gray-300 pt-2 p-4 flex-shrink-0"
          onSubmit={(event) => {
            event.preventDefault();
            onSubmit();
          }}
        >
          {state.messageToEdit && (
            <div className="flex items-center text-sm">
              <button onClick={() => changeState({ messageToEdit: undefined })}>
                <Icon name="cancel" className="text-red-500 text-lg" />
              </button>
              <p className="ml-2 font-semibold">Editing message</p>
            </div>
          )}
          <div className="flex mt-1 overflow-y-auto">
            {state.newFiles.map((newFile, i) => (
              <NewAttachment key={i} attachment={{ filename: newFile.name, size: newFile.size }} onRemove={() => removeFile(i)} />
            ))}
          </div>
          <div className="flex mt-2">
            <input
              className="hidden"
              /* NOTE: recreate the file input each time, so that the user can add back files after removing them! */
              key={state.newFiles.length}
              type="file"
              multiple
              onInput={(event) => {
                const newFiles = [...(event.target as any).files] as File[];
                addFiles(newFiles);
              }}
              {...{
                onCancel: () => {
                  // user selected the same files again
                },
              }}
            />
            <button
              className="border border-r-0 border-gray-300 hover:bg-gray-100 rounded-l-lg px-2 flex items-center focus:outline-none"
              onClick={() => {
                getFileInput()?.click();
              }}
            >
              <Icon name="attach_file" />
            </button>
            <textarea
              ref={inputRef}
              style={{ fieldSizing: "content" }}
              className="flex-1 border border-l-0 border-gray-300 pl-1 pr-4 py-2 focus:outline-none resize-none text-area"
              autoFocus
              placeholder="Type your message..."
              onInput={(event) => changeState({ newText: (event.target as HTMLTextAreaElement).value })}
              onKeyDown={(event) => {
                if (event.key === "Enter") {
                  if (!event.shiftKey) {
                    event.preventDefault();
                    onSubmit();
                  }
                }
              }}
            />
            <button
              className="bg-blue-500 hover:bg-blue-600 text-white px-3 flex items-center rounded-r-lg focus:outline-none"
              type="submit"
            >
              <Icon name="send" />
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
