import { FC } from "react";
import { render } from "preact";
import { LocationProvider, Route, Router } from "preact-iso";
import "./styles.css";
import { AuthContextProvider, useAuthContext } from "./hooks/useAuth";
import { routes } from "./routes";
import { LoginPage } from "./pages/LoginPage";
import { StompApiProvider } from "./api_stomp/StompApiProvider";

export const App: FC = () => {
  return (
    <LocationProvider>
      <AuthContextProvider>
        <StompApiProvider>
          <Router>
            {routes.map((route, i) => (
              <Route
                key={i}
                {...route}
                component={() => {
                  const auth = useAuthContext();
                  document.title = route.label ?? "chat-jsreact";
                  if (auth.state.token == null && route.path !== "/") return <LoginPage />;
                  return <route.component />;
                }}
              />
            ))}
          </Router>
        </StompApiProvider>
      </AuthContextProvider>
    </LocationProvider>
  );
};
render(<App />, document.querySelector("#app")!);
