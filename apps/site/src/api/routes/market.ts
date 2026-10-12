import { z } from "zod";
import { ORPCError } from "@orpc/server";
import { base } from "../core/app";
import { authed } from "../middleware/auth";
import { store, uid, type ListingRow, type ReservationRow } from "../mock/store";

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

const byNewest = (a: ListingRow, b: ListingRow) => b.createdAt - a.createdAt;

export const market = {
  catalog: base.handler(async () =>
    store.listings.filter((l) => l.status === "available").sort(byNewest),
  ),
  item: base.input(z.object({ id: z.string() })).handler(async ({ input }) => {
    const item = store.listings.find((l) => l.id === input.id);
    if (!item || item.status === "pending" || item.status === "removed")
      throw new ORPCError("NOT_FOUND");
    return {
      item,
      history: store.history
        .filter((h) => h.itemId === input.id)
        .sort((a, b) => a.createdAt - b.createdAt),
    };
  }),
  mine: authed.handler(({ context }) =>
    store.listings.filter((l) => l.ownerId === context.user.id).sort(byNewest),
  ),
  profile: authed.handler(async ({ context }) => {
    const profile = store.profiles.find((p) => p.userId === context.user.id);
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
      context.user.name = input.name;
      const profile = store.profiles.find((p) => p.userId === context.user.id);
      if (profile) {
        profile.school = input.school;
        profile.grade = input.grade;
      } else {
        store.profiles.push({
          userId: context.user.id,
          school: input.school,
          grade: input.grade,
          role: "student",
        });
      }
      return { ok: true };
    }),
  publish: authed.input(itemInput).handler(async ({ context, input }) => {
    if (input.type === "sale" && input.price < 1) throw new ORPCError("BAD_REQUEST");
    const profile = store.profiles.find((p) => p.userId === context.user.id);
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
      const old = store.listings.find(
        (l) => l.id === input.id && l.ownerId === context.user.id,
      );
      if (!old) throw new ORPCError("FORBIDDEN");
      if (old.status === "reserved" || old.status === "transferred")
        throw new ORPCError("CONFLICT");
      Object.assign(old, values);
      return { id: input.id };
    }
    const id = uid();
    store.listings.push({
      ...values,
      id,
      ownerId: context.user.id,
      ownerName: context.user.name,
      grade: profile.grade,
      demo: false,
      createdAt: Date.now(),
    });
    store.history.push({ id: uid(), itemId: id, kind: "created", createdAt: Date.now() });
    return { id };
  }),
  withdraw: authed.input(z.object({ id: z.string() })).handler(async ({ context, input }) => {
    const item = store.listings.find(
      (l) => l.id === input.id && l.ownerId === context.user.id,
    );
    if (!item) throw new ORPCError("FORBIDDEN");
    if (["reserved", "transferred"].includes(item.status)) throw new ORPCError("CONFLICT");
    item.status = "removed";
    return { ok: true };
  }),
  saved: authed.handler(async ({ context }) =>
    store.favorites
      .filter((f) => f.userId === context.user.id)
      .map((f) => store.listings.find((l) => l.id === f.itemId))
      .filter((l): l is ListingRow => !!l),
  ),
  save: authed
    .input(z.object({ id: z.string(), saved: z.boolean() }))
    .handler(async ({ context, input }) => {
      const id = context.user.id + ":" + input.id;
      const idx = store.favorites.findIndex((f) => f.id === id);
      if (input.saved) {
        if (idx === -1) store.favorites.push({ id, userId: context.user.id, itemId: input.id });
      } else if (idx !== -1) {
        store.favorites.splice(idx, 1);
      }
      return { ok: true };
    }),
  moderation: authed.handler(async ({ context }) => {
    const profile = store.profiles.find((p) => p.userId === context.user.id);
    if (!profile || !["moderator", "admin"].includes(profile.role))
      throw new ORPCError("FORBIDDEN");
    return store.listings.filter((l) => l.status === "pending");
  }),
  moderate: authed
    .input(z.object({ id: z.string(), approve: z.boolean() }))
    .handler(async ({ context, input }) => {
      const profile = store.profiles.find((p) => p.userId === context.user.id);
      if (!profile || !["moderator", "admin"].includes(profile.role))
        throw new ORPCError("FORBIDDEN");
      const item = store.listings.find((l) => l.id === input.id && l.status === "pending");
      if (item) item.status = input.approve ? "available" : "removed";
      return { ok: true };
    }),
  bookings: authed.handler(async ({ context }) =>
    store.reservations
      .filter(
        (b) => b.buyerId === context.user.id || b.sellerId === context.user.id,
      )
      .sort((a, b) => b.createdAt - a.createdAt)
      .map((booking) => ({
        booking,
        item: store.listings.find((l) => l.id === booking.itemId),
      }))
      .filter((row): row is { booking: ReservationRow; item: ListingRow } => !!row.item),
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
      const item = store.listings.find((l) => l.id === input.itemId);
      if (!item || item.status !== "available" || item.demo || !item.ownerId)
        throw new ORPCError("CONFLICT");
      if (item.ownerId === context.user.id) throw new ORPCError("CONFLICT");
      item.status = "reserved";
      const id = uid();
      store.reservations.push({
        id,
        itemId: item.id,
        buyerId: context.user.id,
        sellerId: item.ownerId,
        date: input.date,
        place: input.place,
        status: "pending",
        buyerConfirmed: false,
        sellerConfirmed: false,
        createdAt: Date.now(),
      });
      return { id };
    }),
  bookingAction: authed
    .input(z.object({ id: z.string(), action: z.enum(["accept", "cancel", "confirm"]) }))
    .handler(async ({ context, input }) => {
      const booking = store.reservations.find((b) => b.id === input.id);
      if (!booking || ![booking.buyerId, booking.sellerId].includes(context.user.id))
        throw new ORPCError("FORBIDDEN");
      const item = store.listings.find((l) => l.id === booking.itemId);
      if (input.action === "accept") {
        if (context.user.id !== booking.sellerId || booking.status !== "pending")
          throw new ORPCError("CONFLICT");
        booking.status = "confirmed";
      } else if (input.action === "cancel") {
        if (!["pending", "confirmed"].includes(booking.status)) throw new ORPCError("CONFLICT");
        booking.status = "cancelled";
        if (item) item.status = "available";
      } else {
        if (booking.status !== "confirmed") throw new ORPCError("CONFLICT");
        const buyerConfirmed = booking.buyerConfirmed || context.user.id === booking.buyerId;
        const sellerConfirmed = booking.sellerConfirmed || context.user.id === booking.sellerId;
        booking.buyerConfirmed = buyerConfirmed;
        booking.sellerConfirmed = sellerConfirmed;
        booking.status = buyerConfirmed && sellerConfirmed ? "done" : "confirmed";
        if (buyerConfirmed && sellerConfirmed && item) {
          item.status = "transferred";
          store.history.push({
            id: uid(),
            itemId: item.id,
            kind: "transferred",
            createdAt: Date.now(),
          });
        }
      }
      return { ok: true };
    }),
};

export type { ReservationRow };
