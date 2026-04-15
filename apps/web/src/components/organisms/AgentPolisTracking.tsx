"use client";

import { useAgentPolisHistory } from "@/src/hooks/useAgentDashboard";
import { Clock, CheckCircle, XCircle, FileText, Loader2, AlertTriangle } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useState } from "react";

export function AgentPolisTracking() {
    const { data: history, isLoading } = useAgentPolisHistory();
    const [expandedId, setExpandedId] = useState<number | null>(null);

    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat("id-ID", {
            style: "currency",
            currency: "IDR",
            minimumFractionDigits: 0,
        }).format(amount);
    };

    const formatDate = (dateStr: string) => {
        return new Date(dateStr).toLocaleDateString("id-ID", {
            day: "numeric",
            month: "short",
            year: "numeric",
            hour: "2-digit",
            minute: "2-digit",
        });
    };

    const getStatusBadge = (status: string) => {
        switch (status) {
            case 'approved':
                return (
                    <span className="flex items-center gap-1.5 px-3 py-1.5 text-[10px] font-bold rounded-xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                        <CheckCircle className="w-3 h-3" />
                        APPROVED
                    </span>
                );
            case 'rejected':
                return (
                    <span className="flex items-center gap-1.5 px-3 py-1.5 text-[10px] font-bold rounded-xl bg-red-500/20 text-red-400 border border-red-500/30">
                        <XCircle className="w-3 h-3" />
                        REJECTED
                    </span>
                );
            default:
                return (
                    <span className="flex items-center gap-1.5 px-3 py-1.5 text-[10px] font-bold rounded-xl bg-amber-500/20 text-amber-400 border border-amber-500/30">
                        <Clock className="w-3 h-3" />
                        PENDING
                    </span>
                );
        }
    };

    const stats = {
        total: history?.length || 0,
        pending: history?.filter(h => h.status === 'pending').length || 0,
        approved: history?.filter(h => h.status === 'approved').length || 0,
        rejected: history?.filter(h => h.status === 'rejected').length || 0,
    };

    if (isLoading) {
        return (
            <div className="flex items-center justify-center py-16">
                <Loader2 className="w-8 h-8 text-trisula-500 animate-spin" />
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Stats Cards */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="p-4 rounded-2xl bg-charcoal-900/40 border border-white/5">
                    <p className="text-xs text-zinc-500 font-bold uppercase tracking-widest mb-1">Total Input</p>
                    <p className="text-2xl font-black text-white">{stats.total}</p>
                </div>
                <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/20">
                    <p className="text-xs text-amber-400 font-bold uppercase tracking-widest mb-1">Pending</p>
                    <p className="text-2xl font-black text-amber-400">{stats.pending}</p>
                </div>
                <div className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/20">
                    <p className="text-xs text-emerald-400 font-bold uppercase tracking-widest mb-1">Approved</p>
                    <p className="text-2xl font-black text-emerald-400">{stats.approved}</p>
                </div>
                <div className="p-4 rounded-2xl bg-red-500/10 border border-red-500/20">
                    <p className="text-xs text-red-400 font-bold uppercase tracking-widest mb-1">Rejected</p>
                    <p className="text-2xl font-black text-red-400">{stats.rejected}</p>
                </div>
            </div>

            {/* History List */}
            {(!history || history.length === 0) ? (
                <div className="text-center py-12 rounded-3xl bg-charcoal-900/20 border border-white/5">
                    <div className="w-16 h-16 bg-trisula-500/10 rounded-full flex items-center justify-center mx-auto mb-4">
                        <FileText className="w-8 h-8 text-trisula-500" />
                    </div>
                    <h3 className="text-lg font-bold text-white mb-2">Belum Ada Input Polis</h3>
                    <p className="text-sm text-zinc-500">Input polis pertama anda untuk melihat tracking di sini</p>
                </div>
            ) : (
                <div className="space-y-3">
                    {history.map((polis) => (
                        <div
                            key={polis.id}
                            className="bg-charcoal-900/60 border border-white/10 rounded-2xl overflow-hidden hover:border-trisula-500/30 transition-all"
                        >
                            {/* Header - Always Visible */}
                            <div
                                className="p-4 flex items-center justify-between cursor-pointer"
                                onClick={() => setExpandedId(expandedId === polis.id ? null : polis.id)}
                            >
                                <div className="flex items-center gap-4">
                                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                                        polis.status === 'approved' ? 'bg-emerald-500/10' :
                                        polis.status === 'rejected' ? 'bg-red-500/10' : 'bg-amber-500/10'
                                    }`}>
                                        {polis.status === 'approved' ? (
                                            <CheckCircle className="w-5 h-5 text-emerald-500" />
                                        ) : polis.status === 'rejected' ? (
                                            <XCircle className="w-5 h-5 text-red-500" />
                                        ) : (
                                            <Clock className="w-5 h-5 text-amber-500" />
                                        )}
                                    </div>
                                    <div>
                                        <p className="font-bold text-white">{polis.polisNumber}</p>
                                        <p className="text-xs text-zinc-500">
                                            {polis.productName || "Produk tidak disebutkan"} • {formatCurrency(polis.premiumAmount)}
                                        </p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-3">
                                    <span className="text-xs text-zinc-500 hidden sm:block">{formatDate(polis.createdAt)}</span>
                                    {getStatusBadge(polis.status)}
                                </div>
                            </div>

                            {/* Expanded Details */}
                            <AnimatePresence>
                                {expandedId === polis.id && (
                                    <motion.div
                                        initial={{ height: 0, opacity: 0 }}
                                        animate={{ height: "auto", opacity: 1 }}
                                        exit={{ height: 0, opacity: 0 }}
                                        transition={{ duration: 0.2 }}
                                        className="border-t border-white/5"
                                    >
                                        <div className="p-4 bg-midnight-950/50 space-y-4">
                                            {/* Details Grid */}
                                            <div className="grid grid-cols-2 gap-4 text-sm">
                                                <div className="bg-charcoal-800/50 rounded-xl p-3">
                                                    <p className="text-xs text-zinc-500 mb-1">ID Polis</p>
                                                    <p className="font-mono text-white">#{polis.id}</p>
                                                </div>
                                                <div className="bg-charcoal-800/50 rounded-xl p-3">
                                                    <p className="text-xs text-zinc-500 mb-1">Nasabah</p>
                                                    <p className="font-bold text-white">{polis.nasalName || "Unknown"}</p>
                                                </div>
                                                <div className="bg-charcoal-800/50 rounded-xl p-3">
                                                    <p className="text-xs text-zinc-500 mb-1">Premi</p>
                                                    <p className="font-bold text-emerald-400">{formatCurrency(polis.premiumAmount)}</p>
                                                </div>
                                                <div className="bg-charcoal-800/50 rounded-xl p-3">
                                                    <p className="text-xs text-zinc-500 mb-1">Estimasi Poin</p>
                                                    <p className="font-bold text-trisula-400">{Math.floor(polis.premiumAmount / 1000)} pts</p>
                                                </div>
                                            </div>

                                            {/* Rejection Reason */}
                                            {polis.status === 'rejected' && polis.rejectionReason && (
                                                <div className="flex items-start gap-3 p-4 rounded-xl bg-red-500/10 border border-red-500/20">
                                                    <AlertTriangle className="w-5 h-5 text-red-400 mt-0.5 shrink-0" />
                                                    <div>
                                                        <p className="text-xs font-bold text-red-400 mb-1">ALASAN PENOLAKAN</p>
                                                        <p className="text-sm text-red-300 leading-relaxed">{polis.rejectionReason}</p>
                                                    </div>
                                                </div>
                                            )}

                                            {/* Status Message */}
                                            {polis.status === 'pending' && (
                                                <div className="flex items-start gap-3 p-4 rounded-xl bg-amber-500/10 border border-amber-500/20">
                                                    <Clock className="w-5 h-5 text-amber-400 mt-0.5 shrink-0" />
                                                    <p className="text-sm text-amber-300 leading-relaxed">
                                                        Polis ini menunggu persetujuan admin. Anda akan mendapat notifikasi ketika sudah diproses.
                                                    </p>
                                                </div>
                                            )}

                                            {polis.status === 'approved' && (
                                                <div className="flex items-start gap-3 p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/20">
                                                    <CheckCircle className="w-5 h-5 text-emerald-400 mt-0.5 shrink-0" />
                                                    <p className="text-sm text-emerald-300 leading-relaxed">
                                                        Polis telah disetujui. Poin telah ditambahkan ke rekening城乡居民.
                                                    </p>
                                                </div>
                                            )}
                                        </div>
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}