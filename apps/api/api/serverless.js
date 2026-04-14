var __defProp = Object.defineProperty;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __esm = (fn, res) => function __init() {
  return fn && (res = (0, fn[__getOwnPropNames(fn)[0]])(fn = 0)), res;
};
var __export = (target, all) => {
  for (var name in all)
    __defProp(target, name, { get: all[name], enumerable: true });
};

// ../../packages/database/dist/index.mjs
var dist_exports = {};
__export(dist_exports, {
  adminActions: () => adminActions,
  agentActivationCodes: () => agentActivationCodes,
  announcementViews: () => announcementViews,
  announcements: () => announcements,
  db: () => db,
  loginLogs: () => loginLogs,
  pointsLedger: () => pointsLedger,
  polisData: () => polisData,
  products: () => products,
  profiles: () => profiles,
  redeemRequests: () => redeemRequests,
  redeemStatusEnum: () => redeemStatusEnum,
  rewards: () => rewards,
  roleEnum: () => roleEnum,
  userActivityLogs: () => userActivityLogs,
  users: () => users,
  waInteractions: () => waInteractions
});
import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import {
  pgTable,
  serial,
  text,
  timestamp,
  integer,
  boolean,
  pgEnum,
  uuid,
  jsonb,
  date
} from "drizzle-orm/pg-core";
var __defProp2, __export2, schema_exports, roleEnum, redeemStatusEnum, users, agentActivationCodes, profiles, products, rewards, pointsLedger, loginLogs, polisData, redeemRequests, waInteractions, announcements, announcementViews, adminActions, userActivityLogs, client, db;
var init_dist = __esm({
  "../../packages/database/dist/index.mjs"() {
    "use strict";
    __defProp2 = Object.defineProperty;
    __export2 = (target, all) => {
      for (var name in all)
        __defProp2(target, name, { get: all[name], enumerable: true });
    };
    schema_exports = {};
    __export2(schema_exports, {
      adminActions: () => adminActions,
      agentActivationCodes: () => agentActivationCodes,
      announcementViews: () => announcementViews,
      announcements: () => announcements,
      loginLogs: () => loginLogs,
      pointsLedger: () => pointsLedger,
      polisData: () => polisData,
      products: () => products,
      profiles: () => profiles,
      redeemRequests: () => redeemRequests,
      redeemStatusEnum: () => redeemStatusEnum,
      rewards: () => rewards,
      roleEnum: () => roleEnum,
      userActivityLogs: () => userActivityLogs,
      users: () => users,
      waInteractions: () => waInteractions
    });
    roleEnum = pgEnum("user_role", [
      "super_admin",
      "admin",
      "agent",
      "nasabah"
    ]);
    redeemStatusEnum = pgEnum("redeem_status", [
      "pending",
      "processing",
      "ready",
      "completed",
      "cancelled",
      "rejected"
    ]);
    users = pgTable("users", {
      id: uuid("id").primaryKey().defaultRandom(),
      userId: text("user_id").unique(),
      password: text("password").notNull(),
      role: roleEnum("role").notNull(),
      pointsBalance: integer("points_balance").notNull().default(0),
      isActive: boolean("is_active").default(false),
      additionalMetadata: jsonb("additional_metadata").default({}),
      // Field dinamis Admin
      createdAt: timestamp("created_at").defaultNow()
    });
    agentActivationCodes = pgTable("agent_activation_codes", {
      id: serial("id").primaryKey(),
      code: text("code").unique().notNull(),
      isUsed: boolean("is_used").default(false),
      generatedBy: uuid("generated_by").references(() => users.id),
      usedBy: uuid("used_by").references(() => users.id),
      createdAt: timestamp("created_at").defaultNow()
    });
    profiles = pgTable("profiles", {
      id: uuid("id").primaryKey().defaultRandom(),
      userId: uuid("user_id").references(() => users.id).notNull(),
      fullName: text("full_name").notNull(),
      email: text("email"),
      whatsapp: text("whatsapp").notNull(),
      referredByAgentId: text("referred_by_agent_id"),
      // Relasi ke Agent
      dateOfBirth: date("date_of_birth")
    });
    products = pgTable("products", {
      id: serial("id").primaryKey(),
      name: text("name").notNull(),
      description: text("description"),
      pointsReward: integer("points_reward").notNull(),
      mediaUrl: text("media_url"),
      isActive: boolean("is_active").default(true)
    });
    rewards = pgTable("rewards", {
      id: serial("id").primaryKey(),
      title: text("title").notNull(),
      description: text("description"),
      requiredPoints: integer("required_points").notNull(),
      csWhatsappNumber: text("cs_whatsapp_number"),
      // New field for CS Whatsapp
      isActive: boolean("is_active").default(true)
    });
    pointsLedger = pgTable("points_ledger", {
      id: serial("id").primaryKey(),
      userId: uuid("user_id").references(() => users.id).notNull(),
      amount: integer("amount").notNull(),
      source: text("source").notNull(),
      // 'welcome', 'daily', 'purchase', 'redeem', 'refund'
      description: text("description"),
      createdAt: timestamp("created_at").defaultNow()
    });
    loginLogs = pgTable("login_logs", {
      id: serial("id").primaryKey(),
      userId: uuid("user_id").references(() => users.id).notNull(),
      loginDate: date("login_date").defaultNow()
    });
    polisData = pgTable("polis_data", {
      id: serial("id").primaryKey(),
      agentId: uuid("agent_id").references(() => users.id).notNull(),
      nasabahId: uuid("nasabah_id").references(() => users.id).notNull(),
      polisNumber: text("polis_number").unique().notNull(),
      premiumAmount: integer("premium_amount").notNull(),
      inputBy: uuid("input_by_admin_id").references(() => users.id),
      createdAt: timestamp("created_at").defaultNow()
    });
    redeemRequests = pgTable("redeem_requests", {
      id: uuid("id").primaryKey().defaultRandom(),
      nasabahId: uuid("nasabah_id").references(() => users.id).notNull(),
      rewardId: integer("reward_id").references(() => rewards.id),
      status: redeemStatusEnum("status").default("pending"),
      adminNotes: text("admin_notes"),
      createdAt: timestamp("created_at").defaultNow(),
      updatedAt: timestamp("updated_at"),
      metadata: jsonb("metadata").default({})
    });
    waInteractions = pgTable("wa_interactions", {
      id: serial("id").primaryKey(),
      nasabahId: uuid("nasabah_id").references(() => users.id),
      agentId: uuid("agent_id").references(() => users.id),
      clickedAt: timestamp("clicked_at").defaultNow(),
      isAdminNotified: boolean("is_admin_notified").default(false)
    });
    announcements = pgTable("announcements", {
      id: serial("id").primaryKey(),
      title: text("title"),
      videoUrl: text("video_url"),
      content: text("content"),
      ctaUrl: text("cta_url"),
      isActive: boolean("is_active").default(true),
      createdAt: timestamp("created_at").defaultNow()
    });
    announcementViews = pgTable("announcement_views", {
      id: serial("id").primaryKey(),
      announcementId: integer("announcement_id").references(() => announcements.id),
      userId: uuid("user_id").references(() => users.id),
      viewedAt: timestamp("viewed_at").defaultNow()
    });
    adminActions = pgTable("admin_actions", {
      id: serial("id").primaryKey(),
      adminId: uuid("admin_id").references(() => users.id),
      action: text("action").notNull(),
      details: jsonb("details"),
      ipAddress: text("ip_address"),
      userAgent: text("user_agent"),
      createdAt: timestamp("created_at").defaultNow()
    });
    userActivityLogs = pgTable("user_activity_logs", {
      id: serial("id").primaryKey(),
      userId: uuid("user_id").references(() => users.id),
      action: text("action").notNull(),
      details: jsonb("details"),
      ipAddress: text("ip_address"),
      userAgent: text("user_agent"),
      createdAt: timestamp("created_at").defaultNow()
    });
    client = postgres(process.env.DATABASE_URL, {
      ssl: "require",
      max: 1,
      // critical for serverless - limits connections per function instance
      idle_timeout: 20,
      connect_timeout: 10
    });
    db = drizzle(client, { schema: schema_exports });
  }
});

// src/serverless.ts
import { handle } from "hono/vercel";

// src/index.ts
import { Hono as Hono14 } from "hono";
import { logger } from "hono/logger";
import { cors } from "hono/cors";

// src/routes/auth.ts
init_dist();
import { Hono } from "hono";
import { zValidator } from "@hono/zod-validator";
import { z } from "zod";
import { eq as eq2, and as and2, or } from "drizzle-orm";
import bcrypt from "bcryptjs";
import { SignJWT } from "jose";

// src/services/points.ts
init_dist();
import { eq, sql, and } from "drizzle-orm";
var PointsService = {
  /**
   * Add points to a user and record it in the ledger.
   * Supports running within an existing transaction.
   */
  async addPoints(userId, amount, source, description, tx) {
    const operation = async (transaction) => {
      await transaction.update(users).set({ pointsBalance: sql`${users.pointsBalance} + ${amount}` }).where(eq(users.id, userId));
      await transaction.insert(pointsLedger).values({
        userId,
        amount,
        source,
        description,
        createdAt: /* @__PURE__ */ new Date()
      });
    };
    if (tx) {
      await operation(tx);
    } else {
      await db.transaction(operation);
    }
  },
  /**
   * Recalculate user balance from the ledger and update the users table.
   * Useful for synchronization or fixing discrepancies.
   */
  async updateUserBalance(userId) {
    await db.transaction(async (tx) => {
      const [result] = await tx.select({ total: sql`cast(coalesce(sum(${pointsLedger.amount}), 0) as int)` }).from(pointsLedger).where(eq(pointsLedger.userId, userId));
      const total = result?.total || 0;
      await tx.update(users).set({ pointsBalance: total }).where(eq(users.id, userId));
    });
  },
  /**
   * Process daily login for a user.
   * Checks if user has logged in today, if not, awards daily points.
   */
  async processDailyLogin(userId) {
    const today = (/* @__PURE__ */ new Date()).toISOString().split("T")[0];
    return await db.transaction(async (tx) => {
      const [existing] = await tx.select().from(loginLogs).where(and(
        eq(loginLogs.userId, userId),
        eq(loginLogs.loginDate, today)
      )).limit(1);
      if (!existing) {
        await tx.insert(loginLogs).values({
          userId,
          loginDate: today
        });
        await tx.update(users).set({ pointsBalance: sql`${users.pointsBalance} + 10` }).where(eq(users.id, userId));
        await tx.insert(pointsLedger).values({
          userId,
          amount: 10,
          source: "daily",
          description: "Daily Login Bonus",
          createdAt: /* @__PURE__ */ new Date()
        });
        return { awarded: true, points: 10 };
      }
      return { awarded: false, points: 0 };
    });
  },
  /**
   * Check if a user has already claimed their daily bonus for today.
   */
  async isClaimedToday(userId) {
    const today = (/* @__PURE__ */ new Date()).toISOString().split("T")[0];
    const [existing] = await db.select().from(loginLogs).where(and(
      eq(loginLogs.userId, userId),
      eq(loginLogs.loginDate, today)
    )).limit(1);
    return !!existing;
  },
  /**
   * RESET daily login status for development/testing.
   * Deletes the log for today so the user can claim again.
   */
  async resetDailyLogin(userId) {
    const today = (/* @__PURE__ */ new Date()).toISOString().split("T")[0];
    await db.delete(loginLogs).where(and(
      eq(loginLogs.userId, userId),
      eq(loginLogs.loginDate, today)
    ));
  }
};

