import { createContext, FC, Fragment, PropsWithChildren, useContext, useReducer, useRef } from "react";

// LocationContext
function route(url: string, replace?: boolean): void {
  const [_, rerender] = useReducer((v) => v, undefined);
  if (replace) window.history.replaceState(undefined, "", url);
  else window.history.pushState(undefined, "", url);
  rerender();
}
type LocationContextType = {
  pathname: string;
  url: string;
  query: Record<string, string>;
  route: typeof route;
};
const LocationContext = createContext<LocationContextType | undefined>(undefined);

// LocationProvider
type LocationProviderProps = PropsWithChildren<{}>;
export const LocationProvider: FC<LocationProviderProps> = (props) => {
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
      let patternOffset = 0;
      let matchOffset = 0;
      let isMatchingPath = true;
      while (patternOffset < path.length || matchOffset < pathname.length) {
        const pattern = path.slice(patternOffset).match(/:([^:/]*)/);
        const stringEnd = pattern != null ? pattern.index! : Infinity;
        isMatchingPath &&= path.slice(patternOffset, patternOffset + stringEnd) === pathname.slice(matchOffset, matchOffset + stringEnd);
        if (pattern == null) break;
        const match = pathname.slice(matchOffset).slice(pattern.index).match(/[^/]*/)!;
        newParams[pattern[1]] = match[0];
        patternOffset += pattern.index! + pattern[0].length;
        matchOffset += pattern.index! + match[0].length;
      }
      if (isMatchingPath) {
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
