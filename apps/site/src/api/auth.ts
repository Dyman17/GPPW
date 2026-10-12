import { betterAuth } from "better-auth";
import { drizzleAdapter } from "@better-auth/drizzle-adapter";
import { db, schema } from "@gppw/db";

export const baseURL =
  process.env.BETTER_AUTH_URL ??
  process.env.WEBSITE_URL ??
  process.env.RENDER_EXTERNAL_URL;
if (!baseURL) {
  throw new Error("BETTER_AUTH_URL, WEBSITE_URL, or RENDER_EXTERNAL_URL must be configured");
}
if (!process.env.BETTER_AUTH_SECRET) throw new Error("BETTER_AUTH_SECRET must be configured");

export const auth = betterAuth({
  database: drizzleAdapter(db, { provider: "pg", schema: {
    user: schema.user,
    session: schema.session,
    account: schema.account,
    verification: schema.verification,
  } }),
  baseURL,
  basePath: "/api/auth",
  secret: process.env.BETTER_AUTH_SECRET,
  emailAndPassword: { enabled: true, minPasswordLength: 8 },
  trustedOrigins: [baseURL],
});