// src/routes/auth.ts
var auth = new Hono();
var JWT_SECRET = new TextEncoder().encode(process.env.JWT_SECRET || "super_secret_key_change_me");
var RegisterAgentSchema = z.object({
  password: z.string().min(6),
  fullName: z.string().min(2),
  email: z.string().email("Email tidak valid"),
  whatsapp: z.string().min(10),
  activationCode: z.string().min(5),
  dateOfBirth: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Format tanggal salah (YYYY-MM-DD)")
});
var RegisterNasabahSchema = z.object({
  password: z.string().min(6),
  fullName: z.string().min(2),
  email: z.string().email("Email tidak valid"),
  whatsapp: z.string().min(10),
  referredByAgentId: z.string().min(4),
  // User ID of the agent
  dateOfBirth: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Format tanggal salah (YYYY-MM-DD)")
});
var LoginSchema = z.object({
  userId: z.string(),
  password: z.string()
});
auth.post("/register/agent", zValidator("json", RegisterAgentSchema), async (c) => {
  const { password, fullName, email, whatsapp, activationCode, dateOfBirth } = c.req.valid("json");
  const userId = activationCode;
  try {
    return await db.transaction(async (tx) => {
      const [code] = await tx.select().from(agentActivationCodes).where(and2(
        eq2(agentActivationCodes.code, activationCode),
        eq2(agentActivationCodes.isUsed, false)
      )).limit(1);
      if (!code) {
        return c.json({ success: false, message: "Kode aktivasi tidak valid atau sudah digunakan" }, 400);
      }
      const [existingUser] = await tx.select().from(users).where(eq2(users.userId, userId)).limit(1);
      if (existingUser) {
        return c.json({ success: false, message: "User ID sudah digunakan" }, 400);
      }
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(password, salt);
      const [newUser] = await tx.insert(users).values({
        userId,
        password: hashedPassword,
        role: "agent",
        isActive: true
        // Agent active after valid code
      }).returning();
      if (!newUser) throw new Error("Failed to create user");
      await tx.insert(profiles).values({
        userId: newUser.id,
        fullName,
        email,
        whatsapp,
        dateOfBirth
      });
      await tx.update(agentActivationCodes).set({ isUsed: true, usedBy: newUser.id }).where(eq2(agentActivationCodes.id, code.id));
      await tx.insert(adminActions).values({
        action: "AGENT_REGISTER",
        details: { userId, code: activationCode },
        createdAt: /* @__PURE__ */ new Date()
      });
      const token = await new SignJWT({
        sub: newUser.id,
        role: newUser.role,
        userId: newUser.userId
      }).setProtectedHeader({ alg: "HS256" }).setIssuedAt().setExpirationTime("24h").sign(JWT_SECRET);
      return c.json({
        success: true,
        message: "Agent berhasil terdaftar",
        token,
        user: {
          userId: newUser.userId,
          role: newUser.role,
          pointsBalance: 0
          // New agents start with 0
        }
      }, 201);
    });
  } catch (error) {
    console.error("Agent Register Error:", error);
    return c.json({ success: false, message: "Internal Server Error" }, 500);
  }
});
auth.post("/register/nasabah", zValidator("json", RegisterNasabahSchema), async (c) => {
  const { password, fullName, email, whatsapp, referredByAgentId, dateOfBirth } = c.req.valid("json");
  try {
    return await db.transaction(async (tx) => {
      const [agent] = await tx.select().from(users).where(and2(eq2(users.userId, referredByAgentId), eq2(users.role, "agent"))).limit(1);
      if (!agent) {
        return c.json({ success: false, message: "Agent Referral ID tidak ditemukan" }, 400);
      }
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(password, salt);
      const [newUser] = await tx.insert(users).values({
        password: hashedPassword,
        role: "nasabah",
        isActive: true
      }).returning();
      if (!newUser) throw new Error("Failed to create user");
      await tx.insert(profiles).values({
        userId: newUser.id,
        fullName,
        email,
        whatsapp,
        referredByAgentId: agent.userId,
        // Store Agent User ID
        dateOfBirth
      });
      await PointsService.addPoints(newUser.id, 100, "welcome", "Welcome Bonus Nasabah", tx);
      await tx.insert(adminActions).values({
        action: "NASABAH_REGISTER",
        details: { referredBy: referredByAgentId },
        createdAt: /* @__PURE__ */ new Date()
      });
      const token = await new SignJWT({
        sub: newUser.id,
        role: newUser.role,
        userId: newUser.userId
      }).setProtectedHeader({ alg: "HS256" }).setIssuedAt().setExpirationTime("24h").sign(JWT_SECRET);
      return c.json({
        success: true,
        message: "Nasabah berhasil terdaftar",
        token,
        user: {
          userId: newUser.userId,
          role: newUser.role,
          pointsBalance: 50
          // Nasabah gets welcome bonus
        }
      }, 201);
    });
  } catch (error) {
    console.error("Nasabah Register Error:", error);
    return c.json({ success: false, message: "Internal Server Error" }, 500);
  }
});
auth.post("/login", zValidator("json", LoginSchema), async (c) => {
  const { userId, password } = c.req.valid("json");
  try {
    console.log(`[LOGIN ATTEMPT] userId: '${userId}'`);
    const [userWithProfile] = await db.select({
      user: {
        id: users.id,
        userId: users.userId,
        role: users.role,
        isActive: users.isActive,
        password: users.password,
        pointsBalance: users.pointsBalance,
        additionalMetadata: users.additionalMetadata
      },
      profile: profiles
    }).from(users).leftJoin(profiles, eq2(users.id, profiles.userId)).where(or(
      eq2(users.userId, userId),
      eq2(profiles.email, userId)
    )).limit(1);
    if (!userWithProfile) {
      console.log(`[LOGIN FAILED] User/Email not found: '${userId}'`);
      return c.json({ success: false, message: "User ID/Email atau Password salah" }, 401);
    }
    const user2 = userWithProfile.user;
    console.log(`[LOGIN FOUND] User: ${user2.userId}, Role: ${user2.role}, Active: ${user2.isActive}`);
    console.log(`[LOGIN AUTH] Verifying password... stored hash: ${user2.password.substring(0, 10)}...`);
    const isValid = await bcrypt.compare(password, user2.password);
    console.log(`[LOGIN RESULT] Password Valid: ${isValid}`);
    if (!isValid) {
      return c.json({ success: false, message: "User ID/Email atau Password salah" }, 401);
    }
    if (!user2.isActive) {
      return c.json({ success: false, message: "Akun belum aktif" }, 403);
    }
    const dailyBonus = await PointsService.processDailyLogin(user2.id);
    const dailyMessage = dailyBonus.awarded ? " + 10 Poin Harian!" : "";
    const ipAddress = c.req.header("x-forwarded-for") || c.req.header("cf-connecting-ip") || "unknown";
    const userAgent = c.req.header("user-agent");
    if (["admin", "super_admin"].includes(user2.role)) {
      await db.insert(adminActions).values({
        adminId: user2.id,
        action: "LOGIN",
        details: { method: "password" },
        ipAddress,
        userAgent,
        createdAt: /* @__PURE__ */ new Date()
      });
    } else {
      await db.insert(userActivityLogs).values({
        userId: user2.id,
        action: "LOGIN",
        details: { method: "password" },
        ipAddress,
        userAgent,
        createdAt: /* @__PURE__ */ new Date()
      });
    }
    const token = await new SignJWT({
      sub: user2.id,
      role: user2.role,
      userId: user2.userId
    }).setProtectedHeader({ alg: "HS256" }).setIssuedAt().setExpirationTime("24h").sign(JWT_SECRET);
    return c.json({
      success: true,
      message: `Login berhasil${dailyMessage}`,
      token,
      user: {
        userId: user2.userId,
        role: user2.role,
        points: user2.pointsBalance + (dailyBonus.awarded ? 10 : 0),
        additionalMetadata: user2.additionalMetadata
      }
    });
  } catch (error) {
    console.error("Login Error:", error);
    return c.json({ success: false, message: "Internal Server Error" }, 500);
  }
});
var auth_default = auth;

// src/routes/user.ts
init_dist();
import { Hono as Hono2 } from "hono";
import { eq as eq4, desc } from "drizzle-orm";

// src/middlewares/rbac.ts
init_dist();
import { eq as eq3 } from "drizzle-orm";
var rbacMiddleware = (moduleName) => {
  return async (c, next) => {
    const user2 = c.get("user");
    if (!user2 || !user2.role) {
      console.log(`[RBAC] Access Denied: User context missing or role not found for ${c.req.path}`);
      return c.json({ success: false, message: "Unauthorized: No user role found" }, 401);
    }
    const role = user2.role;
    const method = c.req.method;
    if (role === "super_admin") {
      await next();
      return;
    }
    if (role === "admin") {
      const requiredPermission = ["POST", "PUT", "PATCH", "DELETE"].includes(method) ? "write" : "read";
      if (moduleName) {
        const [freshUser] = await db.select({
          additionalMetadata: users.additionalMetadata
        }).from(users).where(eq3(users.id, user2.id)).limit(1);
        const permissionsObj = freshUser?.additionalMetadata?.permissions;
        if (permissionsObj && Array.isArray(permissionsObj[moduleName])) {
          const modulePermissions = permissionsObj[moduleName];
          if (modulePermissions.includes(requiredPermission)) {
            await next();
            return;
          }
          return c.json({
            success: false,
            message: `Forbidden: Lacks '${requiredPermission}' permission for module '${moduleName}'`
          }, 403);
        }
        return c.json({
          success: false,
          message: `Forbidden: Module '${moduleName}' not configured for this admin`
        }, 403);
      }
      await next();
      return;
    }
    if (role === "agent" || role === "nasabah") {
      await next();
      return;
    }
    return c.json({ success: false, message: "Forbidden: Unknown Role" }, 403);
  };
};

