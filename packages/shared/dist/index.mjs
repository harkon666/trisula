// index.ts
import { z } from "zod";
var UserRole = z.enum(["user", "agent", "admin", "super_admin"]);
var UserStatus = z.enum(["pending", "active", "suspended"]);
var PointsSource = z.enum(["system", "admin", "redeem"]);
var RedeemStatus = z.enum(["pending", "processing", "completed", "rejected"]);
var UserSchema = z.object({
  id: z.uuid(),
  email: z.string().email("Format email tidak valid"),
  name: z.string().min(2, "Nama terlalu pendek"),
  phone: z.string().min(10, "Nomor telepon tidak valid"),
  city: z.string().optional(),
  walletAddress: z.string().regex(/^0x[a-fA-F0-9]{40}$/, "Format wallet address Base tidak valid"),
  role: UserRole.default("user"),
  status: UserStatus.default("pending"),
  createdAt: z.date().optional(),
  updatedAt: z.date().optional()
});
var RegisterUserSchema = UserSchema.omit({
  id: true,
  status: true,
  createdAt: true,
  updatedAt: true,
  role: true
}).extend({
  password: z.string().min(8, "Password minimal 8 karakter").optional(),
  referralCode: z.string().optional()
});
var AgentSchema = z.object({
  id: z.uuid(),
  userId: z.uuid(),
  referralCode: z.string().min(3),
  isActive: z.boolean().default(true)
});
var PointsLedgerSchema = z.object({
  id: z.uuid(),
  userId: z.uuid(),
  amount: z.number().int(),
  reason: z.string().min(5, "Alasan harus jelas"),
  source: PointsSource,
  adminId: z.uuid().nullable(),
  onchainTx: z.string().nullable()
});
var AdjustPointsSchema = PointsLedgerSchema.pick({
  userId: true,
  amount: true,
  reason: true
}).extend({
  // Menambahkan validasi tambahan jika diperlukan
});
var RedeemRequestSchema = z.object({
  id: z.uuid(),
  userId: z.uuid(),
  catalogId: z.number().int(),
  pointsUsed: z.number().int().positive(),
  whatsappNumber: z.string(),
  status: RedeemStatus.default("pending"),
  onchainTx: z.string().nullable()
});
export {
  AdjustPointsSchema,
  AgentSchema,
  PointsLedgerSchema,
  PointsSource,
  RedeemRequestSchema,
  RedeemStatus,
  RegisterUserSchema,
  UserRole,
  UserSchema,
  UserStatus
};
