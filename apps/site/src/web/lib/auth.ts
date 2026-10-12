import { createAuthClient } from "better-auth/react";
export function getToken() {
  return localStorage.getItem("mura-session") || "";
}
export const authClient = createAuthClient({
  baseURL: window.location.origin,
  basePath: "/api/auth",
  fetchOptions: { credentials: "omit", auth: { type: "Bearer", token: getToken } },
});
export function captureToken(ctx: { response: Response }) {
  const token = ctx.response.headers.get("set-auth-token");
  if (token) localStorage.setItem("mura-session", token);
}