// src/routes/user.ts
var user = new Hono2();
user.use("*", rbacMiddleware());
user.get("/profile", async (c) => {
  const contextUser = c.get("user");
  if (!contextUser) return c.json({ success: false, message: "Unauthorized" }, 401);
  try {
    const [userData] = await db.select({
      id: users.id,
      userId: users.userId,
      fullName: profiles.fullName,
      email: profiles.email,
      whatsapp: profiles.whatsapp,
      role: users.role,
      status: users.isActive,
      points: users.pointsBalance
    }).from(users).leftJoin(profiles, eq4(users.id, profiles.userId)).where(eq4(users.id, contextUser.id)).limit(1);
    if (!userData) {
      return c.json({ success: false, message: "User not found" }, 404);
    }
    const isDailyClaimed = await PointsService.isClaimedToday(contextUser.id);
    return c.json({
      success: true,
      data: {
        ...userData,
        points: userData.points || 0,
        isDailyClaimed
      }
    });
  } catch (error) {
    console.error("Profile Error:", error);
    return c.json({ success: false, message: "Failed to fetch profile" }, 500);
  }
});
user.get("/activity", async (c) => {
  const contextUser = c.get("user");
  if (!contextUser) return c.json({ success: false, message: "Unauthorized" }, 401);
  try {
    const history = await db.select({
      id: pointsLedger.id,
      amount: pointsLedger.amount,
      description: pointsLedger.description,
      source: pointsLedger.source,
      createdAt: pointsLedger.createdAt
    }).from(pointsLedger).where(eq4(pointsLedger.userId, contextUser.id)).orderBy(desc(pointsLedger.createdAt)).limit(50);
    const userRedeems = await db.select({
      itemName: rewards.title,
      csWhatsappNumber: rewards.csWhatsappNumber
    }).from(redeemRequests).leftJoin(rewards, eq4(redeemRequests.rewardId, rewards.id)).where(eq4(redeemRequests.nasabahId, contextUser.id));
    const enrichedHistory = history.map((log) => {
      if (log.source === "redeem") {
        const title = log.description?.replace("Penukaran untuk ", "") || "";
        const matchedRedeem = userRedeems.find((r) => r.itemName === title);
        return {
          ...log,
          csWhatsappNumber: matchedRedeem?.csWhatsappNumber || null
        };
      }
      return log;
    });
    return c.json({
      success: true,
      data: enrichedHistory
    });
  } catch (error) {
    console.error("Activity Error:", error);
    return c.json({ success: false, message: "Failed to fetch activity" }, 500);
  }
});
user.get("/my-referrals", async (c) => {
  const contextUser = c.get("user");
  if (contextUser.role !== "agent" && contextUser.role !== "super_admin") {
    return c.json({ success: false, message: "Forbidden: Only Agents can view referrals" }, 403);
  }
  try {
    const list = await db.select({
      id: users.id,
      userId: users.userId,
      fullName: profiles.fullName,
      whatsapp: profiles.whatsapp,
      joinedAt: users.createdAt,
      pointsBalance: users.pointsBalance
    }).from(users).leftJoin(profiles, eq4(users.id, profiles.userId)).where(eq4(profiles.referredByAgentId, contextUser.userId)).orderBy(desc(users.createdAt));
    return c.json({
      success: true,
      data: list
    });
  } catch (error) {
    console.error("Referrals Error:", error);
    return c.json({ success: false, message: "Failed to fetch referrals" }, 500);
  }
});
user.post("/daily-checkin", async (c) => {
  const contextUser = c.get("user");
  if (!contextUser) return c.json({ success: false, message: "Unauthorized" }, 401);
  try {
    const result = await PointsService.processDailyLogin(contextUser.id);
    if (result.awarded) {
      return c.json({
        success: true,
        awarded: true,
        points: result.points,
        message: `+${result.points} Poin Harian berhasil diklaim!`
      });
    }
    return c.json({
      success: true,
      awarded: false,
      points: 0,
      message: "Poin harian sudah diklaim hari ini."
    });
  } catch (error) {
    console.error("Daily Check-in Error:", error);
    return c.json({ success: false, message: "Failed to process daily check-in" }, 500);
  }
});
user.post("/dev-reset-daily", async (c) => {
  const contextUser = c.get("user");
  if (!contextUser) return c.json({ success: false, message: "Unauthorized" }, 401);
  try {
    await PointsService.resetDailyLogin(contextUser.id);
    return c.json({
      success: true,
      message: "Daily check-in status reset. You can now claim again."
    });
  } catch (error) {
    console.error("Dev Reset Error:", error);
    return c.json({ success: false, message: "Failed to reset daily status" }, 500);
  }
});
var user_default = user;

// src/routes/redeem.ts
init_dist();
import { Hono as Hono3 } from "hono";
import { zValidator as zValidator2 } from "@hono/zod-validator";
import { eq as eq5, sql as sql3, desc as desc2 } from "drizzle-orm";
import { z as z2 } from "zod";
var redeem = new Hono3();
redeem.use("*", rbacMiddleware());
var RedeemInputSchema = z2.object({
  rewardId: z2.number().int(),
  whatsappNumber: z2.string().min(10).optional()
  // Optional if already in profile? Let's require for confirmation
});
redeem.get("/catalog", async (c) => {
  try {
    const items = await db.select().from(rewards).where(eq5(rewards.isActive, true));
    return c.json({ success: true, data: items });
  } catch (error) {
    return c.json({ success: false, message: "Failed to fetch catalog" }, 500);
  }
});
redeem.get("/my-requests", async (c) => {
  const user2 = c.get("user");
  if (!user2) return c.json({ success: false, message: "Unauthorized" }, 401);
  try {
    const requests = await db.select({
      id: redeemRequests.id,
      rewardId: redeemRequests.rewardId,
      itemName: rewards.title,
      pointsUsed: rewards.requiredPoints,
      // Or from request metadata if stored?
      status: redeemRequests.status,
      createdAt: redeemRequests.createdAt,
      updatedAt: redeemRequests.updatedAt,
      metadata: redeemRequests.metadata
    }).from(redeemRequests).leftJoin(rewards, eq5(redeemRequests.rewardId, rewards.id)).where(eq5(redeemRequests.nasabahId, user2.id)).orderBy(desc2(redeemRequests.createdAt));
    return c.json({ success: true, data: requests });
  } catch (error) {
    console.error("My Requests Error:", error);
    return c.json({ success: false, message: "Failed to fetch requests" }, 500);
  }
});
redeem.post("/", zValidator2("json", RedeemInputSchema), async (c) => {
  const user2 = c.get("user");
  if (!user2) return c.json({ success: false, message: "Unauthorized" }, 401);
  const { rewardId, whatsappNumber } = c.req.valid("json");
  try {
    const result = await db.transaction(async (tx) => {
      const [item] = await tx.select().from(rewards).where(eq5(rewards.id, rewardId)).limit(1);
      if (!item) {
        throw new Error("Reward Item not found");
      }
      const [userRecord] = await tx.select().from(users).where(eq5(users.id, user2.id)).limit(1);
      const currentBalance = userRecord?.pointsBalance || 0;
      if (currentBalance < item.requiredPoints) {
        throw new Error("Poin tidak mencukupi");
      }
      await tx.update(users).set({ pointsBalance: sql3`${users.pointsBalance} - ${item.requiredPoints}` }).where(eq5(users.id, user2.id));
      await tx.insert(pointsLedger).values({
        userId: user2.id,
        amount: -item.requiredPoints,
        source: "redeem",
        description: `Penukaran untuk ${item.title}`,
        createdAt: /* @__PURE__ */ new Date()
      });
      const [request] = await tx.insert(redeemRequests).values({
        nasabahId: user2.id,
        rewardId,
        status: "pending",
        adminNotes: whatsappNumber ? `WA: ${whatsappNumber}` : void 0,
        metadata: { itemName: item.title, price: item.requiredPoints }
        // Store snapshot
      }).returning({ id: redeemRequests.id });
      if (!request) throw new Error("Failed to create redeem request");
      return request;
    });
    return c.json({
      success: true,
      message: "Permintaan penukaran berhasil dibuat. Mohon tunggu konfirmasi admin.",
      data: {
        requestId: result.id,
        status: "pending"
      }
    }, 201);
  } catch (error) {
    console.error("Redeem Logic Error:", error);
    const isClientError = error.message === "Poin tidak mencukupi" || error.message === "Reward Item not found";
    return c.json({ success: false, message: error.message || "Internal Server Error" }, isClientError ? 400 : 500);
  }
});
var CancelInputSchema = z2.object({
  reason: z2.string().optional()
});
redeem.post("/:id/cancel", zValidator2("json", CancelInputSchema), async (c) => {
  const user2 = c.get("user");
  if (!user2) return c.json({ success: false, message: "Unauthorized" }, 401);
  const requestId = c.req.param("id");
  const { reason } = c.req.valid("json");
  try {
    return await db.transaction(async (tx) => {
      const [request] = await tx.select({
        id: redeemRequests.id,
        status: redeemRequests.status,
        nasabahId: redeemRequests.nasabahId,
        rewardId: redeemRequests.rewardId,
        metadata: redeemRequests.metadata,
        requiredPoints: rewards.requiredPoints
        // Join to get points back? Or use metadata snapshot?
      }).from(redeemRequests).leftJoin(rewards, eq5(redeemRequests.rewardId, rewards.id)).where(eq5(redeemRequests.id, requestId)).limit(1);
      if (!request) {
        return c.json({ success: false, message: "Request not found (404)" }, 404);
      }
      if (request.nasabahId !== user2.id) {
        return c.json({ success: false, message: "Unauthorized" }, 403);
      }
      const CANCELLABLE_STATES = ["pending"];
      if (!request.status || !CANCELLABLE_STATES.includes(request.status)) {
        return c.json({
          success: false,
          message: `Pesanan dengan status "${request.status}" tidak dapat dibatalkan.`
        }, 400);
      }
      const pointCost = request.metadata?.price || request.requiredPoints || 0;
      await tx.update(users).set({ pointsBalance: sql3`${users.pointsBalance} + ${pointCost}` }).where(eq5(users.id, user2.id));
      await tx.insert(pointsLedger).values({
        userId: user2.id,
        amount: pointCost,
        source: "refund",
        description: `Refund: Pembatalan User (${reason || "User cancelled request"})`,
        // Merged reason into description
        createdAt: /* @__PURE__ */ new Date()
      });
      await tx.update(redeemRequests).set({
        status: "cancelled",
        updatedAt: /* @__PURE__ */ new Date(),
        metadata: { ...request.metadata, cancelledBy: "user", cancelledAt: (/* @__PURE__ */ new Date()).toISOString() }
      }).where(eq5(redeemRequests.id, requestId));
      return c.json({
        success: true,
        message: "Pembatalan berhasil. Poin telah dikembalikan ke saldo Anda."
      });
    });
  } catch (error) {
    console.error("Cancel Error:", error);
    return c.json({ success: false, message: "Gagal membatalkan pesanan" }, 500);
  }
});
var redeem_default = redeem;

