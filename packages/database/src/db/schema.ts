import { pgTable, uuid, varchar, text, integer, timestamp, boolean, pgEnum, jsonb } from "drizzle-orm/pg-core";

// Enums sesuai dengan Zod di shared
export const roleEnum = pgEnum("user_role", ["user", "agent", "admin", "super_admin"]);
export const statusEnum = pgEnum("user_status", ["pending", "active", "suspended"]);

// 1. Users Table
export const users = pgTable("users", {
    id: uuid("id").primaryKey().defaultRandom(),
    email: varchar("email", { length: 255 }).notNull().unique(),
    passwordHash: text("password_hash").notNull(),
    name: varchar("name", { length: 255 }).notNull(),
    phone: varchar("phone", { length: 20 }),
    role: roleEnum("role").default("user").notNull(),
    status: statusEnum("status").default("pending").notNull(),
    walletAddress: varchar("wallet_address", { length: 42 }), // Hidden on UX
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// 2. Agents Table
export const agents = pgTable("agents", {
    id: uuid("id").primaryKey().defaultRandom(),
    userId: uuid("user_id").references(() => users.id).notNull(),
    referralCode: varchar("referral_code", { length: 50 }).notNull().unique(),
    isActive: boolean("is_active").default(true).notNull(),
});

// 3. Points Ledger (Source of Truth)
export const pointsLedger = pgTable("points_ledger", {
    id: uuid("id").primaryKey().defaultRandom(),
    userId: uuid("user_id").references(() => users.id).notNull(),
    amount: integer("amount").notNull(), // Bisa positif atau negatif
    reason: text("reason").notNull(),
    source: varchar("source", { length: 50 }).notNull(), // 'admin', 'system', 'redeem'
    adminId: uuid("admin_id").references(() => users.id),
    onchainTx: varchar("onchain_tx", { length: 100 }),
    createdAt: timestamp("created_at").defaultNow().notNull(),
});

// 4. Points Balance (Cache / Snapshot)
export const pointsBalance = pgTable("points_balance", {
    userId: uuid("user_id").primaryKey().references(() => users.id).notNull(),
    balance: integer("balance").default(0).notNull(),
    updatedAt: timestamp("updated_at").defaultNow().notNull(),
});