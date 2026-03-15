import { ApiClient } from "@/api/ApiClient";
import { Icon } from "@/components/Icon";
import { SideViewItem } from "@/components/SideViewItem";
import { useChangeState } from "@/hooks/useChangeState";
import { useCommon } from "@/hooks/useCommon";
import { useGetRequest } from "@/hooks/useGetRequest";
import { FC } from "react";

function isVisibleInSideView(label: string, search: string) {
  return search === "" || label.toLowerCase().includes(search);
}
export const ClientPage: FC = () => {
  // static data
  const { authContext, currentUser } = useCommon();
  const apiClient = new ApiClient(authContext);
  const [usersLoading, users] = useGetRequest({
    defaultValue: [],
    fetch: async () => {
      const rawResponse = await apiClient.listUsers();
      return (await rawResponse.json()) as any[];
    },
  });
  const [channelsLoading, channels] = useGetRequest({
    defaultValue: [],
    fetch: async () => {
      const rawResponse = await apiClient.listChannels();
      return (await rawResponse.json()) as any[];
    },
  });
  // selected view
  enum ChannelType {
    User = "User",
    Public = "Public",
  }
  type UserChannel = { type: ChannelType.User; username: string };
  type PublicChannel = { type: ChannelType.Public; id: number; name: string };
  type Channel = UserChannel | PublicChannel;
  const [state, changeState] = useChangeState({
    selectedView: ChannelType.User,
    search: "",
    selectedChannel: { type: ChannelType.User, username: currentUser } as Channel,
    newMessage: "",
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
  const [messagesLoading, messages] = useGetRequest({
    fetch: async () => {
      if (state.selectedChannel?.type === ChannelType.User) {
        const rawResponse = await apiClient.listUserMessages({ username: state.selectedChannel.username, page: 0 });
        const response = await rawResponse.json();
        return response as any[];
      } else {
        const rawResponse = await apiClient.listChannelMessages({ channelId: state.selectedChannel.id, page: 0 });
        const response = await rawResponse.json();
        return response as any[];
      }
    },
  });
  console.log("ayaya.ClientPage", state);
  const channelTypeOptions: { value: ChannelType; label: string }[] = [
    { value: ChannelType.Public, label: "Channels" },
    { value: ChannelType.User, label: "Users" },
  ];
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
        <div className="flex-1 flex flex-col-reverse overflow-y-auto px-4 py-2 w-full">
          <div className="flex flex-col">..TODO: messages</div>
        </div>
        <div className="bg-white border-t border-gray-300 pt-2 p-4 flex-shrink-0">
          <div className="flex mt-1 overflow-y-auto" />
          <div className="flex mt-2">
            <input className="hidden" type="file" multiple />
            <button className="border border-r-0 border-gray-300 hover:bg-gray-100 rounded-l-lg px-2 flex items-center focus:outline-none">
              <Icon className="text-4xl" name="attach_file" />
            </button>
            <textarea
              style={{ fieldSizing: "content" }}
              className="flex-1 border border-l-0 border-gray-300 pl-1 pr-4 py-2 focus:outline-none resize-none text-area"
              autoFocus
              placeholder="Type your message..."
              onChange={(event) => changeState({ newMessage: event.target.value })}
            />
            <button className="bg-blue-500 hover:bg-blue-600 text-white px-2 flex items-center rounded-r-lg focus:outline-none">
              <Icon className="text-4xl" name="send" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
