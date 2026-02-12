"use client";

import { Card, Badge, Skeleton } from "@/src/components/atoms";
import {
    Gift,
    CalendarCheck,
    ShoppingBag,
    Users,
    RotateCcw,
    Coins,
    ArrowUpRight,
    ArrowDownRight,
    Inbox,
} from "lucide-react";
import type { ActivityLog } from "@/src/hooks/useNasabahDashboard";

// --- Source icon map ---
const SOURCE_CONFIG: Record<string, { icon: React.ReactNode; label: string; color: string }> = {
    welcome: {
        icon: <Gift className="w-4 h-4" />,
        label: "Welcome Bonus",
        color: "text-emerald-400 bg-emerald-400/10",
    },
    daily: {
        icon: <CalendarCheck className="w-4 h-4" />,
        label: "Harian",
        color: "text-blue-400 bg-blue-400/10",
    },
    redeem: {
        icon: <ShoppingBag className="w-4 h-4" />,
        label: "Redeem",
        color: "text-amber-400 bg-amber-400/10",
    },
    referral: {
        icon: <Users className="w-4 h-4" />,
        label: "Referral",
        color: "text-purple-400 bg-purple-400/10",
    },
    refund: {
        icon: <RotateCcw className="w-4 h-4" />,
        label: "Refund",
        color: "text-cyan-400 bg-cyan-400/10",
    },
};

function getSourceConfig(source: string) {
    return SOURCE_CONFIG[source] || {
        icon: <Coins className="w-4 h-4" />,
        label: source,
        color: "text-zinc-400 bg-zinc-400/10",
    };
}

// --- Component ---
interface NasabahActivityTableProps {
    activity: ActivityLog[] | undefined;
    isLoading: boolean;
}

export function NasabahActivityTable({ activity, isLoading }: NasabahActivityTableProps) {
    if (isLoading) {
        return (
            <Card variant="glass" className="bg-charcoal-800/50 border-white/5">
                <div className="flex items-center gap-3 mb-8">
                    <span className="w-1.5 h-7 bg-gold-metallic rounded-full" />
                    <Skeleton className="h-6 w-44 bg-white/10" />
                </div>
                <div className="space-y-3">
                    {[1, 2, 3, 4, 5].map((i) => (
                        <Skeleton key={i} className="h-14 w-full bg-white/5 rounded-xl" />
                    ))}
                </div>
            </Card>
        );
    }

    if (!activity || activity.length === 0) {
        return (
            <Card variant="glass" className="bg-charcoal-800/50 border-white/5">
                <div className="flex items-center gap-3 mb-8">
                    <span className="w-1.5 h-7 bg-gold-metallic rounded-full" />
                    <h2 className="text-xl font-bold text-white">Riwayat Poin</h2>
                </div>
                <div className="flex flex-col items-center justify-center py-16 text-center">
                    <div className="w-16 h-16 rounded-2xl bg-white/5 flex items-center justify-center mb-4">
                        <Inbox className="w-8 h-8 text-zinc-600" />
                    </div>
                    <p className="text-zinc-500 font-medium">Belum ada riwayat aktivitas</p>
                    <p className="text-zinc-600 text-sm mt-1">Transaksi poin Anda akan muncul di sini</p>
                </div>
            </Card>
        );
    }

    return (
        <Card variant="glass" className="bg-charcoal-800/50 border-white/5 overflow-hidden">
            <div className="flex items-center gap-3 mb-8">
                <span className="w-1.5 h-7 bg-gold-metallic rounded-full" />
                <h2 className="text-xl font-bold text-white">Riwayat Poin</h2>
                <Badge variant="outline" className="ml-auto text-zinc-500">
                    {activity.length} transaksi
                </Badge>
            </div>

            <div className="overflow-x-auto -mx-6">
                <table className="w-full text-left min-w-[580px]">
                    <thead>
                        <tr className="text-zinc-500 border-b border-white/5">
                            <th className="pb-4 font-medium text-xs uppercase tracking-wider pl-6">Tanggal</th>
                            <th className="pb-4 font-medium text-xs uppercase tracking-wider">Aktivitas</th>
                            <th className="pb-4 font-medium text-xs uppercase tracking-wider">Sumber</th>
                            <th className="pb-4 font-medium text-xs uppercase tracking-wider text-right pr-6">Poin</th>
                        </tr>
                    </thead>
                    <tbody className="text-sm">
                        {activity.map((log) => {
                            const config = getSourceConfig(log.source);
                            const isPositive = log.amount > 0;

                            return (
                                <tr
                                    key={log.id}
                                    className="border-b border-white/[0.03] hover:bg-white/[0.03] transition-colors"
                                >
                                    <td className="py-4 pl-6 text-zinc-400 font-mono text-xs">
                                        {new Date(log.createdAt).toLocaleDateString("id-ID", {
                                            day: "2-digit",
                                            month: "short",
                                            year: "numeric",
                                        })}
                                    </td>
                                    <td className="py-4 text-white font-medium">
                                        {log.description}
                                    </td>
                                    <td className="py-4">
                                        <div className="flex items-center gap-2">
                                            <span className={`w-7 h-7 rounded-lg flex items-center justify-center ${config.color}`}>
                                                {config.icon}
                                            </span>
                                            <span className="text-zinc-400 text-xs font-medium">
                                                {config.label}
                                            </span>
                                        </div>
                                    </td>
                                    <td className="py-4 pr-6 text-right">
                                        <div className="flex items-center justify-end gap-1">
                                            {isPositive ? (
                                                <ArrowUpRight className="w-3.5 h-3.5 text-emerald-400" />
                                            ) : (
                                                <ArrowDownRight className="w-3.5 h-3.5 text-red-400" />
                                            )}
                                            <span
                                                className={`font-bold font-mono ${isPositive ? "text-emerald-400" : "text-red-400"}`}
                                            >
                                                {isPositive ? "+" : ""}
                                                {log.amount}
                                            </span>
                                        </div>
                                    </td>
                                </tr>
                            );
                        })}
                    </tbody>
                </table>
            </div>
        </Card>
    );
}
