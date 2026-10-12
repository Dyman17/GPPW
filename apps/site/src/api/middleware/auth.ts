import { base } from "../core/app";
import { currentUser } from "../mock/store";

// No authentication — every request is served as the single demo account.
export const authed = base.use(async ({ next }) => {
  return next({ context: { user: currentUser() } });
});