// src/routes/admin.ts
init_dist();
import { Hono as Hono4 } from "hono";
import { zValidator as zValidator3 } from "@hono/zod-validator";
import { eq as eq6, inArray, sql as sql4, desc as desc3, count } from "drizzle-orm";
import { z as z3 } from "zod";
var admin = new Hono4();
admin.use("/redeem/*", rbacMiddleware("fulfillment"));
admin.use("/codes/*", rbacMiddleware("codes"));
admin.use("/users/*", rbacMiddleware("users"));
admin.use("/rewards/*", rbacMiddleware("rewards"));
admin.use("/announcements/*", rbacMiddleware("announcements"));
admin.use("/performance/*", rbacMiddleware("performance"));
var UpdateRedeemStatusSchema = z3.object({
  status: z3.enum(["processing", "ready", "completed", "rejected"]),
  reason: z3.string().optional()
  // Required for rejected
});
var FINAL_STATES = ["completed", "cancelled", "rejected"];
admin.get("/redeem/pending", async (c) => {
  try {
    const requests = await db.select({
      id: redeemRequests.id,
      userName: profiles.fullName,
      // Get name from profiles
      itemName: rewards.title,
      // Get title from rewards
      pointsUsed: rewards.requiredPoints,
      whatsapp: profiles.whatsapp,
      // Get WA from profiles
      status: redeemRequests.status,
      createdAt: redeemRequests.createdAt
    }).from(redeemRequests).leftJoin(users, eq6(redeemRequests.nasabahId, users.id)).leftJoin(profiles, eq6(users.id, profiles.userId)).leftJoin(rewards, eq6(redeemRequests.rewardId, rewards.id)).where(inArray(redeemRequests.status, ["pending", "processing", "ready"])).orderBy(desc3(redeemRequests.createdAt));
    return c.json({ success: true, data: requests });
  } catch (error) {
    console.error("Admin Fetch Error:", error);
    return c.json({ success: false, message: "Failed to fetch requests" }, 500);
  }
});
admin.patch("/redeem/:id", zValidator3("json", UpdateRedeemStatusSchema), async (c) => {
  const requestId = c.req.param("id");
  const { status, reason } = c.req.valid("json");
  if (status === "rejected" && !reason) {
    return c.json({ success: false, message: "Alasan penolakan wajib diisi" }, 400);
  }
  try {
    return await db.transaction(async (tx) => {
      const [request] = await tx.select({
        id: redeemRequests.id,
        status: redeemRequests.status,
        userId: redeemRequests.nasabahId,
        pointsRequired: rewards.requiredPoints,
        metadata: redeemRequests.metadata
      }).from(redeemRequests).leftJoin(rewards, eq6(redeemRequests.rewardId, rewards.id)).where(eq6(redeemRequests.id, requestId)).limit(1);
      if (!request) {
        return c.json({ success: false, message: "Request not found" }, 404);
      }
      if (request.status && FINAL_STATES.includes(request.status)) {
        return c.json({
          success: false,
          message: `Pesanan dengan status "${request.status}" tidak dapat diubah.`
        }, 400);
      }
      if (status === "rejected") {
        const pointsToRefund = request.pointsRequired || 0;
        console.log(`\u{1F504} Refunding ${pointsToRefund} points to user ${request.userId} (Admin Rejection)`);
        await tx.update(users).set({ pointsBalance: sql4`${users.pointsBalance} + ${pointsToRefund}` }).where(eq6(users.id, request.userId));
        await tx.insert(pointsLedger).values({
          userId: request.userId,
          amount: pointsToRefund,
          source: "refund",
          // Source: refund
          description: `Refund: Ditolak Admin - ${reason}`,
          createdAt: /* @__PURE__ */ new Date()
        });
      }
      const currentMetadata = request.metadata || {};
      const updatedMetadata = {
        ...currentMetadata,
        ...status === "rejected" ? { rejectedReason: reason, rejectedAt: (/* @__PURE__ */ new Date()).toISOString(), rejectedBy: "admin" } : {}
      };
      await tx.update(redeemRequests).set({
        status,
        updatedAt: /* @__PURE__ */ new Date(),
        metadata: updatedMetadata
      }).where(eq6(redeemRequests.id, requestId));
      const successMessage = status === "rejected" ? `Permintaan ditolak. Poin telah dikembalikan ke nasabah.` : `Status diperbarui ke ${status}`;
      return c.json({ success: true, message: successMessage });
    });
  } catch (error) {
    console.error("Admin Update Error:", error);
    return c.json({ success: false, message: "Failed to process update" }, 500);
  }
});
admin.get("/codes", async (c) => {
  try {
    const codes = await db.select({
      id: agentActivationCodes.id,
      code: agentActivationCodes.code,
      isUsed: agentActivationCodes.isUsed,
      generatedByName: users.userId,
      // Link to generator ID
      usedByName: profiles.fullName,
      // Link to user who used it
      createdAt: agentActivationCodes.createdAt
    }).from(agentActivationCodes).leftJoin(users, eq6(agentActivationCodes.generatedBy, users.id)).leftJoin(profiles, eq6(agentActivationCodes.usedBy, profiles.userId)).orderBy(desc3(agentActivationCodes.createdAt));
    return c.json({ success: true, data: codes });
  } catch (error) {
    console.error("Admin Fetch Codes Error:", error);
    return c.json({ success: false, message: "Failed to fetch codes" }, 500);
  }
});
admin.post("/codes", zValidator3("json", z3.object({
  code: z3.string().min(3, "Kode minimal 3 karakter")
})), async (c) => {
  const user2 = c.get("user");
  const { code } = c.req.valid("json");
  try {
    const [inserted] = await db.insert(agentActivationCodes).values({
      code: code.trim().toUpperCase(),
      generatedBy: user2.id,
      isUsed: false,
      createdAt: /* @__PURE__ */ new Date()
    }).returning();
    return c.json({
      success: true,
      message: "Activation code registered successfully",
      data: inserted
    }, 201);
  } catch (error) {
    if (error.code === "23505" || error.message?.includes("unique")) {
      return c.json({ success: false, message: "Kode sudah terdaftar dalam sistem" }, 400);
    }
    console.error("Code Registration Error:", error);
    return c.json({ success: false, message: "Failed to register code" }, 500);
  }
});
admin.delete("/codes/:id", async (c) => {
  const user2 = c.get("user");
  const codeId = parseInt(c.req.param("id"));
  if (user2.role !== "super_admin") {
    return c.json({ success: false, message: "Forbidden: Only Super Admin can delete codes" }, 403);
  }
  try {
    const [deleted] = await db.delete(agentActivationCodes).where(sql4`${agentActivationCodes.id} = ${codeId} AND ${agentActivationCodes.isUsed} = false`).returning();
    if (!deleted) {
      return c.json({ success: false, message: "Code not found or already used" }, 404);
    }
    return c.json({ success: true, message: "Code deleted successfully" });
  } catch (error) {
    console.error("Code Deletion Error:", error);
    return c.json({ success: false, message: "Failed to delete code" }, 500);
  }
});
admin.get("/users", async (c) => {
  const role = c.req.query("role");
  try {
    const query = db.select({
      id: users.id,
      userId: users.userId,
      fullName: profiles.fullName,
      role: users.role
    }).from(users).leftJoin(profiles, eq6(users.id, profiles.userId));
    if (role) {
      query.where(eq6(users.role, role));
    }
    const list = await query.orderBy(desc3(users.createdAt));
    return c.json({ success: true, data: list });
  } catch (error) {
    console.error("Admin Fetch Users Error:", error);
    return c.json({ success: false, message: "Failed to fetch users" }, 500);
  }
});
admin.get("/users/:id", async (c) => {
  const id = c.req.param("id");
  try {
    const [userDetail] = await db.select({
      id: users.id,
      userId: users.userId,
      fullName: profiles.fullName,
      role: users.role,
      pointsBalance: users.pointsBalance,
      whatsapp: profiles.whatsapp,
      additionalMetadata: users.additionalMetadata
    }).from(users).leftJoin(profiles, eq6(users.id, profiles.userId)).where(eq6(users.id, id)).limit(1);
    if (!userDetail) return c.json({ success: false, message: "User not found" }, 404);
    return c.json({ success: true, data: userDetail });
  } catch (error) {
    console.error("Admin Fetch User Detail Error:", error);
    return c.json({ success: false, message: "Failed to fetch user detail" }, 500);
  }
});
admin.get("/users/:id/points", async (c) => {
  const userId = c.req.param("id");
  try {
    const history = await db.select().from(pointsLedger).where(eq6(pointsLedger.userId, userId)).orderBy(desc3(pointsLedger.createdAt));
    return c.json({ success: true, data: history });
  } catch (error) {
    console.error("Admin Fetch User Point History Error:", error);
    return c.json({ success: false, message: "Failed to fetch point history" }, 500);
  }
});
admin.get("/rewards", async (c) => {
  try {
    const list = await db.select().from(rewards).orderBy(desc3(rewards.id));
    return c.json({ success: true, data: list });
  } catch (error) {
    console.error("Admin Fetch Rewards Error:", error);
    return c.json({ success: false, message: "Failed to fetch rewards" }, 500);
  }
});
admin.post("/rewards", zValidator3("json", z3.object({
  title: z3.string().min(3),
  description: z3.string().optional(),
  requiredPoints: z3.number().int().positive(),
  csWhatsappNumber: z3.string().optional(),
  isActive: z3.boolean().default(true)
})), async (c) => {
  const data = c.req.valid("json");
  try {
    const [inserted] = await db.insert(rewards).values({
      ...data
    }).returning();
    return c.json({ success: true, message: "Reward created successfully", data: inserted }, 201);
  } catch (error) {
    console.error("Admin Create Reward Error:", error);
    return c.json({ success: false, message: "Failed to create reward" }, 500);
  }
});
admin.patch("/rewards/:id", zValidator3("json", z3.object({
  title: z3.string().min(3).optional(),
  description: z3.string().optional(),
  requiredPoints: z3.number().int().positive().optional(),
  csWhatsappNumber: z3.string().optional(),
  isActive: z3.boolean().optional()
})), async (c) => {
  const id = parseInt(c.req.param("id"));
  const data = c.req.valid("json");
  try {
    const [updated] = await db.update(rewards).set({ ...data }).where(eq6(rewards.id, id)).returning();
    if (!updated) return c.json({ success: false, message: "Reward not found" }, 404);
    return c.json({ success: true, message: "Reward updated successfully", data: updated });
  } catch (error) {
    console.error("Admin Update Reward Error:", error);
    return c.json({ success: false, message: "Failed to update reward" }, 500);
  }
});
admin.delete("/rewards/:id", async (c) => {
  const id = parseInt(c.req.param("id"));
  try {
    const [deleted] = await db.delete(rewards).where(eq6(rewards.id, id)).returning();
    if (!deleted) return c.json({ success: false, message: "Reward not found or has references" }, 404);
    return c.json({ success: true, message: "Reward deleted successfully" });
  } catch (error) {
    console.error("Admin Delete Reward Error:", error);
    return c.json({ success: false, message: "Gagal menghapus reward (mungkin masih memiliki referensi pesanan)" }, 500);
  }
});
admin.patch("/users/:id/metadata", zValidator3("json", z3.object({
  metadata: z3.record(z3.string(), z3.any())
})), async (c) => {
  const adminUser = c.get("user");
  const targetUserId = c.req.param("id");
  const { metadata } = c.req.valid("json");
  if (adminUser.role !== "super_admin") {
    return c.json({ success: false, message: "Forbidden: Only super_admin can modify metadata" }, 403);
  }
  try {
    return await db.transaction(async (tx) => {
      const [user2] = await tx.select().from(users).where(eq6(users.id, targetUserId)).limit(1);
      if (!user2) return c.json({ success: false, message: "User not found" }, 404);
      await tx.update(users).set({ additionalMetadata: metadata }).where(eq6(users.id, targetUserId));
      await tx.insert(adminActions).values({
        adminId: adminUser.id,
        action: `UPDATE_USER_METADATA`,
        details: {
          targetUserId,
          previousMetadata: user2.additionalMetadata,
          newMetadata: metadata
        },
        createdAt: /* @__PURE__ */ new Date()
      });
      return c.json({ success: true, message: "User metadata updated successfully" });
    });
  } catch (error) {
    console.error("Admin Update Metadata Error:", error);
    return c.json({ success: false, message: "Failed to update user metadata" }, 500);
  }
});
admin.get("/announcements", async (c) => {
  try {
    const result = await db.select({
      id: announcements.id,
      title: announcements.title,
      videoUrl: announcements.videoUrl,
      content: announcements.content,
      ctaUrl: announcements.ctaUrl,
      isActive: announcements.isActive,
      createdAt: announcements.createdAt,
      totalViews: count(announcementViews.id)
    }).from(announcements).leftJoin(announcementViews, eq6(announcements.id, announcementViews.announcementId)).groupBy(
      announcements.id,
      announcements.title,
      announcements.videoUrl,
      announcements.content,
      announcements.ctaUrl,
      announcements.isActive,
      announcements.createdAt
    ).orderBy(desc3(announcements.createdAt));
    return c.json({ success: true, data: result });
  } catch (error) {
    console.error("Admin List Announcements Error:", error);
    return c.json({ success: false, message: "Failed to fetch announcements" }, 500);
  }
});
var CreateAnnouncementSchema = z3.object({
  title: z3.string().min(1, "Judul wajib diisi"),
  content: z3.string().optional(),
  videoUrl: z3.string().optional(),
  ctaUrl: z3.string().optional(),
  isActive: z3.boolean().optional().default(true)
});
admin.post("/announcements", zValidator3("json", CreateAnnouncementSchema), async (c) => {
  const user2 = c.get("user");
  const data = c.req.valid("json");
  try {
    return await db.transaction(async (tx) => {
      const [created] = await tx.insert(announcements).values({
        title: data.title,
        content: data.content || null,
        videoUrl: data.videoUrl || null,
        ctaUrl: data.ctaUrl || null,
        isActive: data.isActive,
        createdAt: /* @__PURE__ */ new Date()
      }).returning();
      if (!created) {
        return c.json({ success: false, message: "Failed to create announcement" }, 500);
      }
      await tx.insert(adminActions).values({
        adminId: user2.id,
        action: "CREATE_ANNOUNCEMENT",
        details: { announcementId: created.id, title: data.title },
        createdAt: /* @__PURE__ */ new Date()
      });
      return c.json({ success: true, message: "Pengumuman berhasil dipublikasikan", data: created });
    });
  } catch (error) {
    console.error("Admin Create Announcement Error:", error);
    return c.json({ success: false, message: "Failed to create announcement" }, 500);
  }
});
var UpdateAnnouncementSchema = z3.object({
  title: z3.string().min(1).optional(),
  content: z3.string().optional(),
  videoUrl: z3.string().optional(),
  ctaUrl: z3.string().optional(),
  isActive: z3.boolean().optional()
});
admin.patch("/announcements/:id", zValidator3("json", UpdateAnnouncementSchema), async (c) => {
  const id = parseInt(c.req.param("id"));
  const data = c.req.valid("json");
  try {
    const [updated] = await db.update(announcements).set(data).where(eq6(announcements.id, id)).returning();
    if (!updated) return c.json({ success: false, message: "Announcement not found" }, 404);
    return c.json({ success: true, message: "Pengumuman berhasil diperbarui", data: updated });
  } catch (error) {
    console.error("Admin Update Announcement Error:", error);
    return c.json({ success: false, message: "Failed to update announcement" }, 500);
  }
});
admin.delete("/announcements/:id", async (c) => {
  const id = parseInt(c.req.param("id"));
  try {
    await db.delete(announcementViews).where(eq6(announcementViews.announcementId, id));
    const [deleted] = await db.delete(announcements).where(eq6(announcements.id, id)).returning();
    if (!deleted) return c.json({ success: false, message: "Announcement not found" }, 404);
    return c.json({ success: true, message: "Pengumuman berhasil dihapus" });
  } catch (error) {
    console.error("Admin Delete Announcement Error:", error);
    return c.json({ success: false, message: "Failed to delete announcement" }, 500);
  }
});
admin.get("/performance/leaderboard", async (c) => {
  try {
    const leaderboardQuery = sql4`
            SELECT 
                u.id, 
                u.user_id as "userId", 
                p.full_name as "fullName", 
                p.whatsapp,
                COUNT(rp.id)::int as "totalReferrals"
            FROM users u
            LEFT JOIN profiles p ON u.id = p.user_id
            LEFT JOIN profiles rp ON u.user_id = rp.referred_by_agent_id
            WHERE u.role = 'agent'
            GROUP BY u.id, u.user_id, p.full_name, p.whatsapp
            ORDER BY "totalReferrals" DESC
        `;
    const result = await db.execute(leaderboardQuery);
    const data = result.rows || result;
    return c.json({ success: true, data });
  } catch (error) {
    console.error("Admin Fetch Leaderboard Error:", error);
    return c.json({ success: false, message: "Failed to fetch leaderboard" }, 500);
  }
});
admin.get("/birthdays", rbacMiddleware("users"), async (c) => {
  try {
    const timeZoneOffset = "+07:00";
    const birthdayQuery = sql4`
            SELECT 
                p.id,
                p.full_name as "fullName",
                p.whatsapp,
                p.referred_by_agent_id as "agentUserId",
                p.date_of_birth as "dateOfBirth",
                EXTRACT(YEAR FROM CURRENT_DATE AT TIME ZONE ${timeZoneOffset}) - EXTRACT(YEAR FROM p.date_of_birth) AS age,
                CASE 
                    WHEN EXTRACT(MONTH FROM p.date_of_birth) = EXTRACT(MONTH FROM CURRENT_DATE AT TIME ZONE ${timeZoneOffset}) 
                         AND EXTRACT(DAY FROM p.date_of_birth) = EXTRACT(DAY FROM CURRENT_DATE AT TIME ZONE ${timeZoneOffset}) 
                    THEN 'today'
                    ELSE 'tomorrow'
                END as "birthdayWhen"
            FROM profiles p
            JOIN users u ON p.user_id = u.id
            WHERE u.role = 'nasabah'
              AND p.date_of_birth IS NOT NULL
              AND (
                  (EXTRACT(MONTH FROM p.date_of_birth) = EXTRACT(MONTH FROM CURRENT_DATE AT TIME ZONE ${timeZoneOffset}) 
                   AND EXTRACT(DAY FROM p.date_of_birth) = EXTRACT(DAY FROM CURRENT_DATE AT TIME ZONE ${timeZoneOffset}))
                  OR 
                  (EXTRACT(MONTH FROM p.date_of_birth) = EXTRACT(MONTH FROM (CURRENT_DATE + INTERVAL '1 day') AT TIME ZONE ${timeZoneOffset}) 
                   AND EXTRACT(DAY FROM p.date_of_birth) = EXTRACT(DAY FROM (CURRENT_DATE + INTERVAL '1 day') AT TIME ZONE ${timeZoneOffset}))
              )
            ORDER BY "birthdayWhen" DESC, "fullName" ASC
        `;
    const result = await db.execute(birthdayQuery);
    const data = result.rows || result;
    return c.json({ success: true, data });
  } catch (error) {
    console.error("Admin Fetch Birthdays Error:", error);
    return c.json({ success: false, message: "Failed to fetch birthdays" }, 500);
  }
});
var admin_default = admin;

