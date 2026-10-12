import { z } from "zod";
import { ORPCError } from "@orpc/server";
import { eq, and, or, desc, gt, ne } from "drizzle-orm";
import { db, schema as s } from "@gppw/db";
import { authed } from "../middleware/auth";
async function access(id: string, userId: string) {
  const [chat] = await db.select().from(s.conversations).where(eq(s.conversations.id, id));
  if (!chat || ![chat.buyerId, chat.sellerId].includes(userId)) throw new ORPCError("FORBIDDEN");
  return chat;
}
export const chats = {
  list: authed.handler(async ({ context }) => {
    const rows = await db
      .select()
      .from(s.conversations)
      .where(
        or(
          eq(s.conversations.buyerId, context.user.id),
          eq(s.conversations.sellerId, context.user.id),
        ),
      )
      .orderBy(desc(s.conversations.createdAt));
    return Promise.all(
      rows.map(async (chat) => {
        const [item] = await db.select().from(s.listings).where(eq(s.listings.id, chat.itemId));
        const [partner] = await db
          .select({ id: s.user.id, name: s.user.name })
          .from(s.user)
          .where(eq(s.user.id, chat.buyerId === context.user.id ? chat.sellerId : chat.buyerId));
        const [last] = await db
          .select()
          .from(s.messages)
          .where(eq(s.messages.chatId, chat.id))
          .orderBy(desc(s.messages.createdAt))
          .limit(1);
        const unread = await db
          .select({ id: s.messages.id })
          .from(s.messages)
          .where(
            and(
              eq(s.messages.chatId, chat.id),
              ne(s.messages.senderId, context.user.id),
              gt(
                s.messages.createdAt,
                chat.buyerId === context.user.id ? chat.buyerReadAt : chat.sellerReadAt,
              ),
            ),
          );
        return { chat, item, partner, last, unread: unread.length };
      }),
    );
  }),
  open: authed.input(z.object({ itemId: z.string() })).handler(async ({ context, input }) => {
    const [i] = await db.select().from(s.listings).where(eq(s.listings.id, input.itemId));
    if (
      !i ||
      i.demo ||
      !i.ownerId ||
      i.ownerId === context.user.id ||
      i.status === "removed" ||
      i.status === "pending"
    )
      throw new ORPCError("BAD_REQUEST");
    const id = input.itemId + ":" + context.user.id;
    await db
      .insert(s.conversations)
      .values({
        id,
        itemId: i.id,
        buyerId: context.user.id,
        sellerId: i.ownerId,
        createdAt: Date.now(),
      })
      .onConflictDoNothing();
    return { id };
  }),
  messages: authed.input(z.object({ id: z.string() })).handler(async ({ context, input }) => {
    const chat = await access(input.id, context.user.id);
    await db
      .update(s.conversations)
      .set(
        chat.buyerId === context.user.id
          ? { buyerReadAt: Date.now() }
          : { sellerReadAt: Date.now() },
      )
      .where(eq(s.conversations.id, chat.id));
    return db
      .select()
      .from(s.messages)
      .where(eq(s.messages.chatId, chat.id))
      .orderBy(s.messages.createdAt);
  }),
  send: authed
    .input(
      z
        .object({
          id: z.string(),
          body: z.string().trim().max(2000),
          image: z
            .string()
            .max(900000)
            .refine((v) => /^data:image\/(jpeg|png|webp);base64,[A-Za-z0-9+/=]+$/.test(v))
            .optional(),
        })
        .refine((v) => !!v.body || !!v.image),
    )
    .handler(async ({ context, input }) => {
      await access(input.id, context.user.id);
      const createdAt = Date.now();
      const id = crypto.randomUUID();
      await db
        .insert(s.messages)
        .values({
          id,
          chatId: input.id,
          senderId: context.user.id,
          body: input.body,
          image: input.image,
          createdAt,
        });
      return { id, createdAt };
    }),
};
