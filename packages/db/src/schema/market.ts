import { bigint, boolean, integer, jsonb, pgTable, text } from "drizzle-orm/pg-core";

export const listings = pgTable("listings", {
  id: text("id").primaryKey(),
  ownerId: text("owner_id"),
  ownerName: text("owner_name").notNull(),
  grade: text("grade").notNull(),
  title: jsonb("title").$type<[string, string, string]>().notNull(),
  description: jsonb("description").$type<[string, string, string]>().notNull(),
  category: integer("category").notNull(),
  condition: integer("condition").notNull(),
  type: text("type").notNull(),
  price: integer("price").notNull(),
  image: text("image").notNull(),
  status: text("status").notNull().default("pending"),
  demo: boolean("demo").notNull().default(false),
  createdAt: bigint("created_at", { mode: "number" }).notNull(),
});

export const profiles = pgTable("profiles", {
  userId: text("user_id").primaryKey(),
  school: text("school").notNull(),
  grade: text("grade").notNull(),
  role: text("role").notNull().default("student"),
});

export const favorites = pgTable("favorites", {
  id: text("id").primaryKey(),
  userId: text("user_id").notNull(),
  itemId: text("item_id").notNull(),
});

export const reservations = pgTable("reservations", {
  id: text("id").primaryKey(),
  itemId: text("item_id").notNull(),
  buyerId: text("buyer_id").notNull(),
  sellerId: text("seller_id").notNull(),
  date: text("date").notNull(),
  place: text("place").notNull(),
  status: text("status").notNull().default("pending"),
  buyerConfirmed: boolean("buyer_confirmed").notNull().default(false),
  sellerConfirmed: boolean("seller_confirmed").notNull().default(false),
  createdAt: bigint("created_at", { mode: "number" }).notNull(),
});

export const history = pgTable("history", {
  id: text("id").primaryKey(),
  itemId: text("item_id").notNull(),
  kind: text("kind").notNull(),
  createdAt: bigint("created_at", { mode: "number" }).notNull(),
});
