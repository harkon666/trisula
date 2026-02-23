"use client";

import { useState } from "react";
import { Card, Badge, Skeleton, Button } from "@/src/components/atoms";
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
    MessageCircle,
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
    const [showHistory, setShowHistory] = useState(false);

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
                <Badge variant="outline" className="ml-4 text-zinc-500 hidden sm:inline-flex">
                    {activity.length} transaksi
                </Badge>
                <div className="ml-auto">
                    {!showHistory ? (
                        <Button variant="outline" size="sm" onClick={() => setShowHistory(true)} className="text-xs w-full sm:w-auto">
                            Lihat Detail
                        </Button>
                    ) : (
                        <Button variant="ghost" size="sm" onClick={() => setShowHistory(false)} className="text-xs text-zinc-500 w-full sm:w-auto">
                            Sembunyikan
                        </Button>
                    )}
                </div>
            </div>

            {!showHistory ? null : (
                <>
                    {/* Desktop Table View */}
                    <div className="hidden md:block overflow-x-auto -mx-6">
                        <div className="max-h-[440px] overflow-y-auto scrollbar-thin scrollbar-track-transparent scrollbar-thumb-white/10 hover:scrollbar-thumb-gold-metallic/20 pr-1 px-6">
                            <table className="w-full text-left border-separate border-spacing-0">
                                <thead className="sticky top-0 z-20 bg-[#141414] shadow-[0_1px_0_rgba(255,255,255,0.05)]">
                                    <tr className="text-zinc-500">
                                        <th className="py-4 font-medium text-xs uppercase tracking-wider pl-4">Tanggal</th>
                                        <th className="py-4 font-medium text-xs uppercase tracking-wider">Aktivitas</th>
                                        <th className="py-4 font-medium text-xs uppercase tracking-wider">Sumber</th>
                                        <th className="py-4 font-medium text-xs uppercase tracking-wider text-right pr-4">Poin</th>
                                    </tr>
                                </thead>
                                <tbody className="text-sm">
                                    {activity.map((log) => {
                                        const config = getSourceConfig(log.source);
                                        const isPositive = log.amount > 0;

                                        return (
                                            <tr
                                                key={log.id}
                                                className="border-b border-white/[0.03] hover:bg-white/[0.03] transition-colors group/row"
                                            >
                                                <td className="py-5 pl-4 text-zinc-400 font-mono text-xs">
                                                    {new Date(log.createdAt).toLocaleDateString("id-ID", {
                                                        day: "2-digit",
                                                        month: "short",
                                                        year: "numeric",
                                                    })}
                                                </td>
                                                <td className="py-5 text-white font-medium">
                                                    {log.description}
                                                </td>
                                                <td className="py-5">
                                                    <div className="flex items-center gap-2">
                                                        <span className={`w-7 h-7 rounded-lg flex items-center justify-center transition-transform group-hover/row:scale-110 ${config.color}`}>
                                                            {config.icon}
                                                        </span>
                                                        <span className="text-zinc-400 text-xs font-medium">
                                                            {config.label}
                                                        </span>
                                                    </div>
                                                </td>
                                                <td className="py-5 pr-4 text-right">
                                                    <div className="flex items-center justify-end gap-3">
                                                        {log.source === "redeem" && log.csWhatsappNumber && (
                                                            <button
                                                                onClick={(e) => {
                                                                    e.stopPropagation();
                                                                    const title = log.description?.replace("Penukaran untuk ", "") || "";
                                                                    const message = encodeURIComponent(`Halo Admin Trisula, saya ingin menanyakan status penukaran reward saya: ${title}.`);
                                                                    window.open(`https://wa.me/${log.csWhatsappNumber}?text=${message}`, '_blank');
                                                                }}
                                                                className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500/20 hover:scale-105 active:scale-95 transition-all outline-none"
                                                                title="Chat CS via WhatsApp"
                                                            >
                                                                <MessageCircle className="w-3.5 h-3.5" />
                                                                <span className="text-[10px] font-bold uppercase tracking-wider">Chat CS</span>
                                                            </button>
                                                        )}
                                                        <div className="flex items-center gap-1">
                                                            {isPositive ? (
                                                                <ArrowUpRight className="w-3.5 h-3.5 text-emerald-400" />
                                                            ) : (
                                                                <ArrowDownRight className="w-3.5 h-3.5 text-red-400" />
                                                            )}
                                                            <span
                                                                className={`font-bold font-mono text-base ${isPositive ? "text-emerald-400" : "text-red-400"}`}
                                                            >
                                                                {isPositive ? "+" : ""}
                                                                {log.amount}
                                                            </span>
                                                        </div>
                                                    </div>
                                                </td>
                                            </tr>
                                        );
                                    })}
                                </tbody>
                            </table>
                        </div>
                    </div>

                    {/* Mobile Card List View */}
                    <div className="md:hidden space-y-4 max-h-[500px] overflow-y-auto pr-2 -mr-2 scrollbar-none">
                        {activity.map((log) => {
                            const config = getSourceConfig(log.source);
                            const isPositive = log.amount > 0;

                            return (
                                <div
                                    key={log.id}
                                    className="bg-white/[0.03] border border-white/5 rounded-2xl p-4 flex items-center justify-between gap-4 active:scale-[0.98] transition-all"
                                >
                                    <div className="flex items-center gap-4">
                                        <div className={`w-11 h-11 rounded-xl flex items-center justify-center shrink-0 ${config.color}`}>
                                            {config.icon}
                                        </div>
                                        <div className="min-w-0">
                                            <p className="text-white font-bold text-sm truncate">
                                                {log.description}
                                            </p>
                                            <div className="flex items-center gap-2 mt-0.5">
                                                <span className="text-zinc-500 text-[10px] uppercase tracking-wider font-mono">
                                                    {new Date(log.createdAt).toLocaleDateString("id-ID", {
                                                        day: "2-digit",
                                                        month: "short",
                                                    })}
                                                </span>
                                                <span className="w-1 h-1 rounded-full bg-zinc-800" />
                                                <span className="text-zinc-500 text-[10px]">
                                                    {config.label}
                                                </span>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="text-right flex flex-col items-end gap-2">
                                        <div className={`flex items-center justify-end font-black text-lg ${isPositive ? "text-emerald-400" : "text-red-400"}`}>
                                            {isPositive ? "+" : ""}
                                            {log.amount}
                                        </div>
                                        {log.source === "redeem" && log.csWhatsappNumber && (
                                            <button
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    const title = log.description?.replace("Penukaran untuk ", "") || "";
                                                    const message = encodeURIComponent(`Halo Admin Trisula, saya ingin menanyakan status penukaran reward saya: ${title}.`);
                                                    window.open(`https://wa.me/${log.csWhatsappNumber}?text=${message}`, '_blank');
                                                }}
                                                className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-emerald-500/10 text-emerald-400 active:scale-95 transition-all"
                                            >
                                                <MessageCircle className="w-3.5 h-3.5" />
                                                <span className="text-[10px] font-bold uppercase tracking-wider hidden sm:inline-block">Chat CS</span>
                                            </button>
                                        )}
                                    </div>
                                </div>
                            );
                        })}
                    </div>

                    <div className="mt-4 md:hidden text-center pb-4">
                        <p className="text-zinc-600 text-[10px] uppercase tracking-[0.2em]">Scroll untuk melihat lebih banyak</p>
                    </div>
                </>
            )}
        </Card>
    );
}
