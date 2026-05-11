import { createContext, FC, Fragment, PropsWithChildren, useCallback, useContext, useReducer, useRef } from "react";

// LocationContext
type LocationContextType = {
  pathname: string;
  url: string;
  query: Record<string, string>;
  route: (url: string, replace?: boolean) => void;
};
const LocationContext = createContext<LocationContextType | undefined>(undefined);

// LocationProvider
type LocationProviderProps = PropsWithChildren<{}>;
export const LocationProvider: FC<LocationProviderProps> = (props) => {
  const [_, forceRerender] = useReducer((v) => v, 1234);
  const route = useCallback(
    (url: string, replace?: boolean) => {
      if (replace) window.history.replaceState(undefined, "", url);
      else window.history.pushState(undefined, "", url);
      forceRerender();
    },
    [forceRerender]
  );
  const locationRef = useRef<LocationContextType>({
    pathname: "",
    url: "",
    query: {},
    route,
  });
  const path = window.location.pathname;
  locationRef.current.pathname = path;
  const search = window.location.search;
  const newUrl = path + search;
  if (newUrl !== locationRef.current.url) {
    const query = {} as Record<string, string>;
    for (let [k, v] of new URLSearchParams(search).entries()) {
      query[k] = v;
    }
    locationRef.current.query = query;
  }
  locationRef.current.url = newUrl;
  return <LocationContext value={locationRef.current} children={props.children} />;
};
export function useLocation(): LocationContextType {
  return useContext(LocationContext)!;
}

// router
type RoutableProps = { path: string; default?: false } | { path?: never; default: true };
export type RouteProps<Props> = RoutableProps & { component: React.JSXElementConstructor<Props> };
export const Route = Fragment as FC<RouteProps<any>>;

type RouterContextType = {
  path: string;
  params: Record<string, string>;
  url: string;
  query: Record<string, string>;
};
const RouterContext = createContext<RouterContextType | undefined>(undefined);
type RouterProps = {};
export const Router: FC<PropsWithChildren<RouterProps>> = (props) => {
  const routerRef = useRef<RouterContextType>({
    path: undefined as unknown as string,
    params: {},
    url: undefined as unknown as string,
    query: {},
  });
  // find matching route
  const { children } = props;
  if (!Array.isArray(children)) return;
  const { pathname, url, query } = useLocation();
  let newParams = {} as Record<string, string>;
  let selectedRoute: RouteProps<any> | undefined;
  let defaultRoute: RouteProps<any> | undefined;
  for (let child of children) {
    const route = child.props as RouteProps<any>;
    const { path, default: isDefault } = route;
    newParams = {};
    if (isDefault || path === "*") {
      defaultRoute = route;
    } else if (path) {
      let i = 0;
      let regex_str = "";
      const names: string[] = [];
      for (const match of path.matchAll(/\/:[^/]*/g)) {
        regex_str += path.slice(i, match.index);
        const pattern = match[0];
        let type = "";
        if (pattern.endsWith("*")) type = "*";
        if (pattern.endsWith("+")) type = "+";
        if (pattern.endsWith("?")) type = "?";
        names.push(type === "" ? pattern : pattern.slice(0, -1));
        regex_str += `((?:/[^/]*)${type})`;
        i = match.index + pattern.length;
      }
      regex_str += path.slice(i);
      const regex = new RegExp(`^${regex_str}$`);
      if (pathname.match(regex) != null) {
        selectedRoute = route;
      }
    }
  }
  if (selectedRoute == null) selectedRoute = defaultRoute;
  // set RouterContext
  if (pathname !== routerRef.current.path) {
    routerRef.current.path = pathname;
    routerRef.current.params = newParams;
  }
  if (url !== routerRef.current.url) {
    routerRef.current.url = url;
    routerRef.current.query = query;
  }
  const SelectedComponent = selectedRoute?.component;
  return <RouterContext value={routerRef.current}>{SelectedComponent && <SelectedComponent />}</RouterContext>;
};
