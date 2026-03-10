import { FC } from "react";
import { Route, RouteProps } from "preact-iso";
import { DashboardPage } from "./pages/DashboardPage";
import { useAuth } from "./hooks/useAuth";
import { NotFoundPage } from "./pages/NotFoundPage";

export type AppRoute = RouteProps<any> & {
  label: string;
};
export const routes: AppRoute[] = [
  {
    label: "Dashboard",
    path: "/",
    component: DashboardPage,
  },
  {
    label: "Not found",
    default: true,
    component: NotFoundPage,
  },
];
export const AuthRoute: FC<AppRoute> = (props) => {
  const [auth] = useAuth();
  document.title = props.label;
  console.log("ayaya.auth", auth);
  return <Route {...props} />;
};
