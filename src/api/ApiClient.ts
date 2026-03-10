import { API_LOCATION, CHAT_DEFAULT_PAGE_SIZE } from "@/config";
import { isTokenExpired, AuthContext } from "@/hooks/useAuth";

export class ApiClient {
    static Event = {
        TOKEN_EXPIRED: "tokenExpired"
    };
    authContext: AuthContext;
    refreshTokenLock: Promise<Response> | undefined;
    constructor(authContext: AuthContext) {
        this.authContext = authContext;
        this.refreshTokenLock = undefined;
    }
    async listUsers() {
        return await this.fetch("/user/list");
    }
    async listChannels() {
        return await this.fetch("/channel/list");
    }
    async listChannelMessages({channelId, size = CHAT_DEFAULT_PAGE_SIZE, page = 0}: any) {
        return await this.fetch("/message/channel/list", {channelId, size, page});
    }
    async listChannelMessagesFromMessageId({channelId, messageId, size = CHAT_DEFAULT_PAGE_SIZE, page = 0}: any) {
        return await this.fetch("/message/channel/list", {channelId, messageId, size, page});
    }
    async editChannelMessage({messageId, content}: any) {
        return await this.post("/message/channel/edit", {messageId, content})
    }
    async deleteChannelMessage({messageId}: any) {
        return await this.post("/message/channel/delete", {messageId});
    }
    async listUserMessages({username, size = CHAT_DEFAULT_PAGE_SIZE, page = 0}: any) {
        return await this.fetch("/message/user/list", {username, size, page});
    }
    async listUserMessagesFromMessageId({username, messageId, size = CHAT_DEFAULT_PAGE_SIZE, page = 0}: any) {
        return await this.fetch("/message/user/list", {username, messageId, size, page});
    }
    async editUserMessage({messageId, content}: any) {
        return await this.post("/message/user/edit", {messageId, content});
    }
    async deleteUserMessage({messageId}: any) {
        return await this.post("/message/user/delete", {messageId});
    }
    async deleteUserMessageAttachment({attachmentId}: any) {
        return await this.post("/attachment/user/delete", {attachmentId});
    }
    async deleteChannelMessageAttachment({attachmentId}: any) {
        return await this.post("/attachment/channel/delete", {attachmentId});
    }
    async requestToken(username: string, password: string) {
        return await this.post("/auth/login", {username, password});
    }
    async refreshToken(token: string) {
        return await this.post("/auth/refreshToken", {token: token});
    }
    async post(endpoint: string, data: Record<string, any>) {
        return await this.fetch(endpoint, data, "POST");
    }
    async fetch(endpoint: string, data: Record<string, any> = {}, method = "GET" as "GET"|"POST") {
        // refresh token if necessary
        let token = this.authContext.data.current?.token;
        if (token != null && isTokenExpired(token)) {
            // NOTE: fetch() happens concurrently, but we only ever want one thread to refresh the token
            if (this.refreshTokenLock == null) {
                this.refreshTokenLock = this.refreshToken(token);
                const newToken = await (await this.refreshTokenLock).text();
                this.refreshTokenLock = undefined;
                this.authContext.setData({token: newToken});
            } else {
                await this.refreshTokenLock;
            }
        }
        token = this.authContext.data.current?.token;
        // do the request
        let url = API_LOCATION + endpoint;
        let headers: HeadersInit = {};
        let fetchOptions: RequestInit = {method};
        if (token) headers["Authorization"] = `Bearer ${token}`;
        if (method === "GET") {
            url += `?${new URLSearchParams(data)}`;
        } else if (method === "POST") {
            headers["Content-Type"] = "application/json";
            fetchOptions.body = JSON.stringify(data);
        }
        fetchOptions.headers = headers;
        const response = await fetch(url, fetchOptions);
        if (!response.ok) {
            const error = new Error(`${response.status} ${response.statusText}`);
            (error as any).response = response;
            throw error;
        };
        return response;
    }
}
