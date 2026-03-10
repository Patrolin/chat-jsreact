import { RouteProps } from "preact-iso";
import { DashboardPage } from "./pages/DashboardPage";
import { NotFoundPage } from "./pages/NotFoundPage";
import { LoginPage } from "./pages/LoginPage";

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
    label: "Login",
    path: "/login",
    component: LoginPage,
  },
  {
    label: "Not found",
    default: true,
    component: NotFoundPage,
  },
];
