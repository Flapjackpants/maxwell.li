import { sql } from "drizzle-orm";
import {
  integer,
  sqliteTable,
  text,
} from "drizzle-orm/sqlite-core";

export const users = sqliteTable("users", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  discordId: text("discord_id").notNull().unique(),
  username: text("username").notNull(),
  avatarUrl: text("avatar_url"),
  isAdmin: integer("is_admin", { mode: "boolean" }).notNull().default(false),
  createdAt: integer("created_at", { mode: "timestamp" })
    .notNull()
    .default(sql`(unixepoch())`),
});

export const listings = sqliteTable("listings", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  name: text("name").notNull(),
  description: text("description").notNull().default(""),
  price: integer("price").notNull(),
  priceUnit: text("price_unit").notNull().default("stack"),
  pricePerCount: integer("price_per_count").notNull().default(1),
  imageUrl: text("image_url").notNull().default(""),
  inStock: integer("in_stock", { mode: "boolean" }).notNull().default(true),
  maxPurchaseQuantity: integer("max_purchase_quantity"),
  createdAt: integer("created_at", { mode: "timestamp" })
    .notNull()
    .default(sql`(unixepoch())`),
  updatedAt: integer("updated_at", { mode: "timestamp" })
    .notNull()
    .default(sql`(unixepoch())`),
});

export const orders = sqliteTable("orders", {
  id: text("id").primaryKey(),
  userId: integer("user_id")
    .notNull()
    .references(() => users.id),
  status: text("status").notNull().default("order_queued"),
  fulfillmentType: text("fulfillment_type").notNull(),
  deliveryFee: integer("delivery_fee").notNull().default(0),
  deliveryX: integer("delivery_x"),
  deliveryY: integer("delivery_y"),
  deliveryZ: integer("delivery_z"),
  deliveryDimension: text("delivery_dimension"),
  pickupLocation: text("pickup_location"),
  estimatedReadyTime: text("estimated_ready_time"),
  total: integer("total").notNull(),
  dmFailed: integer("dm_failed", { mode: "boolean" }).notNull().default(false),
  createdAt: integer("created_at", { mode: "timestamp" })
    .notNull()
    .default(sql`(unixepoch())`),
  updatedAt: integer("updated_at", { mode: "timestamp" })
    .notNull()
    .default(sql`(unixepoch())`),
});

export const orderItems = sqliteTable("order_items", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  orderId: text("order_id")
    .notNull()
    .references(() => orders.id),
  listingId: integer("listing_id").references(() => listings.id, {
    onDelete: "set null",
  }),
  name: text("name").notNull(),
  price: integer("price").notNull(),
  priceUnit: text("price_unit").notNull().default("stack"),
  pricePerCount: integer("price_per_count").notNull().default(1),
  quantity: integer("quantity").notNull(),
});
