type Handler = (req: Request) => Response | Promise<Response>;

let cached: Handler | undefined;
let cachedError: unknown;

async function getHandler(): Promise<Handler> {
  if (cached) return cached;
  if (cachedError) throw cachedError;
  try {
    const { handle } = await import("hono/vercel");
    const mod = await import("../src/api");
    cached = handle(mod.default);
    return cached;
  } catch (err) {
    cachedError = err;
    throw err;
  }
}

async function run(req: Request): Promise<Response> {
  try {
    const handler = await getHandler();
    return await handler(req);
  } catch (err) {
    const e = err as { stack?: string; message?: string; name?: string };
    const detail = [e?.name, e?.message, e?.stack].filter(Boolean).join("\n");
    return new Response("API_LOAD_ERROR:\n" + (detail || String(err)), {
      status: 500,
      headers: { "content-type": "text/plain; charset=utf-8" },
    });
  }
}

// Vercel deploys this file as the `/api` function. Non-Next projects have no
// file-based catch-all for /api/*, so the rewrite in vercel.json funnels every
// /api/* path here; the Hono app then routes them to the oRPC procedures.
export const GET = run;
export const POST = run;
export const PUT = run;
export const PATCH = run;
export const DELETE = run;
export const OPTIONS = run;
export const HEAD = run;
