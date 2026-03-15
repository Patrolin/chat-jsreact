import { ApiClient } from "@/api/ApiClient";
import { useCommon } from "@/hooks/useCommon";
import { useGetRequest } from "@/hooks/useGetRequest";
import { FC } from "react";

export const ClientPage: FC = () => {
  const { authContext } = useCommon();
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
  console.log("ayaya.users", usersLoading, users);
  console.log("ayaya.channels", channelsLoading, channels);
  return "ClientPage";
};
