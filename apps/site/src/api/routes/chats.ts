import { z } from "zod";
import { ORPCError } from "@orpc/server";
import { db, eq, or, schema } from "@gppw/db";
import { authed } from "../middleware/auth";

const { conversations, messages, listings, user } = schema;
const uid = () => crypto.randomUUID();
async function access(id: string, userId: string) {
  const [chat] = await db.select().from(conversations).where(eq(conversations.id, id)).limit(1);
  if (!chat || ![chat.buyerId, chat.sellerId].includes(userId)) throw new ORPCError("FORBIDDEN");
  return chat;
}

export const chats = {
  list: authed.handler(async ({ context }) => {
    const rows = await db.select().from(conversations).where(or(eq(conversations.buyerId, context.user.id), eq(conversations.sellerId, context.user.id)));
    return Promise.all(rows.map(async (chat) => {
      const [item] = await db.select().from(listings).where(eq(listings.id, chat.itemId)).limit(1);
      const msgs = await db.select().from(messages).where(eq(messages.chatId, chat.id)).orderBy(messages.createdAt);
      const last = msgs.at(-1); const readAt = chat.buyerId === context.user.id ? chat.buyerReadAt : chat.sellerReadAt;
      const partnerId = chat.buyerId === context.user.id ? chat.sellerId : chat.buyerId;
      const [partner] = await db.select({ id: user.id, name: user.name }).from(user).where(eq(user.id, partnerId)).limit(1);
      return { chat, item, partner: partner ?? { id: partnerId, name: item?.ownerName ?? "Пользователь" }, last, unread: msgs.filter((m) => m.senderId !== context.user.id && m.createdAt > readAt).length };
    }));
  }),
  open: authed.input(z.object({ itemId: z.string() })).handler(async ({ context, input }) => {
    const [item] = await db.select().from(listings).where(eq(listings.id, input.itemId)).limit(1);
    if (!item || item.demo || !item.ownerId || item.ownerId === context.user.id || ["removed", "pending"].includes(item.status)) throw new ORPCError("BAD_REQUEST");
    const id = `${input.itemId}:${context.user.id}`;
    await db.insert(conversations).values({ id, itemId: item.id, buyerId: context.user.id, sellerId: item.ownerId, buyerReadAt: 0, sellerReadAt: 0, createdAt: Date.now() }).onConflictDoNothing();
    return { id };
  }),
  messages: authed.input(z.object({ id: z.string() })).handler(async ({ context, input }) => {
    const chat = await access(input.id, context.user.id); const now = Date.now();
    await db.update(conversations).set(chat.buyerId === context.user.id ? { buyerReadAt: now } : { sellerReadAt: now }).where(eq(conversations.id, chat.id));
    return db.select().from(messages).where(eq(messages.chatId, chat.id)).orderBy(messages.createdAt);
  }),
  send: authed.input(z.object({ id: z.string(), body: z.string().trim().max(2000), image: z.string().max(900000).refine((v) => /^data:image\/(jpeg|png|webp);base64,[A-Za-z0-9+/=]+$/.test(v)).optional() }).refine((v) => !!v.body || !!v.image)).handler(async ({ context, input }) => {
    const chat = await access(input.id, context.user.id); const createdAt = Date.now(); const id = uid();
    await db.insert(messages).values({ id, chatId: chat.id, senderId: context.user.id, body: input.body, image: input.image ?? null, createdAt });
    return { id, createdAt };
  }),
};
