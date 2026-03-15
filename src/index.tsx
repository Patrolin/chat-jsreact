import { FC } from "react";
import { render } from "preact";
import { LocationProvider, Route, Router } from "preact-iso";
import "./styles.css";
import { AuthContextProvider, useAuthContext } from "./hooks/useAuth";
import { routes } from "./routes";
import { WelcomePage } from "./pages/WelcomePage";
import { LoginPage } from "./pages/LoginPage";

export const App: FC = () => {
  return (
    <LocationProvider>
      <AuthContextProvider>
        <Router>
          {routes.map((route, i) => (
            <Route
              key={i}
              {...route}
              component={() => {
                const auth = useAuthContext();
                document.title = route.label ?? "chat-jsreact";
                if (auth.state.token == null) {
                  if (route.path === "/") return <WelcomePage />;
                  else return <LoginPage />;
                }
                return <route.component />;
              }}
            />
          ))}
        </Router>
      </AuthContextProvider>
    </LocationProvider>
  );
};
render(<App />, document.querySelector("#app")!);
