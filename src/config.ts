import { Configuration, ConfigurationParameters } from "@/api";
import { AuthMiddleware } from "@/api/middlewares/BearerAuthMiddleware";
import { AuthContext } from "@/hooks/useAuth";

const env = import.meta.env;
export const CHAT_DEFAULT_PAGE_SIZE = env.CHAT_DEFAULT_PAGE_SIZE ? +env.CHAT_DEFAULT_PAGE_SIZE : 100;
export const CHAT_FETCH_SCROLL_DISTANCE_PX = 50;
export const API_PATH = "/api";
export const API_STOMP_PROTOCOL = location.protocol.startsWith("https") ? "wss:" : "ws:";
export const API_STOMP_HOST = location.host.startsWith("localhost:") ? "localhost:8080" : location.host;
export const API_STOMP_PATH = `${API_STOMP_PROTOCOL}//${API_STOMP_HOST}/websocket`;

const baseConfiguration: ConfigurationParameters = {basePath: location.origin};
export function getAuthConfig(): Configuration {
    return new Configuration(baseConfiguration);
}
export function getAuthConfigWithBearer(authContext: AuthContext): Configuration {
    return new Configuration({
        ...baseConfiguration,
        middleware: [new AuthMiddleware(authContext)]
    });
}