// src/routes/admin-internal.ts
init_dist();
import { Hono as Hono5 } from "hono";
import { eq as eq7, desc as desc4 } from "drizzle-orm";
var internal = new Hono5();
internal.get("/nasabah-agents", rbacMiddleware("polis"), async (c) => {
  try {
    const result = await db.select({
      id: users.id,
      userId: users.userId,
      fullName: profiles.fullName,
      agentUserId: profiles.referredByAgentId
      // This is the string ID of the agent
    }).from(users).innerJoin(profiles, eq7(users.id, profiles.userId)).where(eq7(users.role, "nasabah")).orderBy(desc4(users.createdAt));
    const nasabahWithAgents = await db.transaction(async (tx) => {
      const list = await tx.select({
        nasabahId: users.id,
        nasabahUserId: users.userId,
        nasabahName: profiles.fullName,
        agentUserId: profiles.referredByAgentId
      }).from(users).innerJoin(profiles, eq7(users.id, profiles.userId)).where(eq7(users.role, "nasabah"));
      const allAgents = await tx.select({
        id: users.id,
        userId: users.userId,
        fullName: profiles.fullName
      }).from(users).innerJoin(profiles, eq7(users.id, profiles.userId)).where(eq7(users.role, "agent"));
      const agentMap = new Map(allAgents.map((a) => [a.userId, a]));
      return list.map((n) => ({
        ...n,
        agent: n.agentUserId ? agentMap.get(n.agentUserId) || null : null
      }));
    });
    return c.json({ success: true, data: nasabahWithAgents });
  } catch (error) {
    console.error("Internal Nasabah-Agents Error:", error);
    return c.json({ success: false, message: "Failed to fetch internal data" }, 500);
  }
});
internal.get("/agents", rbacMiddleware("polis"), async (c) => {
  try {
    const agents = await db.select({
      id: users.id,
      userId: users.userId,
      fullName: profiles.fullName
    }).from(users).innerJoin(profiles, eq7(users.id, profiles.userId)).where(eq7(users.role, "agent")).orderBy(desc4(users.createdAt));
    return c.json({ success: true, data: agents });
  } catch (error) {
    console.error("Internal Agents Error:", error);
    return c.json({ success: false, message: "Failed to fetch agents" }, 500);
  }
});
internal.get("/announcements", rbacMiddleware("announcements"), async (c) => {
  const { announcements: announcements2, announcementViews: announcementViews2 } = await Promise.resolve().then(() => (init_dist(), dist_exports));
  const { count: count4 } = await import("drizzle-orm");
  try {
    const result = await db.select({
      id: announcements2.id,
      title: announcements2.title,
      videoUrl: announcements2.videoUrl,
      content: announcements2.content,
      ctaUrl: announcements2.ctaUrl,
      isActive: announcements2.isActive,
      createdAt: announcements2.createdAt,
      totalViews: count4(announcementViews2.id)
    }).from(announcements2).leftJoin(announcementViews2, eq7(announcements2.id, announcementViews2.announcementId)).groupBy(
      announcements2.id,
      announcements2.title,
      announcements2.videoUrl,
      announcements2.content,
      announcements2.ctaUrl,
      announcements2.isActive,
      announcements2.createdAt
    ).orderBy(desc4(announcements2.createdAt));
    return c.json({ success: true, data: result });
  } catch (error) {
    console.error("Internal List Announcements Error:", error);
    return c.json({ success: false, message: "Failed to fetch announcements" }, 500);
  }
});
internal.get("/watchdog/alerts", rbacMiddleware("watchdog"), async (c) => {
  const { waInteractions: waInteractions2, users: users3, profiles: profiles3 } = await Promise.resolve().then(() => (init_dist(), dist_exports));
  const { eq: eq16, and: and11, asc } = await import("drizzle-orm");
  const { alias } = await import("drizzle-orm/pg-core");
  try {
    const agentProfiles = alias(profiles3, "agent_profiles");
    const nasabahProfiles = alias(profiles3, "nasabah_profiles");
    const alerts = await db.select({
      id: waInteractions2.id,
      clickedAt: waInteractions2.clickedAt,
      nasabah: {
        id: waInteractions2.nasabahId,
        name: nasabahProfiles.fullName,
        whatsapp: nasabahProfiles.whatsapp
      },
      agent: {
        id: waInteractions2.agentId,
        name: agentProfiles.fullName
      }
    }).from(waInteractions2).leftJoin(nasabahProfiles, eq16(waInteractions2.nasabahId, nasabahProfiles.userId)).leftJoin(agentProfiles, eq16(waInteractions2.agentId, agentProfiles.userId)).where(eq16(waInteractions2.isAdminNotified, false)).orderBy(asc(waInteractions2.clickedAt));
    return c.json({ success: true, data: alerts });
  } catch (error) {
    console.error("Watchdog Alerts Error:", error);
    return c.json({ success: false, message: "Failed to fetch watchdog alerts" }, 500);
  }
});
internal.patch("/watchdog/resolve/:id", rbacMiddleware("watchdog"), async (c) => {
  const id = parseInt(c.req.param("id"));
  const user2 = c.get("user");
  if (isNaN(id)) return c.json({ success: false, message: "Invalid ID" }, 400);
  console.log(`[WATCHDOG RESOLVE] Attempting to resolve ID: ${id}`);
  console.log(`[WATCHDOG RESOLVE] Admin: ${JSON.stringify(user2)}`);
  try {
    await db.transaction(async (tx) => {
      await tx.update(waInteractions).set({ isAdminNotified: true }).where(eq7(waInteractions.id, id));
      const ipAddress = c.req.header("x-forwarded-for") || "unknown";
      const userAgent = c.req.header("user-agent") || "unknown";
      console.log(`[WATCHDOG LOG] Inserting admin action... IP: ${ipAddress}`);
      await tx.insert(adminActions).values({
        adminId: user2.id,
        action: "WATCHDOG_RESOLVE",
        details: { interactionId: id },
        ipAddress,
        userAgent,
        createdAt: /* @__PURE__ */ new Date()
      });
    });
    console.log(`[WATCHDOG RESOLVE] Success for ID: ${id}`);
    return c.json({ success: true, message: "Alert resolved" });
  } catch (error) {
    console.error("Watchdog Resolve Error Full Stack:", error);
    if (error instanceof Error) {
      console.error(error.stack);
    }
    return c.json({ success: false, message: "Failed to resolve alert", error: String(error) }, 500);
  }
});
var admin_internal_default = internal;

