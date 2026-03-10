import { FC } from "react";
import { render } from "preact";
import { LocationProvider, Router } from "preact-iso";
import "./styles.css";
import { AuthContextProvider } from "./hooks/useAuth";
import { AuthRoute, routes } from "./routes";

export const App: FC = () => {
  return (
    <LocationProvider>
      <AuthContextProvider>
        <Router>
          {routes.map((route, i) => (
            <AuthRoute key={i} {...route} />
          ))}
        </Router>
      </AuthContextProvider>
    </LocationProvider>
  );
};
render(<App />, document.querySelector("#app")!);
