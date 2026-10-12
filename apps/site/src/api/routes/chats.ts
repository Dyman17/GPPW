import { z } from "zod";
import { ORPCError } from "@orpc/server";
import { authed } from "../middleware/auth";
import { store, uid, findUser, type ConversationRow } from "../mock/store";

function access(id: string, userId: string): ConversationRow {
  const chat = store.conversations.find((c) => c.id === id);
  if (!chat || ![chat.buyerId, chat.sellerId].includes(userId)) throw new ORPCError("FORBIDDEN");
  return chat;
}

function partnerOf(chat: ConversationRow, userId: string) {
  const otherId = chat.buyerId === userId ? chat.sellerId : chat.buyerId;
  const item = store.listings.find((l) => l.id === chat.itemId);
  return findUser(otherId) ?? { id: otherId, name: item?.ownerName ?? "Пользователь" };
}

export const chats = {
  list: authed.handler(async ({ context }) => {
    return store.conversations
      .filter((c) => c.buyerId === context.user.id || c.sellerId === context.user.id)
      .sort((a, b) => b.createdAt - a.createdAt)
      .map((chat) => {
        const item = store.listings.find((l) => l.id === chat.itemId);
        const messages = store.messages
          .filter((m) => m.chatId === chat.id)
          .sort((a, b) => a.createdAt - b.createdAt);
        const last = messages[messages.length - 1];
        const readAt = chat.buyerId === context.user.id ? chat.buyerReadAt : chat.sellerReadAt;
        const unread = messages.filter(
          (m) => m.senderId !== context.user.id && m.createdAt > readAt,
        ).length;
        return { chat, item, partner: partnerOf(chat, context.user.id), last, unread };
      });
  }),
  open: authed.input(z.object({ itemId: z.string() })).handler(async ({ context, input }) => {
    const item = store.listings.find((l) => l.id === input.itemId);
    if (
      !item ||
      item.demo ||
      !item.ownerId ||
      item.ownerId === context.user.id ||
      item.status === "removed" ||
      item.status === "pending"
    )
      throw new ORPCError("BAD_REQUEST");
    const id = input.itemId + ":" + context.user.id;
    if (!store.conversations.some((c) => c.id === id)) {
      store.conversations.push({
        id,
        itemId: item.id,
        buyerId: context.user.id,
        sellerId: item.ownerId,
        buyerReadAt: 0,
        sellerReadAt: 0,
        createdAt: Date.now(),
      });
    }
    return { id };
  }),
  messages: authed.input(z.object({ id: z.string() })).handler(async ({ context, input }) => {
    const chat = access(input.id, context.user.id);
    if (chat.buyerId === context.user.id) chat.buyerReadAt = Date.now();
    else chat.sellerReadAt = Date.now();
    return store.messages
      .filter((m) => m.chatId === chat.id)
      .sort((a, b) => a.createdAt - b.createdAt);
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
      access(input.id, context.user.id);
      const createdAt = Date.now();
      const id = uid();
      store.messages.push({
        id,
        chatId: input.id,
        senderId: context.user.id,
        body: input.body,
        image: input.image ?? null,
        createdAt,
      });
      return { id, createdAt };
    }),
};
