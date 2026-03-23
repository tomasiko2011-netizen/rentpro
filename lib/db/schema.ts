import { sqliteTable, text, integer, real } from "drizzle-orm/sqlite-core";
import { relations } from "drizzle-orm";

export const users = sqliteTable("users", {
  id: text("id").primaryKey().$defaultFn(() => crypto.randomUUID()),
  email: text("email").notNull().unique(),
  name: text("name").notNull(),
  phone: text("phone"),
  role: text("role", { enum: ["owner", "manager", "cleaner"] }).notNull().default("owner"),
  passwordHash: text("password_hash").notNull(),
  plan: text("plan", { enum: ["free", "standard", "pro"] }).notNull().default("free"),
  createdAt: text("created_at").$defaultFn(() => new Date().toISOString()),
});

export const properties = sqliteTable("properties", {
  id: text("id").primaryKey().$defaultFn(() => crypto.randomUUID()),
  userId: text("user_id").notNull().references(() => users.id),
  name: text("name").notNull(),
  type: text("type", { enum: ["apartment", "house", "room", "studio"] }).notNull().default("apartment"),
  address: text("address").notNull(),
  city: text("city").notNull().default("Тараз"),
  rooms: integer("rooms").notNull().default(1),
  beds: integer("beds").notNull().default(1),
  maxGuests: integer("max_guests").notNull().default(2),
  description: text("description"),
  photos: text("photos").default("[]"), // JSON array of URLs
  amenities: text("amenities").default("[]"), // JSON array of strings
  priceWeekday: real("price_weekday").notNull().default(10000),
  priceWeekend: real("price_weekend").notNull().default(15000),
  priceHoliday: real("price_holiday"),
  minNights: integer("min_nights").notNull().default(1),
  checkInTime: text("check_in_time").notNull().default("14:00"),
  checkOutTime: text("check_out_time").notNull().default("12:00"),
  status: text("status", { enum: ["active", "inactive", "maintenance"] }).notNull().default("active"),
  createdAt: text("created_at").$defaultFn(() => new Date().toISOString()),
});

export const bookings = sqliteTable("bookings", {
  id: text("id").primaryKey().$defaultFn(() => crypto.randomUUID()),
  propertyId: text("property_id").notNull().references(() => properties.id),
  guestId: text("guest_id").references(() => guests.id),
  userId: text("user_id").notNull().references(() => users.id),
  checkIn: text("check_in").notNull(),
  checkOut: text("check_out").notNull(),
  nights: integer("nights").notNull(),
  totalPrice: real("total_price").notNull(),
  status: text("status", {
    enum: ["pending", "confirmed", "checked_in", "checked_out", "cancelled"],
  }).notNull().default("pending"),
  source: text("source", {
    enum: ["direct", "booking", "airbnb", "krisha", "widget", "whatsapp"],
  }).notNull().default("direct"),
  paymentStatus: text("payment_status", {
    enum: ["pending", "paid", "partial", "refunded"],
  }).notNull().default("pending"),
  guestName: text("guest_name"),
  guestPhone: text("guest_phone"),
  notes: text("notes"),
  createdAt: text("created_at").$defaultFn(() => new Date().toISOString()),
});

export const guests = sqliteTable("guests", {
  id: text("id").primaryKey().$defaultFn(() => crypto.randomUUID()),
  userId: text("user_id").notNull().references(() => users.id),
  name: text("name").notNull(),
  phone: text("phone"),
  email: text("email"),
  document: text("document"),
  city: text("city"),
  blacklisted: integer("blacklisted", { mode: "boolean" }).notNull().default(false),
  rating: integer("rating"),
  notes: text("notes"),
  totalBookings: integer("total_bookings").notNull().default(0),
  totalSpent: real("total_spent").notNull().default(0),
  createdAt: text("created_at").$defaultFn(() => new Date().toISOString()),
});

export const transactions = sqliteTable("transactions", {
  id: text("id").primaryKey().$defaultFn(() => crypto.randomUUID()),
  userId: text("user_id").notNull().references(() => users.id),
  propertyId: text("property_id").references(() => properties.id),
  bookingId: text("booking_id").references(() => bookings.id),
  type: text("type", { enum: ["income", "expense"] }).notNull(),
  category: text("category").notNull(),
  amount: real("amount").notNull(),
  date: text("date").notNull(),
  description: text("description"),
  createdAt: text("created_at").$defaultFn(() => new Date().toISOString()),
});

export const channels = sqliteTable("channels", {
  id: text("id").primaryKey().$defaultFn(() => crypto.randomUUID()),
  userId: text("user_id").notNull().references(() => users.id),
  platform: text("platform", {
    enum: ["booking", "airbnb", "krisha", "olx"],
  }).notNull(),
  credentials: text("credentials"), // encrypted JSON
  syncEnabled: integer("sync_enabled", { mode: "boolean" }).notNull().default(true),
  lastSync: text("last_sync"),
  status: text("status", { enum: ["active", "error", "disconnected"] }).notNull().default("active"),
  createdAt: text("created_at").$defaultFn(() => new Date().toISOString()),
});

export const channelListings = sqliteTable("channel_listings", {
  id: text("id").primaryKey().$defaultFn(() => crypto.randomUUID()),
  channelId: text("channel_id").notNull().references(() => channels.id),
  propertyId: text("property_id").notNull().references(() => properties.id),
  externalId: text("external_id"),
  syncStatus: text("sync_status", { enum: ["synced", "pending", "error"] }).notNull().default("pending"),
  lastSync: text("last_sync"),
});

export const priceRules = sqliteTable("price_rules", {
  id: text("id").primaryKey().$defaultFn(() => crypto.randomUUID()),
  propertyId: text("property_id").notNull().references(() => properties.id),
  name: text("name").notNull(),
  type: text("type", { enum: ["weekend", "holiday", "season", "special"] }).notNull(),
  dateFrom: text("date_from"),
  dateTo: text("date_to"),
  priceOverride: real("price_override"),
  multiplier: real("multiplier"),
});

export const blockedDates = sqliteTable("blocked_dates", {
  id: text("id").primaryKey().$defaultFn(() => crypto.randomUUID()),
  propertyId: text("property_id").notNull().references(() => properties.id),
  dateFrom: text("date_from").notNull(),
  dateTo: text("date_to").notNull(),
  reason: text("reason"),
});

export const notifications = sqliteTable("notifications", {
  id: text("id").primaryKey().$defaultFn(() => crypto.randomUUID()),
  userId: text("user_id").notNull().references(() => users.id),
  type: text("type").notNull(),
  title: text("title").notNull(),
  body: text("body"),
  read: integer("read", { mode: "boolean" }).notNull().default(false),
  createdAt: text("created_at").$defaultFn(() => new Date().toISOString()),
});

// Relations
export const usersRelations = relations(users, ({ many }) => ({
  properties: many(properties),
  bookings: many(bookings),
  guests: many(guests),
  transactions: many(transactions),
}));

export const propertiesRelations = relations(properties, ({ one, many }) => ({
  user: one(users, { fields: [properties.userId], references: [users.id] }),
  bookings: many(bookings),
}));

export const bookingsRelations = relations(bookings, ({ one }) => ({
  property: one(properties, { fields: [bookings.propertyId], references: [properties.id] }),
  guest: one(guests, { fields: [bookings.guestId], references: [guests.id] }),
  user: one(users, { fields: [bookings.userId], references: [users.id] }),
}));

export const guestsRelations = relations(guests, ({ one, many }) => ({
  user: one(users, { fields: [guests.userId], references: [users.id] }),
  bookings: many(bookings),
}));