// src/routes/products.ts
init_dist();
import { Hono as Hono6 } from "hono";
import { zValidator as zValidator4 } from "@hono/zod-validator";
import { z as z4 } from "zod";
import { eq as eq8, desc as desc5 } from "drizzle-orm";
var productsRoute = new Hono6();
var CreateProductSchema = z4.object({
  name: z4.string().min(3),
  description: z4.string().optional(),
  pointsReward: z4.number().int().nonnegative(),
  mediaUrl: z4.string().url().optional(),
  isActive: z4.boolean().optional().default(true)
});
var UpdateProductSchema = CreateProductSchema.partial();
productsRoute.get("/", async (c) => {
  const showAll = c.req.query("all") === "true";
  const user2 = c.get("user");
  try {
    let query = db.select().from(products);
    const isAdmin = user2 && ["super_admin", "admin"].includes(user2.role);
    if (!showAll || !isAdmin) {
      query = query.where(eq8(products.isActive, true));
    }
    const items = await query.orderBy(desc5(products.id));
    return c.json({ success: true, data: items });
  } catch (error) {
    console.error("Fetch Products Error:", error);
    return c.json({ success: false, message: "Internal Server Error" }, 500);
  }
});
productsRoute.post("/", rbacMiddleware("products"), zValidator4("json", CreateProductSchema), async (c) => {
  const body = c.req.valid("json");
  try {
    const [newProduct] = await db.insert(products).values(body).returning();
    return c.json({ success: true, data: newProduct }, 201);
  } catch (error) {
    console.error("Create Product Error:", error);
    return c.json({ success: false, message: "Internal Server Error" }, 500);
  }
});
productsRoute.patch("/:id", rbacMiddleware("products"), zValidator4("json", UpdateProductSchema), async (c) => {
  const id = parseInt(c.req.param("id"));
  const body = c.req.valid("json");
  if (isNaN(id)) return c.json({ success: false, message: "Invalid ID" }, 400);
  try {
    const [updatedProduct] = await db.update(products).set(body).where(eq8(products.id, id)).returning();
    if (!updatedProduct) {
      return c.json({ success: false, message: "Product not found" }, 404);
    }
    return c.json({ success: true, data: updatedProduct });
  } catch (error) {
    console.error("Update Product Error:", error);
    return c.json({ success: false, message: "Internal Server Error" }, 500);
  }
});
productsRoute.delete("/:id", rbacMiddleware("products"), async (c) => {
  const id = parseInt(c.req.param("id"));
  if (isNaN(id)) return c.json({ success: false, message: "Invalid ID" }, 400);
  try {
    const [deleted] = await db.update(products).set({ isActive: false }).where(eq8(products.id, id)).returning();
    if (!deleted) {
      return c.json({ success: false, message: "Product not found" }, 404);
    }
    return c.json({ success: true, message: "Product deleted (soft)" });
  } catch (error) {
    console.error("Delete Product Error:", error);
    return c.json({ success: false, message: "Internal Server Error" }, 500);
  }
});
var products_default = productsRoute;

// src/routes/polis.ts
init_dist();
import { Hono as Hono7 } from "hono";
import { zValidator as zValidator5 } from "@hono/zod-validator";
import { z as z5 } from "zod";
import { eq as eq9, desc as desc6, or as or2 } from "drizzle-orm";
var polisRoute = new Hono7();
var InputPolisSchema = z5.object({
  polisNumber: z5.string().min(3),
  nasabahId: z5.string().uuid(),
  // UUID of the user (Nasabah)
  agentId: z5.string().uuid(),
  // UUID of the user (Agent)
  premiumAmount: z5.number().int().positive()
});
polisRoute.post("/", rbacMiddleware("polis"), zValidator5("json", InputPolisSchema), async (c) => {
  const { polisNumber, nasabahId, agentId, premiumAmount } = c.req.valid("json");
  const adminUser = c.get("user");
  try {
    const result = await db.transaction(async (tx) => {
      const [nasabah] = await tx.select().from(users).where(eq9(users.id, nasabahId)).limit(1);
      if (!nasabah) throw new Error("Nasabah ID not found");
      const [agent] = await tx.select().from(users).where(eq9(users.id, agentId)).limit(1);
      if (!agent) throw new Error("Agent ID not found");
      const [existing] = await tx.select().from(polisData).where(eq9(polisData.polisNumber, polisNumber)).limit(1);
      if (existing) throw new Error("Nomor Polis sudah terdaftar");
      const [newPolis] = await tx.insert(polisData).values({
        polisNumber,
        nasabahId,
        agentId,
        premiumAmount,
        inputBy: adminUser.id
      }).returning();
      const pointsToAward = Math.floor(premiumAmount / 1e3);
      if (pointsToAward > 0) {
        await PointsService.addPoints(
          nasabahId,
          pointsToAward,
          "purchase",
          `Point reward dari Polis #${polisNumber}`,
          tx
        );
      }
      return newPolis;
    });
    return c.json({ success: true, data: result }, 201);
  } catch (error) {
    console.error("Input Polis Error:", error);
    const isClientError = error.message === "Nasabah ID not found" || error.message === "Agent ID not found" || error.message === "Nomor Polis sudah terdaftar";
    return c.json({ success: false, message: error.message || "Internal Server Error" }, isClientError ? 400 : 500);
  }
});
polisRoute.get("/", rbacMiddleware("polis"), async (c) => {
  try {
    const list = await db.select({
      id: polisData.id,
      polisNumber: polisData.polisNumber,
      premiumAmount: polisData.premiumAmount,
      createdAt: polisData.createdAt,
      nasabahName: profiles.fullName,
      // simplified join, might need clearer alias
      agentId: polisData.agentId
    }).from(polisData).leftJoin(users, eq9(polisData.nasabahId, users.id)).leftJoin(profiles, eq9(users.id, profiles.userId)).orderBy(desc6(polisData.createdAt)).limit(100);
    return c.json({ success: true, data: list });
  } catch (error) {
    console.error("Fetch Polis Error:", error);
    return c.json({ success: false, message: "Internal Server Error" }, 500);
  }
});
polisRoute.get("/my-polis", rbacMiddleware(), async (c) => {
  const user2 = c.get("user");
  try {
    const list = await db.select({
      id: polisData.id,
      polisNumber: polisData.polisNumber,
      premiumAmount: polisData.premiumAmount,
      createdAt: polisData.createdAt
      // If Agent, show Nasabah info? If Nasabah, show Agent info?
      // For MVP, just the raw data + basic info
    }).from(polisData).where(or2(
      eq9(polisData.nasabahId, user2.id),
      eq9(polisData.agentId, user2.id)
    )).orderBy(desc6(polisData.createdAt));
    return c.json({ success: true, data: list });
  } catch (error) {
    console.error("My Polis Error:", error);
    return c.json({ success: false, message: "Internal Server Error" }, 500);
  }
});
var polis_default = polisRoute;

// src/routes/content.ts
init_dist();
import { Hono as Hono8 } from "hono";
import { zValidator as zValidator6 } from "@hono/zod-validator";
import { z as z6 } from "zod";
import { eq as eq10, desc as desc7, and as and6, sql as sql5 } from "drizzle-orm";
var contentRoute = new Hono8();
var CreateAnnouncementSchema2 = z6.object({
  title: z6.string().min(3),
  content: z6.string().min(10),
  videoUrl: z6.string().url().optional(),
  isActive: z6.boolean().optional().default(true)
});
contentRoute.get("/announcements", async (c) => {
  return await listAnnouncements(c);
});
async function listAnnouncements(c) {
  const user2 = c.get("user");
  try {
    const items = await db.select().from(announcements).where(eq10(announcements.isActive, true)).orderBy(desc7(announcements.id));
    let result = items;
    if (user2) {
      const views = await db.select().from(announcementViews).where(eq10(announcementViews.userId, user2.id));
      const viewedIds = new Set(views.map((v) => v.announcementId));
      result = items.map((item) => ({
        ...item,
        isViewed: viewedIds.has(item.id)
      }));
    }
    return c.json({ success: true, data: result });
  } catch (error) {
    console.error("Fetch Announcements Error:", error);
    return c.json({ success: false, message: "Internal Server Error" }, 500);
  }
}
contentRoute.get("/announcements/latest", rbacMiddleware(), async (c) => {
  const user2 = c.get("user");
  try {
    const [latestUnviewed] = await db.select({
      id: announcements.id,
      title: announcements.title,
      content: announcements.content,
      videoUrl: announcements.videoUrl,
      ctaUrl: announcements.ctaUrl,
      isActive: announcements.isActive,
      createdAt: announcements.createdAt
    }).from(announcements).leftJoin(
      announcementViews,
      and6(
        eq10(announcements.id, announcementViews.announcementId),
        eq10(announcementViews.userId, user2.id)
      )
    ).where(
      and6(
        eq10(announcements.isActive, true),
        sql5`${announcementViews.id} IS NULL`
      )
    ).orderBy(desc7(announcements.createdAt)).limit(1);
    return c.json({ success: true, data: latestUnviewed || null });
  } catch (error) {
    console.error("Latest Announcement Error:", error);
    return c.json({ success: false, message: "Internal Server Error" }, 500);
  }
});
contentRoute.post("/announcements", rbacMiddleware("announcements"), zValidator6("json", CreateAnnouncementSchema2), async (c) => {
  const body = c.req.valid("json");
  try {
    const [newItem] = await db.insert(announcements).values(body).returning();
    return c.json({ success: true, data: newItem }, 201);
  } catch (error) {
    console.error("Create Announcement Error:", error);
    return c.json({ success: false, message: "Internal Server Error" }, 500);
  }
});
contentRoute.post("/announcements/:id/view", rbacMiddleware(), async (c) => {
  const id = parseInt(c.req.param("id"));
  const user2 = c.get("user");
  if (isNaN(id)) return c.json({ success: false, message: "Invalid ID" }, 400);
  try {
    const [existing] = await db.select().from(announcementViews).where(and6(
      eq10(announcementViews.announcementId, id),
      eq10(announcementViews.userId, user2.id)
    )).limit(1);
    if (!existing) {
      await db.insert(announcementViews).values({
        announcementId: id,
        userId: user2.id
      });
    }
    return c.json({ success: true, message: "View recorded" });
  } catch (error) {
    console.error("Record View Error:", error);
    return c.json({ success: false, message: "Internal Server Error" }, 500);
  }
});
contentRoute.patch("/announcements/:id", rbacMiddleware("announcements"), zValidator6("json", z6.object({ isActive: z6.boolean() })), async (c) => {
  const id = parseInt(c.req.param("id"));
  const { isActive } = c.req.valid("json");
  try {
    const [updated] = await db.update(announcements).set({ isActive }).where(eq10(announcements.id, id)).returning();
    if (!updated) return c.json({ success: false, message: "Not found" }, 404);
    return c.json({ success: true, data: updated });
  } catch (error) {
    console.error("Toggle Announcement Error:", error);
    return c.json({ success: false, message: "Internal Server Error" }, 500);
  }
});
var content_default = contentRoute;

