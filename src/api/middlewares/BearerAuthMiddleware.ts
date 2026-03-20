import { getAuthConfig } from "@/config";
import { AuthenticationControllerApi, FetchParams, Middleware, RefreshTokenResponseDto, RequestContext, ResponseContext } from "../../api";
import { AuthContext } from "@/hooks/useAuth";

let refreshToken_lock: Promise<RefreshTokenResponseDto> | undefined;
export class AuthMiddleware implements Middleware {
  constructor(protected readonly authContext: AuthContext) {}
  async pre(context: RequestContext): Promise<FetchParams | void> {
    const headers = {...context.init.headers, Authorization: `bearer ${this.authContext.state.token}`};
    return { url: context.url, init: { ...context.init, headers: headers } };
  }
  async post(context: ResponseContext): Promise<Response | void> {
    if (context.response.status === 401) {
      try {
        // refresh the token
        const authApi = new AuthenticationControllerApi(getAuthConfig());
        const token = this.authContext.state.token;
        if (refreshToken_lock == null && token) {
          refreshToken_lock = authApi.authRefresh_token_Post({token});
        }
        const refreshToken_response = await refreshToken_lock;
        if (refreshToken_response) {
          this.authContext.setToken(refreshToken_response.token);
          refreshToken_lock = undefined;
        }
        // retry the request
        const headers = { ...context.init.headers, Authorization: `bearer ${this.authContext.state.token}` };
        return await context.fetch(context.url, { ...context.init, headers: headers });
      } catch (exc) {
        if (this.authContext.state.token != null) this.authContext.setToken(null);
        throw exc;
      }
    } else {
      return context.response;
    }
  }
}
