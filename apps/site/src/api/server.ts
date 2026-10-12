import { serve } from "@hono/node-server";
import { serveStatic } from "@hono/node-server/serve-static";
import type { Context } from "hono";
import { readFile } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import { closeDb, migrateDb, seedDemoListings } from "@gppw/db";
import app from "./index";

const migrationsFolder = fileURLToPath(new URL("../../../../packages/db/drizzle/", import.meta.url));
await migrateDb(migrationsFolder);
const seededCount = await seedDemoListings();
console.info(`Demo catalog ready (${seededCount} new listings added).`);

const distDirectory = fileURLToPath(new URL("../../dist/", import.meta.url));
const indexHtml = fileURLToPath(new URL("../../dist/index.html", import.meta.url));

app.use("/*", serveStatic({ root: distDirectory }));

const serveSpa = async (context: Context) => {
  if (context.req.path.startsWith("/api/")) return context.notFound();
  return context.html(await readFile(indexHtml, "utf8"));
};

app.get("/", serveSpa);
app.get("/*", serveSpa);

const server = serve({
  fetch: app.fetch,
  hostname: "0.0.0.0",
  port: Number(process.env.PORT ?? 10000),
});

for (const signal of ["SIGINT", "SIGTERM"] as const) {
  process.once(signal, () => {
    server.close(() => {
      void closeDb().then(
        () => process.exit(0),
        () => process.exit(1),
      );
    });
  });
}
