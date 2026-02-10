import {
    pgTable, serial, text, timestamp, integer,
    boolean, pgEnum, uuid, jsonb, date
} from "drizzle-orm/pg-core";

// --- ENUMS ---
export const roleEnum = pgEnum("user_role", [
    "super_admin", "admin_input", "admin_view", "agent", "nasabah"
]);

export const redeemStatusEnum = pgEnum("redeem_status", [
    "pending", "processing", "ready", "completed", "cancelled", "rejected"
]);

// --- TABLES ---

// 1. Users (Identity & Core Balance)
export const users = pgTable("users", {
    id: uuid("id").primaryKey().defaultRandom(),
    userId: text("user_id").unique().notNull(),
    password: text("password").notNull(),
    role: roleEnum("role").notNull(),
    pointsBalance: integer("points_balance").notNull().default(0),
    isActive: boolean("is_active").default(false),
    additionalMetadata: jsonb("additional_metadata").default({}), // Field dinamis Admin
    createdAt: timestamp("created_at").defaultNow(),
});

// 2. Agent Activation Codes (Unique Code Logic)
export const agentActivationCodes = pgTable("agent_activation_codes", {
    id: serial("id").primaryKey(),
    code: text("code").unique().notNull(),
    isUsed: boolean("is_used").default(false),
    generatedBy: uuid("generated_by").references(() => users.id),
    usedBy: uuid("used_by").references(() => users.id),
    createdAt: timestamp("created_at").defaultNow(),
});

// 3. Profiles (User Details)
export const profiles = pgTable("profiles", {
    id: uuid("id").primaryKey().defaultRandom(),
    userId: uuid("user_id").references(() => users.id).notNull(),
    fullName: text("full_name").notNull(),
    email: text("email"),
    whatsapp: text("whatsapp").notNull(),
    referredByAgentId: text("referred_by_agent_id"), // Relasi ke Agent
});

// 4. Products (Menu Produk: Beli -> Dapat Poin)
export const products = pgTable("products", {
    id: serial("id").primaryKey(),
    name: text("name").notNull(),
    description: text("description"),
    pointsReward: integer("points_reward").notNull(),
    mediaUrl: text("media_url"),
    isActive: boolean("is_active").default(true),
});

// 5. Rewards (Katalog Penukaran: Poin -> Servis)
export const rewards = pgTable("rewards", {
    id: serial("id").primaryKey(),
    title: text("title").notNull(),
    description: text("description"),
    requiredPoints: integer("required_points").notNull(),
    isActive: boolean("is_active").default(true),
});

// 6. Points Ledger (Atomic Audit Trail)
export const pointsLedger = pgTable("points_ledger", {
    id: serial("id").primaryKey(),
    userId: uuid("user_id").references(() => users.id).notNull(),
    amount: integer("amount").notNull(),
    source: text("source").notNull(), // 'welcome', 'daily', 'purchase', 'redeem', 'refund'
    description: text("description"),
    createdAt: timestamp("created_at").defaultNow(),
});

// 7. Login Logs (Guard Poin Harian)
export const loginLogs = pgTable("login_logs", {
    id: serial("id").primaryKey(),
    userId: uuid("user_id").references(() => users.id).notNull(),
    loginDate: date("login_date").defaultNow(),
});

// 8. Polis Data (Sales & Omset Tracker)
export const polisData = pgTable("polis_data", {
    id: serial("id").primaryKey(),
    agentId: uuid("agent_id").references(() => users.id).notNull(),
    nasabahId: uuid("nasabah_id").references(() => users.id).notNull(),
    polisNumber: text("polis_number").unique().notNull(),
    premiumAmount: integer("premium_amount").notNull(),
    inputBy: uuid("input_by_admin_id").references(() => users.id),
    createdAt: timestamp("created_at").defaultNow(),
});

// 9. Redeem Requests (Manajemen Status Servis)
export const redeemRequests = pgTable("redeem_requests", {
    id: uuid("id").primaryKey().defaultRandom(),
    nasabahId: uuid("nasabah_id").references(() => users.id).notNull(),
    rewardId: integer("reward_id").references(() => rewards.id),
    status: redeemStatusEnum("status").default("pending"),
    adminNotes: text("admin_notes"),
    createdAt: timestamp("created_at").defaultNow(),
    updatedAt: timestamp("updated_at"),
    metadata: jsonb("metadata").default({}),
});

// 10. WA Interactions (Watchdog 5 Menit)
export const waInteractions = pgTable("wa_interactions", {
    id: serial("id").primaryKey(),
    nasabahId: uuid("nasabah_id").references(() => users.id),
    agentId: uuid("agent_id").references(() => users.id),
    clickedAt: timestamp("clicked_at").defaultNow(),
    isAdminNotified: boolean("is_admin_notified").default(false),
});

// 11. Announcements (Pop-up Promo/Video)
export const announcements = pgTable("announcements", {
    id: serial("id").primaryKey(),
    title: text("title"),
    videoUrl: text("video_url"),
    content: text("content"),
    isActive: boolean("is_active").default(true),
});

// 12. Announcement Views (Engagement Tracker)
export const announcementViews = pgTable("announcement_views", {
    id: serial("id").primaryKey(),
    announcementId: integer("announcement_id").references(() => announcements.id),
    userId: uuid("user_id").references(() => users.id),
    viewedAt: timestamp("viewed_at").defaultNow(),
});

// 13. Admin Actions (Audit Trail Perilaku Admin)
export const adminActions = pgTable("admin_actions", {
    id: serial("id").primaryKey(),
    adminId: uuid("admin_id").references(() => users.id),
    action: text("action").notNull(),
    details: jsonb("details"),
    createdAt: timestamp("created_at").defaultNow(),
});