// src/routes/monitoring.ts
init_dist();
import { Hono as Hono9 } from "hono";
import { zValidator as zValidator7 } from "@hono/zod-validator";
import { z as z7 } from "zod";
import { eq as eq11, and as and7, lt } from "drizzle-orm";
var monitoringRoute = new Hono9();
var CRON_SECRET = process.env.CRON_SECRET || "secure_cron_secret_123";
monitoringRoute.post("/interaction", rbacMiddleware(), zValidator7("json", z7.object({
  agentId: z7.string().uuid().optional()
  // If Nasabah clicks Agent WA
})), async (c) => {
  const user2 = c.get("user");
  const { agentId } = c.req.valid("json");
  try {
    await db.insert(waInteractions).values({
      nasabahId: user2.role === "nasabah" ? user2.id : void 0,
      agentId: agentId || (user2.role === "agent" ? user2.id : void 0),
      // Fallback if agent clicks own?
      // Logic: usually Nasabah clicks Agent.
      clickedAt: /* @__PURE__ */ new Date(),
      isAdminNotified: false
    });
    return c.json({ success: true, message: "Interaction logged" });
  } catch (error) {
    console.error("Log Interaction Error:", error);
    return c.json({ success: false, message: "Internal Server Error" }, 500);
  }
});
monitoringRoute.post("/watchdog", async (c) => {
  const authHeader = c.req.header("Authorization");
  if (authHeader !== `Bearer ${CRON_SECRET}`) {
    return c.json({ success: false, message: "Unauthorized Cron" }, 401);
  }
  try {
    const fiveMinutesAgo = new Date(Date.now() - 5 * 60 * 1e3);
    const staleInteractions = await db.select().from(waInteractions).where(and7(
      lt(waInteractions.clickedAt, fiveMinutesAgo),
      eq11(waInteractions.isAdminNotified, false)
    )).limit(50);
    if (staleInteractions.length === 0) {
      return c.json({ success: true, message: "No stale interactions found" });
    }
    console.log(`\u{1F436} Watchdog found ${staleInteractions.length} stale interactions.`);
    const idsToUpdate = staleInteractions.map((i) => i.id);
    for (const item of staleInteractions) {
      await db.update(waInteractions).set({ isAdminNotified: true }).where(eq11(waInteractions.id, item.id));
    }
    return c.json({
      success: true,
      message: `Processed ${staleInteractions.length} stale interactions`,
      ids: idsToUpdate
    });
  } catch (error) {
    console.error("Watchdog Error:", error);
    return c.json({ success: false, message: "Internal Server Error" }, 500);
  }
});
var monitoring_default = monitoringRoute;

// src/routes/dashboard.ts
init_dist();
import { Hono as Hono10 } from "hono";
import { eq as eq12, count as count2, sql as sql6, desc as desc8 } from "drizzle-orm";
var dashboardRoute = new Hono10();
dashboardRoute.get("/stats", rbacMiddleware(), async (c) => {
  const user2 = c.get("user");
  try {
    const [
      userCount,
      redeemPendingCount,
      polisCount,
      totalPointsDistributed
    ] = await Promise.all([
      // 1. Total Users
      db.select({ count: count2() }).from(users),
      // 2. Pending Redeems
      db.select({ count: count2() }).from(redeemRequests).where(eq12(redeemRequests.status, "pending")),
      // 3. Total Polis
      db.select({ count: count2() }).from(polisData),
      // 4. Total Points (Approximation from Ledger where amount > 0)
      // or sum of all user points? Let's do sum of current user points
      db.select({ total: sql6`sum(${users.pointsBalance})` }).from(users)
    ]);
    const recentActions = await db.select().from(adminActions).orderBy(desc8(adminActions.createdAt)).limit(5);
    return c.json({
      success: true,
      data: {
        totalUsers: userCount[0]?.count || 0,
        pendingRedemptions: redeemPendingCount[0]?.count || 0,
        totalPolis: polisCount[0]?.count || 0,
        outstandingPoints: totalPointsDistributed[0]?.total || 0,
        recentActivity: recentActions
      }
    });
  } catch (error) {
    console.error("Dashboard Stats Error:", error);
    return c.json({ success: false, message: "Internal Server Error" }, 500);
  }
});
var dashboard_default = dashboardRoute;

// src/routes/interactions.ts
init_dist();
import { Hono as Hono11 } from "hono";
import { eq as eq13 } from "drizzle-orm";
import { z as z8 } from "zod";
import { zValidator as zValidator8 } from "@hono/zod-validator";
var interactions = new Hono11();
var LogWaSchema = z8.object({
  productId: z8.number().int(),
  productName: z8.string()
});
interactions.post("/wa", zValidator8("json", LogWaSchema), async (c) => {
  const user2 = c.get("user");
  const { productId, productName } = c.req.valid("json");
  if (user2.role !== "nasabah") {
    return c.json({ success: false, message: "Only Nasabah can initiate purchases" }, 403);
  }
  try {
    const [nasabahProfile] = await db.select({
      fullName: profiles.fullName,
      referredByAgentId: profiles.referredByAgentId
    }).from(profiles).where(eq13(profiles.userId, user2.id)).limit(1);
    if (!nasabahProfile || !nasabahProfile.referredByAgentId) {
      return c.json({
        success: false,
        message: "Anda belum terhubung dengan agen. Silakan hubungi admin."
      }, 400);
    }
    const [agent] = await db.select({
      whatsapp: profiles.whatsapp,
      fullName: profiles.fullName
    }).from(users).innerJoin(profiles, eq13(users.id, profiles.userId)).where(eq13(users.userId, nasabahProfile.referredByAgentId)).limit(1);
    if (!agent) {
      return c.json({ success: false, message: "Agen tidak ditemukan" }, 404);
    }
    await db.insert(waInteractions).values({
      nasabahId: user2.id,
      agentId: null,
      // We could store agent UUID here if needed, schema says references users.id
      clickedAt: /* @__PURE__ */ new Date(),
      isAdminNotified: false
    });
    const message = `Halo ${agent.fullName}, saya ${nasabahProfile.fullName} tertarik untuk membeli produk ${productName}. Mohon informasinya.`;
    const encodedMessage = encodeURIComponent(message);
    const waUrl = `https://wa.me/${agent.whatsapp.replace(/\D/g, "")}?text=${encodedMessage}`;
    return c.json({
      success: true,
      data: {
        waUrl,
        agentName: agent.fullName,
        agentWhatsapp: agent.whatsapp
      }
    });
  } catch (error) {
    console.error("WA Interaction Error:", error);
    return c.json({ success: false, message: "Internal Server Error" }, 500);
  }
});
var interactions_default = interactions;

