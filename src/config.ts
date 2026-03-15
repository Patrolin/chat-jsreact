
const isLocalhost = location.host.startsWith("localhost");
export const CHAT_BASE_ORIGIN = import.meta.env.CHAT_BASE_ORIGIN || (isLocalhost ? "http://localhost:8080" : location.origin);
export const CHAT_BASE_HOST = import.meta.env.CHAT_BASE_HOST || (isLocalhost ? "localhost:8080" : location.host);
export const CHAT_DEFAULT_PAGE_SIZE = import.meta.env.CHAT_DEFAULT_PAGE_SIZE ? +import.meta.env.CHAT_DEFAULT_PAGE_SIZE : 100;

export const API_LOCATION = `${CHAT_BASE_ORIGIN}/api`;
