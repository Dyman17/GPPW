import { handle } from "hono/vercel";
import app from "../src/api";

// Vercel deploys this file as the `/api` function (non-Next projects have no
// file-based catch-all, so ALL /api/* paths are funneled here by the rewrite
// in apps/site/vercel.json). Hono then routes them to the oRPC procedures
// (/api/rpc/*). Data is served from an in-memory mock store — no database.
const handler = handle(app);

export const GET = handler;
export const POST = handler;
export const PUT = handler;
export const PATCH = handler;
export const DELETE = handler;
export const OPTIONS = handler;
export const HEAD = handler;
