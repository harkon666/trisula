var __defProp = Object.defineProperty;
var __export = (target, all) => {
  for (var name in all)
    __defProp(target, name, { get: all[name], enumerable: true });
};

// src/index.ts
import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";

// src/db/schema.ts
var schema_exports = {};
__export(schema_exports, {
  adminActions: () => adminActions,
  agents: () => agents,
  contentPosts: () => contentPosts,
  contentTypeEnum: () => contentTypeEnum,
  dailyYieldLogs: () => dailyYieldLogs,
  fiatAccounts: () => fiatAccounts,
  loyaltyTiers: () => loyaltyTiers,
  pointsBalance: () => pointsBalance,
  pointsLedger: () => pointsLedger,
  pointsSourceEnum: () => pointsSourceEnum,
  redeemCatalog: () => redeemCatalog,
  redeemRequests: () => redeemRequests,
  redeemStatusEnum: () => redeemStatusEnum,
  referrals: () => referrals,
  roleEnum: () => roleEnum,
  statusEnum: () => statusEnum,
  users: () => users
});
import {
  pgTable,
  uuid,
  varchar,
  text,
  integer,
  timestamp,
  boolean,
  pgEnum,
  jsonb,
  numeric
} from "drizzle-orm/pg-core";
var roleEnum = pgEnum("user_role", ["user", "agent", "admin", "super_admin"]);
var statusEnum = pgEnum("user_status", ["pending", "active", "suspended"]);
var pointsSourceEnum = pgEnum("points_source", ["system", "admin", "redeem", "yield", "transaction"]);
var redeemStatusEnum = pgEnum("redeem_status", ["pending", "processing", "completed", "rejected"]);
var contentTypeEnum = pgEnum("content_type", ["news", "promo", "testimonial"]);
var users = pgTable("users", {
  id: uuid("id").primaryKey().defaultRandom(),
  email: varchar("email", { length: 255 }).notNull().unique(),
  passwordHash: text("password_hash").notNull(),
  name: varchar("name", { length: 255 }).notNull(),
  phone: varchar("phone", { length: 20 }),
  city: varchar("city", { length: 100 }),
  walletAddress: varchar("wallet_address", { length: 42 }),
  role: roleEnum("role").default("user").notNull(),
  status: statusEnum("status").default("pending").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull()
});
var agents = pgTable("agents", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: uuid("user_id").references(() => users.id).notNull(),
  referralCode: varchar("referral_code", { length: 50 }).notNull().unique(),
  isActive: boolean("is_active").default(true).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull()
});
var referrals = pgTable("referrals", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: uuid("user_id").references(() => users.id).notNull(),
  agentId: uuid("agent_id").references(() => agents.id).notNull(),
  txHash: varchar("tx_hash", { length: 100 }).notNull(),
  blockNumber: integer("block_number"),
  createdAt: timestamp("created_at").defaultNow().notNull()
});
var pointsBalance = pgTable("points_balance", {
  userId: uuid("user_id").primaryKey().references(() => users.id).notNull(),
  balance: integer("balance").default(0).notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull()
});
var pointsLedger = pgTable("points_ledger", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: uuid("user_id").references(() => users.id).notNull(),
  amount: integer("amount").notNull(),
  reason: text("reason").notNull(),
  source: pointsSourceEnum("source").notNull(),
  adminId: uuid("admin_id").references(() => users.id),
  // Nullable if system
  onchainTx: varchar("onchain_tx", { length: 100 }),
  createdAt: timestamp("created_at").defaultNow().notNull()
});
var fiatAccounts = pgTable("fiat_accounts", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: uuid("user_id").references(() => users.id).notNull().unique(),
  balance: numeric("balance", { precision: 20, scale: 2 }).default("0").notNull(),
  currency: varchar("currency", { length: 10 }).default("IDR").notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull()
});
var loyaltyTiers = pgTable("loyalty_tiers", {
  id: integer("id").primaryKey().generatedAlwaysAsIdentity(),
  name: varchar("name", { length: 50 }).notNull(),
  // Bronze, Silver, Gold, Platinum
  minAum: numeric("min_aum", { precision: 20, scale: 2 }).notNull(),
  yieldMultiplier: numeric("yield_multiplier", { precision: 5, scale: 2 }).notNull(),
  description: text("description")
});
var dailyYieldLogs = pgTable("daily_yield_logs", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: uuid("user_id").references(() => users.id).notNull(),
  date: varchar("date", { length: 10 }).notNull(),
  // YYYY-MM-DD
  totalAum: numeric("total_aum", { precision: 20, scale: 2 }).notNull(),
  yieldEarned: integer("yield_earned").notNull(),
  tierAtTime: varchar("tier_at_time", { length: 50 }).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull()
});
var redeemCatalog = pgTable("redeem_catalog", {
  id: integer("id").primaryKey().generatedAlwaysAsIdentity(),
  name: varchar("name", { length: 255 }).notNull(),
  pointsRequired: integer("points_required").notNull(),
  description: text("description"),
  isActive: boolean("is_active").default(true).notNull()
});
var redeemRequests = pgTable("redeem_requests", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: uuid("user_id").references(() => users.id).notNull(),
  catalogId: integer("catalog_id").references(() => redeemCatalog.id).notNull(),
  pointsUsed: integer("points_used").notNull(),
  whatsappNumber: varchar("whatsapp_number", { length: 20 }).notNull(),
  status: redeemStatusEnum("status").default("pending").notNull(),
  onchainTx: varchar("onchain_tx", { length: 100 }),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull()
});
var adminActions = pgTable("admin_actions", {
  id: uuid("id").primaryKey().defaultRandom(),
  adminId: uuid("admin_id").references(() => users.id).notNull(),
  actionType: varchar("action_type", { length: 100 }).notNull(),
  entity: varchar("entity", { length: 50 }).notNull(),
  entityId: uuid("entity_id").notNull(),
  payload: jsonb("payload"),
  createdAt: timestamp("created_at").defaultNow().notNull()
});
var contentPosts = pgTable("content_posts", {
  id: uuid("id").primaryKey().defaultRandom(),
  title: varchar("title", { length: 255 }).notNull(),
  type: contentTypeEnum("type").notNull(),
  content: text("content").notNull(),
  mediaUrl: text("media_url"),
  publishedAt: timestamp("published_at"),
  createdAt: timestamp("created_at").defaultNow().notNull()
});

// src/index.ts
var connectionString = process.env.DATABASE_URL;
if (!connectionString) {
  throw new Error("DATABASE_URL is not configured");
}
var globalForDb = globalThis;
var client = globalForDb.conn ?? postgres(connectionString, { prepare: false });
if (process.env.NODE_ENV !== "production") {
  globalForDb.conn = client;
  console.log("\u{1F4E6} (Re)using database connection...");
} else {
}
var db = drizzle(client, { schema: schema_exports });
export {
  adminActions,
  agents,
  contentPosts,
  contentTypeEnum,
  dailyYieldLogs,
  db,
  fiatAccounts,
  loyaltyTiers,
  pointsBalance,
  pointsLedger,
  pointsSourceEnum,
  redeemCatalog,
  redeemRequests,
  redeemStatusEnum,
  referrals,
  roleEnum,
  statusEnum,
  users
};
