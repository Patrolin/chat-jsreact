import { RouteProps } from "preact-iso";
import { NotFoundPage } from "./pages/NotFoundPage";
import { LoginPage } from "./pages/LoginPage";
import { WelcomePage } from "./pages/WelcomePage";
import { ClientPage } from "./pages/ClientPage";

export type AppRoute = RouteProps<any> & {
  label: string;
};
/* See https://preactjs.com/guide/v10/preact-iso/#path-segment-matching */
export const routes: AppRoute[] = [
  {
    label: "Dashboard",
    path: "/",
    component: WelcomePage,
  },
  {
    label: "Login",
    path: "/login",
    component: LoginPage,
  },
  {
    label: "Client",
    path: "/client/:id*",
    component: ClientPage,
  },
  {
    label: "Not found",
    default: true,
    component: NotFoundPage,
  },
];
