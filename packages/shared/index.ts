import { z } from "zod";

// --- ENUMS ---
export const UserRole = z.enum(["user", "agent", "admin", "super_admin"]);
export const UserStatus = z.enum(["pending", "active", "suspended"]);
export const PointsSource = z.enum(["system", "admin", "redeem"]);
export const RedeemStatus = z.enum(["pending", "processing", "completed", "rejected"]);

// --- USER SCHEMAS ---
export const UserSchema = z.object({
    id: z.uuid(),
    email: z.string().email("Format email tidak valid"),
    name: z.string().min(2, "Nama terlalu pendek"),
    phone: z.string().min(10, "Nomor telepon tidak valid"),
    city: z.string().optional(),
    walletAddress: z
        .string()
        .regex(/^0x[a-fA-F0-9]{40}$/, "Format wallet address Base tidak valid"),
    role: UserRole.default("user"),
    status: UserStatus.default("pending"),
    createdAt: z.date().optional(),
    updatedAt: z.date().optional(),
});

// Skema untuk input registrasi (tanpa ID dan metadata)
export const RegisterUserSchema = UserSchema.omit({
    id: true,
    status: true,
    createdAt: true,
    updatedAt: true,
    role: true,
}).extend({
    password: z.string().min(8, "Password minimal 8 karakter").optional(),
    referralCode: z.string().optional(),
});

// --- AGENT SCHEMAS ---
export const AgentSchema = z.object({
    id: z.uuid(),
    userId: z.uuid(),
    referralCode: z.string().min(3),
    isActive: z.boolean().default(true),
});

// --- POINTS SCHEMAS ---
export const PointsLedgerSchema = z.object({
    id: z.uuid(),
    userId: z.uuid(),
    amount: z.number().int(),
    reason: z.string().min(5, "Alasan harus jelas"),
    source: PointsSource,
    adminId: z.uuid().nullable(),
    onchainTx: z.string().nullable(),
});

// Input untuk menambah/mengurangi poin oleh Admin
export const AdjustPointsSchema = PointsLedgerSchema.pick({
    userId: true,
    amount: true,
    reason: true,
}).extend({
    // Menambahkan validasi tambahan jika diperlukan
});

// --- REDEEM SCHEMAS ---
export const RedeemRequestSchema = z.object({
    id: z.uuid(),
    userId: z.uuid(),
    catalogId: z.number().int(),
    pointsUsed: z.number().int().positive(),
    whatsappNumber: z.string(),
    status: RedeemStatus.default("pending"),
    onchainTx: z.string().nullable(),
});

// --- TYPES INFERENCE ---
// Ini akan mengubah skema Zod menjadi tipe TypeScript otomatis
export type User = z.infer<typeof UserSchema>;
export type Agent = z.infer<typeof AgentSchema>;
export type PointsLedger = z.infer<typeof PointsLedgerSchema>;
export type RedeemRequest = z.infer<typeof RedeemRequestSchema>;