import type { RouterClient } from "@orpc/server";
import { createApp } from "./core/app";
import { market } from "./routes/market";
import { chats } from "./routes/chats";
import { ping } from "./routes/ping";

// API features are oRPC procedures, one file per feature in ./routes/,
// composed into this router — typed end-to-end via the client
// (web: src/web/lib/api.ts).
// Keep each routes/ file under 500 lines; split into more feature files as they grow.
export const router = {
  ping,
  market,
  chats,
};

export type AppRouter = typeof router;
/** Typed client for the router — used by the web and mobile api clients. */
export type AppRouterClient = RouterClient<AppRouter>;

const app = createApp(router);
// Rare plain-HTTP endpoints (webhooks, streaming) register here with full
// paths, e.g. app.post("/api/webhooks/example", ...)

export default app;
