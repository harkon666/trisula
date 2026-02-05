import { z } from 'zod';

declare const UserRole: z.ZodEnum<{
    user: "user";
    agent: "agent";
    admin: "admin";
    super_admin: "super_admin";
}>;
declare const UserStatus: z.ZodEnum<{
    pending: "pending";
    active: "active";
    suspended: "suspended";
}>;
declare const PointsSource: z.ZodEnum<{
    admin: "admin";
    system: "system";
    redeem: "redeem";
}>;
declare const RedeemStatus: z.ZodEnum<{
    pending: "pending";
    processing: "processing";
    completed: "completed";
    rejected: "rejected";
}>;
declare const UserSchema: z.ZodObject<{
    id: z.ZodUUID;
    email: z.ZodString;
    name: z.ZodString;
    phone: z.ZodString;
    city: z.ZodOptional<z.ZodString>;
    walletAddress: z.ZodString;
    role: z.ZodDefault<z.ZodEnum<{
        user: "user";
        agent: "agent";
        admin: "admin";
        super_admin: "super_admin";
    }>>;
    status: z.ZodDefault<z.ZodEnum<{
        pending: "pending";
        active: "active";
        suspended: "suspended";
    }>>;
    createdAt: z.ZodOptional<z.ZodDate>;
    updatedAt: z.ZodOptional<z.ZodDate>;
}, z.core.$strip>;
declare const RegisterUserSchema: z.ZodObject<{
    email: z.ZodString;
    name: z.ZodString;
    phone: z.ZodString;
    city: z.ZodOptional<z.ZodString>;
    walletAddress: z.ZodString;
    password: z.ZodOptional<z.ZodString>;
    referralCode: z.ZodOptional<z.ZodString>;
}, z.core.$strip>;
declare const AgentSchema: z.ZodObject<{
    id: z.ZodUUID;
    userId: z.ZodUUID;
    referralCode: z.ZodString;
    isActive: z.ZodDefault<z.ZodBoolean>;
}, z.core.$strip>;
declare const PointsLedgerSchema: z.ZodObject<{
    id: z.ZodUUID;
    userId: z.ZodUUID;
    amount: z.ZodNumber;
    reason: z.ZodString;
    source: z.ZodEnum<{
        admin: "admin";
        system: "system";
        redeem: "redeem";
    }>;
    adminId: z.ZodNullable<z.ZodUUID>;
    txHash: z.ZodNullable<z.ZodString>;
}, z.core.$strip>;
declare const AdjustPointsSchema: z.ZodObject<{
    userId: z.ZodUUID;
    amount: z.ZodNumber;
    reason: z.ZodString;
}, z.core.$strip>;
declare const RedeemRequestSchema: z.ZodObject<{
    id: z.ZodUUID;
    userId: z.ZodUUID;
    rewardId: z.ZodNumber;
    pointsUsed: z.ZodNumber;
    whatsappNumber: z.ZodString;
    status: z.ZodDefault<z.ZodEnum<{
        pending: "pending";
        processing: "processing";
        completed: "completed";
        rejected: "rejected";
    }>>;
    txHash: z.ZodNullable<z.ZodString>;
}, z.core.$strip>;
type User = z.infer<typeof UserSchema>;
type Agent = z.infer<typeof AgentSchema>;
type PointsLedger = z.infer<typeof PointsLedgerSchema>;
type RedeemRequest = z.infer<typeof RedeemRequestSchema>;

export { AdjustPointsSchema, type Agent, AgentSchema, type PointsLedger, PointsLedgerSchema, PointsSource, type RedeemRequest, RedeemRequestSchema, RedeemStatus, RegisterUserSchema, type User, UserRole, UserSchema, UserStatus };
