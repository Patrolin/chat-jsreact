import { ApiClient } from "@/api/ApiClient";
import { LoadingSpinner } from "@/components/LoadingSpinner";
import { useAuthContext } from "@/hooks/useAuth";
import { FC, useState } from "react";

export const LoginPage: FC = () => {
  const onError = (error: any) => console.error(error);
  const authContext = useAuthContext();
  const apiClient = new ApiClient(authContext);

  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const onSubmit = async (event: React.SubmitEvent) => {
    event.preventDefault();
    if (isSubmitting) return;

    setIsSubmitting(true);
    await Promise.try(async () => {
      const response = await apiClient.requestToken(username, password);
      const newToken = await response.text();
      authContext.setData({ token: newToken });
    }).catch(onError);
    setIsSubmitting(false);
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
              value={username}
              onChange={(event) => setUsername(event.target.value)}
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
              value={password}
              onChange={(event) => setPassword(event.target.value)}
            />
          </div>
          <div className="mb-4" id="login-error" style={{ display: "none" }}>
            <p className="text-red-500 text-md italic" id="error-message">
              Incorrect username or password. Please try again.
            </p>
          </div>
          <div className="flex items-center justify-center">
            <button
              className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline flex items-center"
              type="submit"
              id="login-button"
            >
              <LoadingSpinner className="mr-2" loading={isSubmitting} />
              <span>Login</span>
            </button>
          </div>
        </div>
      </form>
    </div>
  );
};
