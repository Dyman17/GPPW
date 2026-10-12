import { describe, expect, test } from "bun:test";
import { createORPCClient } from "@orpc/client";
import { RPCLink } from "@orpc/client/fetch";
import app from "../src/api/index.ts";

const client = createORPCClient(
  new RPCLink({
    url: "http://localhost:4200/api/rpc",
    fetch: (request) => app.fetch(request),
  }),
);

describe("API smoke tests without a database", () => {
  test("health check responds", async () => {
    const response = await app.fetch(new Request("http://localhost:4200/api/health"));

    expect(response.status).toBe(200);
    expect(await response.json()).toEqual({ status: "ok" });
  });

  test("Better Auth returns an empty session when no cookie is present", async () => {
    const response = await app.fetch(new Request("http://localhost:4200/api/auth/get-session"));

    expect(response.status).toBe(200);
    expect(await response.json()).toBeNull();
  });

  test("public oRPC ping responds", async () => {
    const result = await client.ping();

    expect(result.message).toStartWith("Pong!");
  });

  test("protected chat route rejects requests without a session", async () => {
    await expect(client.chats.list()).rejects.toMatchObject({ code: "UNAUTHORIZED" });
  });
});
