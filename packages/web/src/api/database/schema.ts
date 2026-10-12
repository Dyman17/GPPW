import { sqliteTable, text, integer } from "drizzle-orm/sqlite-core";
export * from "./auth-schema";
export const listings = sqliteTable("listings", {
  id: text("id").primaryKey(),
  ownerId: text("owner_id"),
  ownerName: text("owner_name").notNull(),
  grade: text("grade").notNull(),
  title: text("title", { mode: "json" }).$type<[string, string, string]>().notNull(),
  description: text("description", { mode: "json" }).$type<[string, string, string]>().notNull(),
  category: integer("category").notNull(),
  condition: integer("condition").notNull(),
  type: text("type").notNull(),
  price: integer("price").notNull(),
  image: text("image").notNull(),
  status: text("status").notNull().default("pending"),
  demo: integer("demo", { mode: "boolean" }).notNull().default(false),
  createdAt: integer("created_at").notNull(),
});
export const profiles = sqliteTable("profiles", {
  userId: text("user_id").primaryKey(),
  school: text("school").notNull(),
  grade: text("grade").notNull(),
  role: text("role").notNull().default("student"),
});
export const favorites = sqliteTable("favorites", {
  id: text("id").primaryKey(),
  userId: text("user_id").notNull(),
  itemId: text("item_id").notNull(),
});
export const conversations = sqliteTable("conversations", {
  id: text("id").primaryKey(),
  itemId: text("item_id").notNull(),
  buyerId: text("buyer_id").notNull(),
  sellerId: text("seller_id").notNull(),
  buyerReadAt: integer("buyer_read_at").notNull().default(0),
  sellerReadAt: integer("seller_read_at").notNull().default(0),
  createdAt: integer("created_at").notNull(),
});
export const messages = sqliteTable("messages", {
  id: text("id").primaryKey(),
  chatId: text("chat_id").notNull(),
  senderId: text("sender_id").notNull(),
  body: text("body").notNull(),
  image: text("image"),
  createdAt: integer("created_at").notNull(),
});
export const reservations = sqliteTable("reservations", {
  id: text("id").primaryKey(),
  itemId: text("item_id").notNull(),
  buyerId: text("buyer_id").notNull(),
  sellerId: text("seller_id").notNull(),
  date: text("date").notNull(),
  place: text("place").notNull(),
  status: text("status").notNull().default("pending"),
  buyerConfirmed: integer("buyer_confirmed", { mode: "boolean" }).notNull().default(false),
  sellerConfirmed: integer("seller_confirmed", { mode: "boolean" }).notNull().default(false),
  createdAt: integer("created_at").notNull(),
});
export const history = sqliteTable("history", {
  id: text("id").primaryKey(),
  itemId: text("item_id").notNull(),
  kind: text("kind").notNull(),
  createdAt: integer("created_at").notNull(),
});
