import { bigint, pgTable, text } from "drizzle-orm/pg-core";

export const conversations = pgTable("conversations", {
  id: text("id").primaryKey(),
  itemId: text("item_id").notNull(),
  buyerId: text("buyer_id").notNull(),
  sellerId: text("seller_id").notNull(),
  buyerReadAt: bigint("buyer_read_at", { mode: "number" }).notNull().default(0),
  sellerReadAt: bigint("seller_read_at", { mode: "number" }).notNull().default(0),
  createdAt: bigint("created_at", { mode: "number" }).notNull(),
});

export const messages = pgTable("messages", {
  id: text("id").primaryKey(),
  chatId: text("chat_id").notNull(),
  senderId: text("sender_id").notNull(),
  body: text("body").notNull(),
  image: text("image"),
  createdAt: bigint("created_at", { mode: "number" }).notNull(),
});
