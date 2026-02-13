"use client";

import { useAdminUserPointHistory } from "@/src/hooks/useAdminUsers";
import {
    Clock,
    Sparkles,
    ArrowUpRight,
    ArrowDownRight,
    History,
    Calendar,
    Info,
    Loader2
} from "lucide-react";
import { Card, Badge, Skeleton } from "@/src/components/atoms";
import { format } from "date-fns";
import { id } from "date-fns/locale";
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs));
}

interface AdminUserPointHistoryProps {
    userId: string;
}

export function AdminUserPointHistory({ userId }: AdminUserPointHistoryProps) {
    const { data: history, isLoading } = useAdminUserPointHistory(userId);

    const getSourceColor = (source: string) => {
        switch (source) {
            case 'welcome': return "text-gold-metallic bg-gold-metallic/5 border-gold-metallic/10";
            case 'daily': return "text-emerald-400 bg-emerald-400/5 border-emerald-400/10";
            case 'purchase': return "text-blue-400 bg-blue-400/5 border-blue-400/10";
            case 'redeem': return "text-amber-400 bg-amber-400/5 border-amber-400/10";
            case 'refund': return "text-purple-400 bg-purple-400/5 border-purple-400/10";
            default: return "text-zinc-500 bg-zinc-500/5 border-zinc-500/10";
        }
    };

    if (isLoading) {
        return (
            <div className="space-y-4">
                {Array.from({ length: 5 }).map((_, i) => (
                    <div key={i} className="flex items-center gap-4 p-4 rounded-2xl bg-white/[0.02] border border-white/5 animate-pulse">
                        <div className="w-10 h-10 rounded-xl bg-white/5" />
                        <div className="flex-1 space-y-2">
                            <div className="h-4 bg-white/5 rounded w-1/4" />
                            <div className="h-3 bg-white/5 rounded w-1/2" />
                        </div>
                        <div className="w-20 h-6 bg-white/5 rounded-full" />
                    </div>
                ))}
            </div>
        );
    }

    if (!history || history.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center py-20 text-center space-y-4 rounded-3xl border border-dashed border-white/10 bg-white/[0.01]">
                <div className="w-16 h-16 rounded-full bg-charcoal-800 flex items-center justify-center text-zinc-600">
                    <History className="w-8 h-8 opacity-20" />
                </div>
                <div className="space-y-1">
                    <p className="text-sm font-bold text-zinc-400 italic">Belum ada riwayat transaksi poin.</p>
                    <p className="text-xs text-zinc-600">Semua aktivitas poin nasabah akan tercatat di sini.</p>
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-lg bg-gold-metallic/10 border border-gold-metallic/20 flex items-center justify-center">
                        <Clock className="w-4 h-4 text-gold-metallic" />
                    </div>
                    <span className="text-sm font-bold text-zinc-400 uppercase tracking-widest">Transaction Ledger</span>
                </div>
                <Badge variant="outline" className="text-[10px] font-black tracking-widest bg-white/[0.02] border-white/5">
                    {history.length} TRANSAKSI
                </Badge>
            </div>

            <Card variant="outline" className="bg-black/20 border-white/5 overflow-hidden p-0">
                <div className="divide-y divide-white/5">
                    {history.map((tx) => (
                        <div key={tx.id} className="group flex items-center gap-4 p-5 hover:bg-white/[0.02] transition-all">
                            <div className={cn(
                                "w-12 h-12 rounded-2xl flex items-center justify-center border transition-all shadow-sm",
                                tx.amount > 0
                                    ? "bg-emerald-500/5 border-emerald-500/10 text-emerald-500 group-hover:border-emerald-500/30"
                                    : "bg-red-500/5 border-red-500/10 text-red-500 group-hover:border-red-500/30"
                            )}>
                                {tx.amount > 0 ? <ArrowUpRight className="w-6 h-6" /> : <ArrowDownRight className="w-6 h-6" />}
                            </div>

                            <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-2 mb-1">
                                    <span className={cn(
                                        "px-2 py-0.5 rounded-md text-[9px] font-black uppercase tracking-wider border",
                                        getSourceColor(tx.source)
                                    )}>
                                        {tx.source}
                                    </span>
                                    <span className="text-xs text-zinc-500 font-mono">
                                        {format(new Date(tx.createdAt), "dd MMM yyyy, HH:mm", { locale: id })}
                                    </span>
                                </div>
                                <h4 className="text-sm font-bold text-zinc-200 group-hover:text-white transition-colors truncate">
                                    {tx.description || "Point adjustment"}
                                </h4>
                            </div>

                            <div className="text-right flex flex-col items-end gap-1">
                                <div className={cn(
                                    "flex items-center gap-1.5 text-lg font-black tracking-tighter",
                                    tx.amount > 0 ? "text-gold-metallic" : "text-red-500"
                                )}>
                                    <Sparkles className={cn("w-4 h-4", tx.amount > 0 ? "text-gold-metallic" : "text-red-500 opacity-50")} />
                                    {tx.amount > 0 ? "+" : ""}{tx.amount.toLocaleString()}
                                </div>
                                <span className="text-[9px] font-bold text-zinc-600 uppercase tracking-widest">Points</span>
                            </div>
                        </div>
                    ))}
                </div>
            </Card>

            <div className="flex items-center gap-3 p-4 rounded-2xl bg-royal-blue/5 border border-royal-blue/10">
                <Info className="w-5 h-5 text-royal-blue" />
                <p className="text-[10px] font-bold text-royal-blue/70 uppercase tracking-widest leading-relaxed">
                    Setiap transaksi poin bersifat permanen dan dicatat dalam audit trail TRISULA untuk transparansi keamanan.
                </p>
            </div>
        </div>
    );
}