// src/routes/agent.ts
init_dist();
import { Hono as Hono12 } from "hono";
import { eq as eq14, count as count3, sql as sql7, and as and9, desc as desc9, gte } from "drizzle-orm";
var agentRoute = new Hono12();
agentRoute.get("/stats", rbacMiddleware(), async (c) => {
  const user2 = c.get("user");
  if (user2.role !== "agent") {
    return c.json({ success: false, message: "Unauthorized: Agent stats only" }, 403);
  }
  try {
    const [referralCount] = await db.select({ count: count3() }).from(profiles).where(eq14(profiles.referredByAgentId, user2.userId));
    const [totalPoints] = await db.select({
      total: sql7`sum(${pointsLedger.amount})`
    }).from(pointsLedger).where(
      and9(
        eq14(pointsLedger.userId, user2.id),
        gte(pointsLedger.amount, 0)
        // Only positive earnings
      )
    );
    const fiveMinutesAgo = new Date(Date.now() - 5 * 60 * 1e3);
    const [unansweredCount] = await db.select({ count: count3() }).from(waInteractions).where(
      and9(
        eq14(waInteractions.agentId, user2.id),
        gte(waInteractions.clickedAt, fiveMinutesAgo)
        // Actually we want OLDER than 5 mins? 
        // No, usually watchdog is for "Waiting > 5 mins". So clickedAt < fiveMinutesAgo.
        // But if it's TOO old (e.g. yesterday), we might ignore?
        // Let's just say "Recent but > 5 mins" (e.g., last 24h, > 5 mins).
        // Refined Query: 
        // clickedAt < 5 mins ago AND clickedAt > 24 hours ago
      )
    );
    const [interactionCount] = await db.select({ count: count3() }).from(waInteractions).where(eq14(waInteractions.agentId, user2.id));
    return c.json({
      success: true,
      data: {
        totalReferrals: referralCount?.count || 0,
        totalCommission: totalPoints?.total || 0,
        totalInteractions: interactionCount?.count || 0
        // Placeholder for specific "unanswered" logic
      }
    });
  } catch (error) {
    console.error("Agent Stats Error:", error);
    return c.json({ success: false, message: "Internal Server Error" }, 500);
  }
});
agentRoute.get("/referrals", rbacMiddleware(), async (c) => {
  const user2 = c.get("user");
  if (user2.role !== "agent") {
    return c.json({ success: false, message: "Unauthorized" }, 403);
  }
  try {
    const referredUsers = await db.select({
      id: users.id,
      fullName: profiles.fullName,
      userId: users.userId,
      pointsBalance: users.pointsBalance,
      whatsapp: profiles.whatsapp,
      joinedAt: users.createdAt,
      // Polis info?
      polisCount: count3(polisData.id)
    }).from(profiles).innerJoin(users, eq14(profiles.userId, users.id)).leftJoin(polisData, eq14(polisData.nasabahId, users.id)).where(eq14(profiles.referredByAgentId, user2.userId)).groupBy(users.id, profiles.fullName, users.userId, users.pointsBalance, profiles.whatsapp, users.createdAt).orderBy(desc9(users.createdAt));
    return c.json({ success: true, data: referredUsers });
  } catch (error) {
    console.error("Agent Referrals Error:", error);
    return c.json({ success: false, message: "Internal Server Error" }, 500);
  }
});
agentRoute.get("/chart/growth", rbacMiddleware(), async (c) => {
  const user2 = c.get("user");
  if (user2.role !== "agent") {
    return c.json({ success: false, message: "Unauthorized" }, 403);
  }
  try {
    const growthData = await db.execute(sql7`
            SELECT 
                TO_CHAR(u.created_at, 'Mon') as name,
                COUNT(u.id) as value
            FROM ${profiles} p
            JOIN ${users} u ON p.user_id = u.id
            WHERE p.referred_by_agent_id = ${user2.userId}
            GROUP BY TO_CHAR(u.created_at, 'Mon'), DATE_TRUNC('month', u.created_at)
            ORDER BY DATE_TRUNC('month', u.created_at) ASC
            LIMIT 6
        `);
    return c.json({ success: true, data: growthData });
  } catch (error) {
    console.error("Agent Chart Error:", error);
    return c.json({ success: false, message: "Internal Server Error" }, 500);
  }
});
agentRoute.get("/watchdog", rbacMiddleware(), async (c) => {
  const user2 = c.get("user");
  const now = /* @__PURE__ */ new Date();
  const fiveMinutesAgo = new Date(now.getTime() - 5 * 6e4);
  const twentyFourHoursAgo = new Date(now.getTime() - 24 * 36e5);
  try {
    const pendingInteractions = await db.select({
      id: waInteractions.id,
      nasabahId: waInteractions.nasabahId,
      clickedAt: waInteractions.clickedAt
    }).from(waInteractions).where(
      and9(
        eq14(waInteractions.agentId, user2.id),
        gte(waInteractions.clickedAt, twentyFourHoursAgo),
        // lte(waInteractions.clickedAt, fiveMinutesAgo) // Valid if we want EXACTLY > 5 mins
        sql7`${waInteractions.clickedAt} <= ${fiveMinutesAgo}`
      )
    ).limit(5);
    return c.json({
      success: true,
      data: pendingInteractions,
      hasUrgent: pendingInteractions.length > 0
    });
  } catch (error) {
    console.error("Agent Watchdog Error:", error);
    return c.json({ success: false, message: "Internal Server Error" }, 500);
  }
});
agentRoute.get("/referrals/:id", rbacMiddleware(), async (c) => {
  const user2 = c.get("user");
  const nasabahId = c.req.param("id");
  if (user2.role !== "agent") {
    return c.json({ success: false, message: "Unauthorized" }, 403);
  }
  try {
    const [referralCheck] = await db.select({
      id: users.id,
      fullName: profiles.fullName,
      userId: users.userId,
      pointsBalance: users.pointsBalance,
      whatsapp: profiles.whatsapp,
      email: profiles.email,
      joinedAt: users.createdAt
    }).from(profiles).innerJoin(users, eq14(profiles.userId, users.id)).where(
      and9(
        eq14(users.id, nasabahId),
        eq14(profiles.referredByAgentId, user2.userId)
        // CRITICAL SECURITY CHECK
      )
    ).limit(1);
    if (!referralCheck) {
      return c.json({ success: false, message: "Nasabah not found or not in your network." }, 404);
    }
    const nasabahPolis = await db.select().from(polisData).where(eq14(polisData.nasabahId, nasabahId)).orderBy(desc9(polisData.createdAt));
    const pointHistory = await db.select().from(pointsLedger).where(eq14(pointsLedger.userId, nasabahId)).orderBy(desc9(pointsLedger.createdAt)).limit(20);
    const interactions2 = await db.select().from(waInteractions).where(eq14(waInteractions.nasabahId, nasabahId)).orderBy(desc9(waInteractions.clickedAt)).limit(20);
    return c.json({
      success: true,
      data: {
        profile: referralCheck,
        polis: nasabahPolis,
        points: pointHistory,
        interactions: interactions2
      }
    });
  } catch (error) {
    console.error("Agent Referral Detail Error:", error);
    return c.json({ success: false, message: "Internal Server Error" }, 500);
  }
});
agentRoute.get("/reminders", rbacMiddleware(), async (c) => {
  const user2 = c.get("user");
  if (user2.role !== "agent") {
    return c.json({ success: false, message: "Unauthorized" }, 403);
  }
  try {
    const agentPolis = await db.select({
      id: polisData.id,
      polisNumber: polisData.polisNumber,
      createdAt: polisData.createdAt,
      nasabahName: profiles.fullName
    }).from(polisData).leftJoin(users, eq14(polisData.nasabahId, users.id)).leftJoin(profiles, eq14(users.id, profiles.userId)).where(eq14(polisData.agentId, user2.id));
    const now = /* @__PURE__ */ new Date();
    const reminders = agentPolis.map((p) => {
      if (!p.createdAt) return null;
      let months = (now.getFullYear() - p.createdAt.getFullYear()) * 12;
      months -= p.createdAt.getMonth();
      months += now.getMonth();
      const monthsLeft = 12 - months;
      if (monthsLeft === 1 || monthsLeft === 2 || monthsLeft === 3) {
        return {
          ...p,
          monthsLeft,
          message: `Polis #${p.polisNumber} atas nama ${p.nasabahName} jatuh tempo dalam ${monthsLeft} bulan.`
        };
      }
      return null;
    }).filter(Boolean);
    return c.json({ success: true, data: reminders });
  } catch (error) {
    console.error("Agent Reminders Error:", error);
    return c.json({ success: false, message: "Internal Server Error" }, 500);
  }
});
agentRoute.get("/birthdays", rbacMiddleware(), async (c) => {
  const user2 = c.get("user");
  if (user2.role !== "agent") {
    return c.json({ success: false, message: "Unauthorized" }, 403);
  }
  try {
    const timeZoneOffset = "+07:00";
    const birthdayQuery = sql7`
            SELECT 
                p.id,
                p.user_id as "userId",
                p.full_name as "fullName",
                p.whatsapp,
                p.date_of_birth as "dateOfBirth",
                EXTRACT(YEAR FROM CURRENT_DATE AT TIME ZONE ${timeZoneOffset}) - EXTRACT(YEAR FROM p.date_of_birth) AS age,
                CASE 
                    WHEN EXTRACT(MONTH FROM p.date_of_birth) = EXTRACT(MONTH FROM CURRENT_DATE AT TIME ZONE ${timeZoneOffset}) 
                         AND EXTRACT(DAY FROM p.date_of_birth) = EXTRACT(DAY FROM CURRENT_DATE AT TIME ZONE ${timeZoneOffset}) 
                    THEN 'today'
                    ELSE 'tomorrow'
                END as "birthdayWhen"
            FROM profiles p
            WHERE p.referred_by_agent_id = ${user2.userId}
              AND p.date_of_birth IS NOT NULL
              AND (
                  (EXTRACT(MONTH FROM p.date_of_birth) = EXTRACT(MONTH FROM CURRENT_DATE AT TIME ZONE ${timeZoneOffset}) 
                   AND EXTRACT(DAY FROM p.date_of_birth) = EXTRACT(DAY FROM CURRENT_DATE AT TIME ZONE ${timeZoneOffset}))
                  OR 
                  (EXTRACT(MONTH FROM p.date_of_birth) = EXTRACT(MONTH FROM (CURRENT_DATE + INTERVAL '1 day') AT TIME ZONE ${timeZoneOffset}) 
                   AND EXTRACT(DAY FROM p.date_of_birth) = EXTRACT(DAY FROM (CURRENT_DATE + INTERVAL '1 day') AT TIME ZONE ${timeZoneOffset}))
              )
            ORDER BY "birthdayWhen" DESC, "fullName" ASC
        `;
    const result = await db.execute(birthdayQuery);
    const data = result.rows || result;
    return c.json({ success: true, data });
  } catch (error) {
    console.error("Agent Birthdays Error:", error);
    return c.json({ success: false, message: "Failed to fetch birthdays" }, 500);
  }
});
var agent_default = agentRoute;

// src/routes/admin-logs.ts
init_dist();
import { Hono as Hono13 } from "hono";
import { eq as eq15, desc as desc10 } from "drizzle-orm";
var adminLogs = new Hono13();
adminLogs.use("*", rbacMiddleware("security"));
adminLogs.get("/logs", async (c) => {
  const limit = Number(c.req.query("limit")) || 100;
  const type = c.req.query("type");
  const target = c.req.query("target") || "admin";
  try {
    let query;
    if (target === "user") {
      const { userActivityLogs: userActivityLogs2 } = await Promise.resolve().then(() => (init_dist(), dist_exports));
      query = db.select({
        id: userActivityLogs2.id,
        userId: userActivityLogs2.userId,
        userName: profiles.fullName,
        userRole: users.role,
        action: userActivityLogs2.action,
        details: userActivityLogs2.details,
        ipAddress: userActivityLogs2.ipAddress,
        userAgent: userActivityLogs2.userAgent,
        createdAt: userActivityLogs2.createdAt
      }).from(userActivityLogs2).leftJoin(users, eq15(userActivityLogs2.userId, users.id)).leftJoin(profiles, eq15(users.id, profiles.userId)).orderBy(desc10(userActivityLogs2.createdAt)).limit(limit);
      if (type) {
        query.where(eq15(userActivityLogs2.action, type));
      }
    } else {
      query = db.select({
        id: adminActions.id,
        adminId: adminActions.adminId,
        // key matches frontend expected 'adminId' or we map it? frontend expects 'adminName'
        adminName: profiles.fullName,
        adminRole: users.role,
        action: adminActions.action,
        details: adminActions.details,
        ipAddress: adminActions.ipAddress,
        userAgent: adminActions.userAgent,
        createdAt: adminActions.createdAt
      }).from(adminActions).leftJoin(users, eq15(adminActions.adminId, users.id)).leftJoin(profiles, eq15(users.id, profiles.userId)).orderBy(desc10(adminActions.createdAt)).limit(limit);
      if (type) {
        query.where(eq15(adminActions.action, type));
      }
    }
    const logs = await query;
    return c.json({ success: true, data: logs });
  } catch (error) {
    console.error("Fetch Logs Error:", error);
    return c.json({ success: false, message: "Failed to fetch logs" }, 500);
  }
});
var admin_logs_default = adminLogs;

// src/middlewares/auth.ts
import { jwtVerify } from "jose";
var JWT_SECRET2 = new TextEncoder().encode(process.env.JWT_SECRET || "super_secret_key_change_me");
var authMiddleware = (options = { strict: true }) => {
  return async (c, next) => {
    const authHeader = c.req.header("Authorization");
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      console.log(`[AUTH] No Bearer token found in Header. Strict: ${options.strict}`);
      if (options.strict) {
        return c.json({ success: false, message: "Unauthorized: Missing or invalid token format" }, 401);
      }
      return await next();
    }
    const token = authHeader.split(" ")[1];
    if (!token) {
      if (options.strict) {
        return c.json({ success: false, message: "Unauthorized: Missing token" }, 401);
      }
      return await next();
    }
    try {
      const { payload } = await jwtVerify(token, JWT_SECRET2);
      const user2 = {
        id: payload.sub,
        userId: payload.userId,
        role: payload.role
      };
      c.set("user", user2);
      console.log(`[AUTH] Token Verified. User: ${user2.userId}, Role: ${user2.role}`);
      await next();
    } catch (error) {
      console.error("JWT Verify Error:", error);
      if (options.strict) {
        return c.json({ success: false, message: "Unauthorized: Invalid or expired token" }, 401);
      }
      await next();
    }
  };
};

// src/index.ts
var app = new Hono14();
console.log(`\u{1F680} API STARTED AT: ${(/* @__PURE__ */ new Date()).toISOString()}`);
app.use("*", logger());
app.use("*", cors({
  origin: ["http://localhost:3001", "http://localhost:3000", "https://trisula.vercel.app"],
  allowHeaders: ["Content-Type", "Authorization", "Accept"],
  allowMethods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
  exposeHeaders: ["Content-Length", "X-Kuma-Revision"],
  maxAge: 600,
  credentials: true
}));
app.use("*", authMiddleware({ strict: false }));
app.get("/", (c) => c.text("TRISULA API Orchestrator (Vercel Best Practice Test)"));
app.route("/api/v1/auth", auth_default);
app.route("/api/v1/user", user_default);
app.route("/api/v1/redeem", redeem_default);
app.route("/api/v1/admin/internal", admin_internal_default);
app.route("/api/v1/admin", admin_default);
app.route("/api/v1/admin", admin_logs_default);
app.route("/api/v1/products", products_default);
app.route("/api/v1/polis", polis_default);
app.route("/api/v1/content", content_default);
app.route("/api/v1/monitoring", monitoring_default);
app.route("/api/v1/dashboard", dashboard_default);
app.route("/api/v1/interactions", interactions_default);
app.route("/api/v1/agent", agent_default);
app.onError((err, c) => {
  console.error(`${err}`);
  return c.json({ success: false, message: "Internal Server Error" }, 500);
});
var index_default = app;

// src/serverless.ts
var serverless_default = handle(index_default);
export {
  serverless_default as default
};
