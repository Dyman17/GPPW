import { z } from "zod";
import { ORPCError } from "@orpc/server";
import { db, schema } from "@gppw/db";
import { and, desc, eq, or } from "@gppw/db";
import { base } from "../core/app";
import { authed } from "../middleware/auth";

const { listings, profiles, favorites, reservations, history, user } = schema;
const uid = () => crypto.randomUUID();
const itemInput = z.object({
  id: z.string().optional(), title: z.string().trim().min(2).max(100),
  description: z.string().trim().min(5).max(1500), category: z.number().int().min(1).max(8),
  condition: z.number().int().min(0).max(2), type: z.enum(["sale", "free", "exchange"]),
  price: z.number().int().min(0).max(10000000),
  image: z.string().max(900000).refine((v) => /^data:image\/(jpeg|png|webp);base64,[A-Za-z0-9+/=]+$/.test(v)),
});
const trilingual = (v: string) => [v, v, v] as [string, string, string];

export const market = {
  catalog: base.handler(() => db.select().from(listings).where(eq(listings.status, "available")).orderBy(desc(listings.createdAt))),
  item: base.input(z.object({ id: z.string() })).handler(async ({ input }) => {
    const [item] = await db.select().from(listings).where(eq(listings.id, input.id)).limit(1);
    if (!item || ["pending", "removed"].includes(item.status)) throw new ORPCError("NOT_FOUND");
    const events = await db.select().from(history).where(eq(history.itemId, input.id)).orderBy(history.createdAt);
    return { item, history: events };
  }),
  mine: authed.handler(({ context }) => db.select().from(listings).where(eq(listings.ownerId, context.user.id)).orderBy(desc(listings.createdAt))),
  profile: authed.handler(async ({ context }) => {
    const [profile] = await db.select().from(profiles).where(eq(profiles.userId, context.user.id)).limit(1);
    return { user: context.user, profile: profile ?? null };
  }),
  settings: authed.input(z.object({ name: z.string().trim().min(1).max(40), school: z.string().trim().min(2).max(100), grade: z.string().trim().min(1).max(10) })).handler(async ({ context, input }) => {
    await db.update(user).set({ name: input.name }).where(eq(user.id, context.user.id));
    await db.insert(profiles).values({ userId: context.user.id, school: input.school, grade: input.grade }).onConflictDoUpdate({ target: profiles.userId, set: { school: input.school, grade: input.grade } });
    return { ok: true };
  }),
  publish: authed.input(itemInput).handler(async ({ context, input }) => {
    if (input.type === "sale" && input.price < 1) throw new ORPCError("BAD_REQUEST");
    const [profile] = await db.select().from(profiles).where(eq(profiles.userId, context.user.id)).limit(1);
    if (!profile) throw new ORPCError("BAD_REQUEST", { message: "Complete your school and class in profile settings." });
    const values = { title: trilingual(input.title), description: trilingual(input.description), category: input.category, condition: input.condition, type: input.type, price: input.type === "sale" ? input.price : 0, image: input.image, status: "pending" };
    if (input.id) {
      const [old] = await db.select().from(listings).where(and(eq(listings.id, input.id), eq(listings.ownerId, context.user.id))).limit(1);
      if (!old) throw new ORPCError("FORBIDDEN");
      if (["reserved", "transferred"].includes(old.status)) throw new ORPCError("CONFLICT");
      await db.update(listings).set(values).where(eq(listings.id, input.id));
      return { id: input.id };
    }
    const id = uid(); const createdAt = Date.now();
    await db.insert(listings).values({ ...values, id, ownerId: context.user.id, ownerName: context.user.name, grade: profile.grade, demo: false, createdAt });
    await db.insert(history).values({ id: uid(), itemId: id, kind: "created", createdAt });
    return { id };
  }),
  withdraw: authed.input(z.object({ id: z.string() })).handler(async ({ context, input }) => {
    const [item] = await db.select().from(listings).where(and(eq(listings.id, input.id), eq(listings.ownerId, context.user.id))).limit(1);
    if (!item) throw new ORPCError("FORBIDDEN"); if (["reserved", "transferred"].includes(item.status)) throw new ORPCError("CONFLICT");
    await db.update(listings).set({ status: "removed" }).where(eq(listings.id, item.id)); return { ok: true };
  }),
  saved: authed.handler(async ({ context }) => {
    const rows = await db.select({ item: listings }).from(favorites).innerJoin(listings, eq(favorites.itemId, listings.id)).where(eq(favorites.userId, context.user.id));
    return rows.map(({ item }) => item);
  }),
  save: authed.input(z.object({ id: z.string(), saved: z.boolean() })).handler(async ({ context, input }) => {
    if (input.saved) await db.insert(favorites).values({ id: `${context.user.id}:${input.id}`, userId: context.user.id, itemId: input.id }).onConflictDoNothing();
    else await db.delete(favorites).where(and(eq(favorites.userId, context.user.id), eq(favorites.itemId, input.id)));
    return { ok: true };
  }),
  moderation: authed.handler(async ({ context }) => {
    const [p] = await db.select().from(profiles).where(eq(profiles.userId, context.user.id)).limit(1);
    if (!p || !["moderator", "admin"].includes(p.role)) throw new ORPCError("FORBIDDEN");
    return db.select().from(listings).where(eq(listings.status, "pending"));
  }),
  moderate: authed.input(z.object({ id: z.string(), approve: z.boolean() })).handler(async ({ context, input }) => {
    const [p] = await db.select().from(profiles).where(eq(profiles.userId, context.user.id)).limit(1);
    if (!p || !["moderator", "admin"].includes(p.role)) throw new ORPCError("FORBIDDEN");
    await db.update(listings).set({ status: input.approve ? "available" : "removed" }).where(and(eq(listings.id, input.id), eq(listings.status, "pending"))); return { ok: true };
  }),
  bookings: authed.handler(async ({ context }) => {
    const rows = await db.select({ booking: reservations, item: listings }).from(reservations).innerJoin(listings, eq(reservations.itemId, listings.id)).where(or(eq(reservations.buyerId, context.user.id), eq(reservations.sellerId, context.user.id))).orderBy(desc(reservations.createdAt));
    return rows;
  }),
  reserve: authed.input(z.object({ itemId: z.string(), date: z.string().datetime({ local: true }), place: z.enum(["library", "administration"]) })).handler(async ({ context, input }) => {
    if (new Date(input.date).getTime() < Date.now()) throw new ORPCError("BAD_REQUEST");
    const [item] = await db.select().from(listings).where(eq(listings.id, input.itemId)).limit(1);
    if (!item || item.status !== "available" || item.demo || !item.ownerId || item.ownerId === context.user.id) throw new ORPCError("CONFLICT");
    const id = uid(); const createdAt = Date.now();
    await db.transaction(async (tx) => {
      const changed = await tx.update(listings).set({ status: "reserved" }).where(and(eq(listings.id, item.id), eq(listings.status, "available"))).returning({ id: listings.id });
      if (!changed.length) throw new ORPCError("CONFLICT");
      await tx.insert(reservations).values({ id, itemId: item.id, buyerId: context.user.id, sellerId: item.ownerId!, date: input.date, place: input.place, status: "pending", buyerConfirmed: false, sellerConfirmed: false, createdAt });
    }); return { id };
  }),
  bookingAction: authed.input(z.object({ id: z.string(), action: z.enum(["accept", "cancel", "confirm"]) })).handler(async ({ context, input }) => {
    const [b] = await db.select().from(reservations).where(eq(reservations.id, input.id)).limit(1);
    if (!b || ![b.buyerId, b.sellerId].includes(context.user.id)) throw new ORPCError("FORBIDDEN");
    const [item] = await db.select().from(listings).where(eq(listings.id, b.itemId)).limit(1);
    if (input.action === "accept") {
      if (context.user.id !== b.sellerId || b.status !== "pending") throw new ORPCError("CONFLICT");
      await db.update(reservations).set({ status: "confirmed" }).where(eq(reservations.id, b.id));
    } else if (input.action === "cancel") {
      if (!["pending", "confirmed"].includes(b.status)) throw new ORPCError("CONFLICT");
      await db.transaction(async (tx) => { await tx.update(reservations).set({ status: "cancelled" }).where(eq(reservations.id, b.id)); if (item) await tx.update(listings).set({ status: "available" }).where(eq(listings.id, item.id)); });
    } else {
      if (b.status !== "confirmed") throw new ORPCError("CONFLICT");
      const buyerConfirmed = b.buyerConfirmed || context.user.id === b.buyerId; const sellerConfirmed = b.sellerConfirmed || context.user.id === b.sellerId;
      await db.transaction(async (tx) => {
        await tx.update(reservations).set({ buyerConfirmed, sellerConfirmed, status: buyerConfirmed && sellerConfirmed ? "done" : "confirmed" }).where(eq(reservations.id, b.id));
        if (buyerConfirmed && sellerConfirmed && item) { const createdAt = Date.now(); await tx.update(listings).set({ status: "transferred" }).where(eq(listings.id, item.id)); await tx.insert(history).values({ id: uid(), itemId: item.id, kind: "transferred", createdAt }); }
      });
    } return { ok: true };
  }),
};
