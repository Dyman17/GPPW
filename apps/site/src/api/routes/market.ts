import { z } from "zod";
import { ORPCError } from "@orpc/server";
import { and, eq, or, desc } from "drizzle-orm";
import { base } from "../core/app";
import { authed } from "../middleware/auth";
import { db, schema as s } from "@gppw/db";
import { seed } from "../../web/lib/demo";
let seeded: Promise<void> | undefined;
function ensureSeed() {
  return (seeded ??= (async () => {
    await db
      .insert(s.listings)
      .values(
        seed.map((i, n) => ({
          id: i.id,
          ownerId: null,
          ownerName: i.owner,
          grade: i.grade,
          title: i.title,
          description: i.description,
          category: i.category,
          condition: i.condition,
          type: i.type,
          price: i.price,
          image: i.image,
          status: "available",
          demo: true,
          createdAt: 1791806400000 - n * 60000,
        })),
      )
      .onConflictDoNothing();
  })());
}
const itemInput = z.object({
  id: z.string().optional(),
  title: z.string().trim().min(2).max(100),
  description: z.string().trim().min(5).max(1500),
  category: z.number().int().min(1).max(8),
  condition: z.number().int().min(0).max(2),
  type: z.enum(["sale", "free", "exchange"]),
  price: z.number().int().min(0).max(10000000),
  image: z
    .string()
    .max(900000)
    .refine((v) => /^data:image\/(jpeg|png|webp);base64,[A-Za-z0-9+/=]+$/.test(v)),
});
export const market = {
  catalog: base.handler(async () => {
    await ensureSeed();
    return db
      .select()
      .from(s.listings)
      .where(eq(s.listings.status, "available"))
      .orderBy(desc(s.listings.createdAt));
  }),
  item: base.input(z.object({ id: z.string() })).handler(async ({ input }) => {
    await ensureSeed();
    const [item] = await db.select().from(s.listings).where(eq(s.listings.id, input.id));
    if (!item || item.status === "pending" || item.status === "removed")
      throw new ORPCError("NOT_FOUND");
    return {
      item,
      history: await db
        .select()
        .from(s.history)
        .where(eq(s.history.itemId, input.id))
        .orderBy(s.history.createdAt),
    };
  }),
  mine: authed.handler(({ context }) =>
    db
      .select()
      .from(s.listings)
      .where(eq(s.listings.ownerId, context.user.id))
      .orderBy(desc(s.listings.createdAt)),
  ),
  profile: authed.handler(async ({ context }) => {
    const [profile] = await db
      .select()
      .from(s.profiles)
      .where(eq(s.profiles.userId, context.user.id));
    return { user: context.user, profile };
  }),
  settings: authed
    .input(
      z.object({
        name: z.string().trim().min(1).max(40),
        school: z.string().trim().min(2).max(100),
        grade: z.string().trim().min(1).max(10),
      }),
    )
    .handler(async ({ context, input }) => {
      await db.update(s.user).set({ name: input.name }).where(eq(s.user.id, context.user.id));
      await db
        .insert(s.profiles)
        .values({ userId: context.user.id, school: input.school, grade: input.grade })
        .onConflictDoUpdate({
          target: s.profiles.userId,
          set: { school: input.school, grade: input.grade },
        });
      return { ok: true };
    }),
  publish: authed.input(itemInput).handler(async ({ context, input }) => {
    if (input.type === "sale" && input.price < 1) throw new ORPCError("BAD_REQUEST");
    const [profile] = await db
      .select()
      .from(s.profiles)
      .where(eq(s.profiles.userId, context.user.id));
    if (!profile)
      throw new ORPCError("BAD_REQUEST", {
        message: "Complete your school and class in profile settings.",
      });
    const values = {
      title: [input.title, input.title, input.title] as [string, string, string],
      description: [input.description, input.description, input.description] as [
        string,
        string,
        string,
      ],
      category: input.category,
      condition: input.condition,
      type: input.type,
      price: input.type === "sale" ? input.price : 0,
      image: input.image,
      status: "pending",
    };
    if (input.id) {
      const [old] = await db
        .select()
        .from(s.listings)
        .where(and(eq(s.listings.id, input.id), eq(s.listings.ownerId, context.user.id)));
      if (!old) throw new ORPCError("FORBIDDEN");
      if (old.status === "reserved" || old.status === "transferred")
        throw new ORPCError("CONFLICT");
      await db.update(s.listings).set(values).where(eq(s.listings.id, input.id));
      return { id: input.id };
    }
    const id = crypto.randomUUID();
    await db
      .insert(s.listings)
      .values({
        ...values,
        id,
        ownerId: context.user.id,
        ownerName: context.user.name,
        grade: profile.grade,
        createdAt: Date.now(),
      });
    await db
      .insert(s.history)
      .values({ id: crypto.randomUUID(), itemId: id, kind: "created", createdAt: Date.now() });
    return { id };
  }),
  withdraw: authed.input(z.object({ id: z.string() })).handler(async ({ context, input }) => {
    const [i] = await db
      .select()
      .from(s.listings)
      .where(and(eq(s.listings.id, input.id), eq(s.listings.ownerId, context.user.id)));
    if (!i) throw new ORPCError("FORBIDDEN");
    if (["reserved", "transferred"].includes(i.status)) throw new ORPCError("CONFLICT");
    await db.update(s.listings).set({ status: "removed" }).where(eq(s.listings.id, i.id));
    return { ok: true };
  }),
  saved: authed.handler(async ({ context }) => {
    return db
      .select({ item: s.listings })
      .from(s.favorites)
      .innerJoin(s.listings, eq(s.favorites.itemId, s.listings.id))
      .where(eq(s.favorites.userId, context.user.id))
      .then((rows) => rows.map((r) => r.item));
  }),
  save: authed
    .input(z.object({ id: z.string(), saved: z.boolean() }))
    .handler(async ({ context, input }) => {
      const id = context.user.id + ":" + input.id;
      if (input.saved)
        await db
          .insert(s.favorites)
          .values({ id, userId: context.user.id, itemId: input.id })
          .onConflictDoNothing();
      else await db.delete(s.favorites).where(eq(s.favorites.id, id));
      return { ok: true };
    }),
  moderation: authed.handler(async ({ context }) => {
    const [profile] = await db
      .select()
      .from(s.profiles)
      .where(eq(s.profiles.userId, context.user.id));
    if (!profile || !["moderator", "admin"].includes(profile.role))
      throw new ORPCError("FORBIDDEN");
    return db.select().from(s.listings).where(eq(s.listings.status, "pending"));
  }),
  moderate: authed
    .input(z.object({ id: z.string(), approve: z.boolean() }))
    .handler(async ({ context, input }) => {
      const [profile] = await db
        .select()
        .from(s.profiles)
        .where(eq(s.profiles.userId, context.user.id));
      if (!profile || !["moderator", "admin"].includes(profile.role))
        throw new ORPCError("FORBIDDEN");
      await db
        .update(s.listings)
        .set({ status: input.approve ? "available" : "removed" })
        .where(and(eq(s.listings.id, input.id), eq(s.listings.status, "pending")));
      return { ok: true };
    }),
  bookings: authed.handler(async ({ context }) =>
    db
      .select({ booking: s.reservations, item: s.listings })
      .from(s.reservations)
      .innerJoin(s.listings, eq(s.reservations.itemId, s.listings.id))
      .where(
        or(
          eq(s.reservations.buyerId, context.user.id),
          eq(s.reservations.sellerId, context.user.id),
        ),
      )
      .orderBy(desc(s.reservations.createdAt)),
  ),
  reserve: authed
    .input(
      z.object({
        itemId: z.string(),
        date: z.string().datetime({ local: true }),
        place: z.enum(["library", "administration"]),
      }),
    )
    .handler(async ({ context, input }) => {
      if (new Date(input.date).getTime() < Date.now()) throw new ORPCError("BAD_REQUEST");
      return db.transaction(async (tx) => {
        const [i] = await tx.select().from(s.listings).where(eq(s.listings.id, input.itemId));
        if (!i || i.status !== "available" || i.demo || !i.ownerId || i.ownerId === context.user.id)
          throw new ORPCError("CONFLICT");
        const [reserved] = await tx
          .update(s.listings)
          .set({ status: "reserved" })
          .where(and(eq(s.listings.id, i.id), eq(s.listings.status, "available")))
          .returning();
        if (!reserved) throw new ORPCError("CONFLICT");
        const id = crypto.randomUUID();
        await tx
          .insert(s.reservations)
          .values({
            id,
            itemId: i.id,
            buyerId: context.user.id,
            sellerId: i.ownerId,
            date: input.date,
            place: input.place,
            createdAt: Date.now(),
          });
        return { id };
      });
    }),
  bookingAction: authed
    .input(z.object({ id: z.string(), action: z.enum(["accept", "cancel", "confirm"]) }))
    .handler(async ({ context, input }) =>
      db.transaction(async (tx) => {
        const [b] = await tx.select().from(s.reservations).where(eq(s.reservations.id, input.id));
        if (!b || ![b.buyerId, b.sellerId].includes(context.user.id))
          throw new ORPCError("FORBIDDEN");
        if (input.action === "accept") {
          if (context.user.id !== b.sellerId || b.status !== "pending")
            throw new ORPCError("CONFLICT");
          await tx
            .update(s.reservations)
            .set({ status: "confirmed" })
            .where(eq(s.reservations.id, b.id));
        } else if (input.action === "cancel") {
          if (!["pending", "confirmed"].includes(b.status)) throw new ORPCError("CONFLICT");
          await tx
            .update(s.reservations)
            .set({ status: "cancelled" })
            .where(eq(s.reservations.id, b.id));
          await tx
            .update(s.listings)
            .set({ status: "available" })
            .where(eq(s.listings.id, b.itemId));
        } else {
          if (b.status !== "confirmed") throw new ORPCError("CONFLICT");
          const buyerConfirmed = b.buyerConfirmed || context.user.id === b.buyerId;
          const sellerConfirmed = b.sellerConfirmed || context.user.id === b.sellerId;
          await tx
            .update(s.reservations)
            .set({
              buyerConfirmed,
              sellerConfirmed,
              status: buyerConfirmed && sellerConfirmed ? "done" : "confirmed",
            })
            .where(eq(s.reservations.id, b.id));
          if (buyerConfirmed && sellerConfirmed) {
            await tx
              .update(s.listings)
              .set({ status: "transferred" })
              .where(eq(s.listings.id, b.itemId));
            await tx
              .insert(s.history)
              .values({
                id: crypto.randomUUID(),
                itemId: b.itemId,
                kind: "transferred",
                createdAt: Date.now(),
              });
          }
        }
        return { ok: true };
      }),
    ),
};
