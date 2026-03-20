import { AuthenticationControllerApi } from "@/api";
import { LoadingSpinner } from "@/components/LoadingSpinner";
import { getAuthConfig } from "@/config";
import { useChangeState } from "@/hooks/useChangeState";
import { useCommon } from "@/hooks/useCommon";
import { FC } from "react";

export const LoginPage: FC = () => {
  const { authContext, route } = useCommon();
  const [state, changeState] = useChangeState({
    username: "",
    password: "",
    submitting: false,
    errorMessage: "",
  });
  const apiClient = new AuthenticationControllerApi(getAuthConfig());
  const onSubmit = async (event: React.SubmitEvent) => {
    event.preventDefault();
    if (state.submitting) return;

    changeState({ submitting: true });
    await Promise.try(async () => {
      const response = await apiClient.authLogin_Post({ username: state.username, password: state.password });
      authContext.setToken(response.token);
      route("/client");
    }).catch((error: any) => {
      const response = error.response as Response;
      if (response.status >= 400 && response.status < 500) {
        changeState({ errorMessage: "Incorrect username or password. Please try again." });
      } else {
        changeState({ errorMessage: `Error ${response.status}.` });
      }
    });
    changeState({ submitting: false });
  };
  return (
    <div className="bg-gray-100 flex items-center justify-center min-h-screen p-4">
      <form className="bg-white p-8 rounded-lg shadow-lg w-full max-w-2xl" onSubmit={onSubmit}>
        <h2 className="text-2xl font-bold mb-6 text-center">Login to OffRecord</h2>
        <div>
          <div className="mb-4">
            <label className="block text-gray-700 text-lg font-bold mb-2" htmlFor="username">
              Username
            </label>
            <input
              className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
              id="username"
              type="text"
              placeholder="Enter your username"
              autoFocus
              autoComplete="username"
              value={state.username}
              onChange={(event) => changeState({ username: event.target.value })}
            />
          </div>
          <div className="mb-2">
            <label className="block text-gray-700 text-lg font-bold mb-2" htmlFor="password">
              Password
            </label>
            <input
              className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 mb-3 leading-tight focus:outline-none focus:shadow-outline"
              id="password"
              type="password"
              placeholder="Enter your password"
              autoComplete="current-password"
              value={state.password}
              onChange={(event) => changeState({ password: event.target.value })}
            />
          </div>
          {state.errorMessage && (
            <div className="mb-4" id="login-error">
              <p className="text-red-500 text-md italic" id="error-message">
                {state.errorMessage}
              </p>
            </div>
          )}
          <div className="flex items-center justify-center">
            <button
              className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline flex items-center"
              type="submit"
              id="login-button"
            >
              <LoadingSpinner className="mr-2" loading={state.submitting} />
              <span>Login</span>
            </button>
          </div>
        </div>
      </form>
    </div>
  );
};
