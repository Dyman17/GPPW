import { handle } from "@hono/node-server/vercel";
import app from "../src/api";

// Vercel serverless entrypoint. Vercel routes every /api/* request here
// (file-based catch-all), and Hono serves the oRPC procedures at /api/rpc/*
// and the Better Auth handler at /api/auth/*.
export const config = { api: { bodyParser: false } };

export default handle(app);
