import { Hono } from "hono";
import { cors } from "hono/cors";
import { os } from "@orpc/server";
import { auth, baseURL } from "../auth";

/** Per-request context available in every procedure. */
export interface RpcContext {
  headers: Headers;
}

/** Base oRPC procedure builder. */
export const base = os.$context<RpcContext>();

/**
 * oRPC is the API layer: define procedures on the `router` in src/api/index.ts;
 * they are served at /api/rpc/* and called through the typed clients
 * (web: src/web/lib/api.ts).
 *
 * Hono is only the HTTP mount. Rare plain routes (webhooks, streaming
 * responses, the Better Auth handler) register directly on the app returned
 * by createApp, with full /api/... paths.
 */

/** Assembles the Hono HTTP mount for Better Auth and health checks. */
export function createApp() {
  const app = new Hono().use(
    cors({
      origin: (origin) => (origin === baseURL ? origin : ""),
      credentials: true,
    }),
  );

  app.get("/api/health", (c) => c.json({ status: "ok" }, 200));
  app.on(["GET", "POST"], "/api/auth/*", (c) => auth.handler(c.req.raw));

  return app;
}
