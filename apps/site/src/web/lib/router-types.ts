import type { RouterClient } from "@orpc/server";
import type { AppRouter } from "../../api";

/** Keep browser-side router types separate from the server implementation. */
export type AppRouterClient = RouterClient<AppRouter>;
