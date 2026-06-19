/** Centralized app routes to avoid hardcoded URLs in components. */
export const routes = {
  home: "/login",
  login: "/login",
  dashboard: "/dashboard",
  map: "/map",
  details: "/dashboard#info",
  risk: "/dashboard#risk",
  calendar: "/dashboard#calendar",
  media: "/dashboard#media",
  files: "/dashboard#files",
} as const;

export type AppRoute = (typeof routes)[keyof typeof routes];
