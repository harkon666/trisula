import {
    pgTable, uuid, varchar, text, integer,
    timestamp, boolean, pgEnum, jsonb, bigint, numeric
} from "drizzle-orm/pg-core";

// --- ENUMS ---
export const roleEnum = pgEnum("user_role", ["user", "agent", "admin", "super_admin"]);
export const statusEnum = pgEnum("user_status", ["pending", "active", "suspended"]);
export const pointsSourceEnum = pgEnum("points_source", ["system", "admin", "redeem", "yield", "transaction"]);
export const redeemStatusEnum = pgEnum("redeem_status", ["pending", "processing", "ready", "completed", "cancelled", "rejected"]);
export const contentTypeEnum = pgEnum("content_type", ["news", "promo", "testimonial"]);

// 1️⃣ USERS
export const users = pgTable("users", {
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
    updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// 2️⃣ AGENTS
export const agents = pgTable("agents", {
    id: uuid("id").primaryKey().defaultRandom(),
    userId: uuid("user_id").references(() => users.id).notNull(),
    referralCode: varchar("referral_code", { length: 50 }).notNull().unique(),
    isActive: boolean("is_active").default(true).notNull(),
    createdAt: timestamp("created_at").defaultNow().notNull(),
});

// 3️⃣ REFERRALS (READ-ONLY MIRROR FROM BLOCKCHAIN)
export const referrals = pgTable("referrals", {
    id: uuid("id").primaryKey().defaultRandom(),
    userId: uuid("user_id").references(() => users.id).notNull(),
    agentId: uuid("agent_id").references(() => agents.id).notNull(),
    txHash: varchar("tx_hash", { length: 100 }).notNull(),
    blockNumber: integer("block_number"),
    createdAt: timestamp("created_at").defaultNow().notNull(),
});

// 4️⃣ POINTS BALANCE
export const pointsBalance = pgTable("points_balance", {
    userId: uuid("user_id").primaryKey().references(() => users.id).notNull(),
    balance: integer("balance").default(0).notNull(),
    updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// 5️⃣ POINTS LEDGER (CRITICAL SOURCE OF TRUTH)
export const pointsLedger = pgTable("points_ledger", {
    id: uuid("id").primaryKey().defaultRandom(),
    userId: uuid("user_id").references(() => users.id).notNull(),
    amount: integer("amount").notNull(),
    reason: text("reason").notNull(),
    source: pointsSourceEnum("source").notNull(),
    adminId: uuid("admin_id").references(() => users.id), // Nullable if system
    onchainTx: varchar("onchain_tx", { length: 100 }),
    createdAt: timestamp("created_at").defaultNow().notNull(),
});

// 6️⃣ FIAT ACCOUNTS (SIMULATED BANKING)
export const fiatAccounts = pgTable("fiat_accounts", {
    id: uuid("id").primaryKey().defaultRandom(),
    userId: uuid("user_id").references(() => users.id).notNull().unique(),
    balance: numeric("balance", { precision: 20, scale: 2 }).default('0').notNull(),
    currency: varchar("currency", { length: 10 }).default("IDR").notNull(),
    updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// 7️⃣ LOYALTY TIERS CONFIG
export const loyaltyTiers = pgTable("loyalty_tiers", {
    id: integer("id").primaryKey().generatedAlwaysAsIdentity(),
    name: varchar("name", { length: 50 }).notNull(), // Bronze, Silver, Gold, Platinum
    minAum: numeric("min_aum", { precision: 20, scale: 2 }).notNull(),
    yieldMultiplier: numeric("yield_multiplier", { precision: 5, scale: 2 }).notNull(),
    description: text("description"),
});

// 8️⃣ DAILY YIELD LOGS
export const dailyYieldLogs = pgTable("daily_yield_logs", {
    id: uuid("id").primaryKey().defaultRandom(),
    userId: uuid("user_id").references(() => users.id).notNull(),
    date: varchar("date", { length: 10 }).notNull(), // YYYY-MM-DD
    totalAum: numeric("total_aum", { precision: 20, scale: 2 }).notNull(),
    yieldEarned: integer("yield_earned").notNull(),
    tierAtTime: varchar("tier_at_time", { length: 50 }).notNull(),
    createdAt: timestamp("created_at").defaultNow().notNull(),
});

// 9️⃣ REDEEM CATALOG
export const redeemCatalog = pgTable("redeem_catalog", {
    id: integer("id").primaryKey().generatedAlwaysAsIdentity(),
    name: varchar("name", { length: 255 }).notNull(),
    pointsRequired: integer("points_required").notNull(),
    description: text("description"),
    isActive: boolean("is_active").default(true).notNull(),
});

// 🔟 REDEEM REQUESTS
export const redeemRequests = pgTable("redeem_requests", {
    id: uuid("id").primaryKey().defaultRandom(),
    userId: uuid("user_id").references(() => users.id).notNull(),
    rewardId: integer("reward_id").references(() => redeemCatalog.id).notNull(),
    pointsUsed: integer("points_used").notNull(),
    whatsappNumber: varchar("whatsapp_number", { length: 20 }).notNull(),
    status: redeemStatusEnum("status").default("pending").notNull(),
    txHash: varchar("tx_hash", { length: 100 }),
    metadata: jsonb("metadata"),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// 1️⃣1️⃣ ADMIN ACTIONS (AUDIT LOG)
export const adminActions = pgTable("admin_actions", {
    id: uuid("id").primaryKey().defaultRandom(),
    adminId: uuid("admin_id").references(() => users.id).notNull(),
    actionType: varchar("action_type", { length: 100 }).notNull(),
    entity: varchar("entity", { length: 50 }).notNull(),
    entityId: uuid("entity_id").notNull(),
    payload: jsonb("payload"),
    createdAt: timestamp("created_at").defaultNow().notNull(),
});

// 1️⃣2️⃣ CONTENT POSTS (CMS)
export const contentPosts = pgTable("content_posts", {
    id: uuid("id").primaryKey().defaultRandom(),
    title: varchar("title", { length: 255 }).notNull(),
    type: contentTypeEnum("type").notNull(),
    content: text("content").notNull(),
    mediaUrl: text("media_url"),
    publishedAt: timestamp("published_at"),
    createdAt: timestamp("created_at").defaultNow().notNull(),
});