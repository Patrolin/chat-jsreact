export const CHAT_BASE_ORIGIN = import.meta.env.CHAT_BASE_ORIGIN || location.origin;
export const CHAT_BASE_HOST = import.meta.env.CHAT_BASE_HOST || location.host;
export const CHAT_DEFAULT_PAGE_SIZE = import.meta.env.CHAT_DEFAULT_PAGE_SIZE ? +import.meta.env.CHAT_DEFAULT_PAGE_SIZE : 100;

export const API_LOCATION = `${CHAT_BASE_ORIGIN}/api`;
