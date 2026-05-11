import { useLocation } from "@/jsreact/preact-iso";

export function usePathname(getPathname: () => string, replace?: boolean) {
  const { route } = useLocation();
  const pathname = getPathname();
  if (window.location.pathname !== pathname) {
    route(pathname, replace);
  }
}
