"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import api from "@/src/lib/api-client";
import { toast } from "sonner";
import { ShieldCheck, Clock, CheckCircle, XCircle, FileText, User, AlertTriangle, Loader2 } from "lucide-react";
import { Button, Input } from "@/src/components/atoms";
import { motion, AnimatePresence } from "framer-motion";

interface PendingPolis {
    id: number;
    polisNumber: string;
    premiumAmount: number;
    productName: string | null;
    status: string;
    createdAt: string;
    createdAtDate?: string;
   nasabah?: {
        id: string;
        name: string;
        whatsapp: string;
    };
    agent?: {
        id: string;
        name: string;
    };
}

interface PolisWithDetails extends PendingPolis {
    nasalName?: string;
    agentName?: string;
}

export function AdminPolisApprovalList() {
    const queryClient = useQueryClient();
    const [expandedId, setExpandedId] = useState<number | null>(null);
    const [rejectReason, setRejectReason] = useState<string>("");
    const [showRejectModal, setShowRejectModal] = useState<number | null>(null);

    const { data: pendingPolis, isLoading } = useQuery({
        queryKey: ["admin", "polis", "pending"],
        queryFn: async () => {
            const res = await api.get("/v1/polis/pending");
            return res.data.data || [];
        },
    });

    const approveMutation = useMutation({
        mutationFn: async (id: number) => {
            const res = await api.patch(`/v1/polis/${id}/approve`, { status: 'approved' });
            return res.data;
        },
        onSuccess: () => {
            toast.success("Polis berhasil disetujui");
            queryClient.invalidateQueries({ queryKey: ["admin", "polis", "pending"] });
            queryClient.invalidateQueries({ queryKey: ["admin", "polis"] });
        },
        onError: (error: any) => {
            toast.error(error.response?.data?.message || "Gagal menyetujui polis");
        },
    });

    const rejectMutation = useMutation({
        mutationFn: async ({ id, reason }: { id: number; reason: string }) => {
            const res = await api.patch(`/v1/polis/${id}/approve`, { status: 'rejected', rejectionReason: reason });
            return res.data;
        },
        onSuccess: () => {
            toast.success("Polis ditolak");
            setShowRejectModal(null);
            setRejectReason("");
            queryClient.invalidateQueries({ queryKey: ["admin", "polis", "pending"] });
            queryClient.invalidateQueries({ queryKey: ["admin", "polis"] });
        },
        onError: (error: any) => {
            toast.error(error.response?.data?.message || "Gagal menolak polis");
        },
    });

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

    if (isLoading) {
        return (
            <div className="flex items-center justify-center py-12">
                <Loader2 className="w-8 h-8 text-trisula-500 animate-spin" />
            </div>
        );
    }

    if (!pendingPolis || pendingPolis.length === 0) {
        return (
            <div className="text-center py-12">
                <div className="w-16 h-16 bg-emerald-500/10 rounded-full flex items-center justify-center mx-auto mb-4">
                    <CheckCircle className="w-8 h-8 text-emerald-500" />
                </div>
                <h3 className="text-lg font-bold text-white mb-2">Tidak Ada Polis Pending</h3>
                <p className="text-sm text-zinc-500">Semua polis sudah diproses</p>
            </div>
        );
    }

    return (
        <div className="space-y-4">
            <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 rounded-xl bg-amber-500/20 flex items-center justify-center">
                    <Clock className="w-5 h-5 text-amber-500" />
                </div>
                <div>
                    <h3 className="text-lg font-bold text-white">Polis Menunggu Persetujuan</h3>
                    <p className="text-xs text-zinc-500">{pendingPolis.length} polis perlu diverifikasi</p>
                </div>
            </div>

            <div className="space-y-3">
                {pendingPolis.map((polis: any) => (
                    <div
                        key={polis.id}
                        className="bg-charcoal-900/60 border border-white/10 rounded-2xl overflow-hidden hover:border-amber-500/30 transition-colors"
                    >
                        {/* Header - Always Visible */}
                        <div
                            className="p-4 flex items-center justify-between cursor-pointer"
                            onClick={() => setExpandedId(expandedId === polis.id ? null : polis.id)}
                        >
                            <div className="flex items-center gap-4">
                                <div className="w-10 h-10 rounded-xl bg-amber-500/10 flex items-center justify-center">
                                    <FileText className="w-5 h-5 text-amber-500" />
                                </div>
                                <div>
                                    <p className="font-bold text-white">{polis.polisNumber}</p>
                                    <p className="text-xs text-zinc-500">
                                        {polis.productName || "Produk tidak disebutkan"} • {formatCurrency(polis.premiumAmount)}
                                    </p>
                                </div>
                            </div>
                            <div className="flex items-center gap-3">
                                <span className="text-xs text-zinc-500">{formatDate(polis.createdAt)}</span>
                                <span className="px-2 py-1 text-[10px] font-bold rounded bg-amber-500/20 text-amber-400 border border-amber-500/30">
                                    PENDING
                                </span>
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
                                                <p className="text-xs text-zinc-500 mb-1">Tanggal Input</p>
                                                <p className="text-white">{formatDate(polis.createdAt)}</p>
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

                                        {/* Warning */}
                                        <div className="flex items-start gap-3 p-3 rounded-xl bg-amber-500/10 border border-amber-500/20">
                                            <AlertTriangle className="w-4 h-4 text-amber-400 mt-0.5 shrink-0" />
                                            <p className="text-xs text-amber-400 leading-relaxed">
                                                Verifikasi keabsahan polis di luar sistem sebelum menyetujui. Poin akan langsung masuk ke rekening nasal setelah disetujui.
                                            </p>
                                        </div>

                                        {/* Actions */}
                                        <div className="flex gap-3 pt-2">
                                            <Button
                                                onClick={() => approveMutation.mutate(polis.id)}
                                                isLoading={approveMutation.isPending}
                                                className="flex-1 bg-emerald-600 hover:bg-emerald-500 text-white h-12 rounded-xl gap-2"
                                            >
                                                <CheckCircle className="w-4 h-4" />
                                                Setujui
                                            </Button>
                                            <Button
                                                onClick={() => setShowRejectModal(polis.id)}
                                                className="flex-1 bg-red-600/20 hover:bg-red-600/30 text-red-400 border border-red-500/30 h-12 rounded-xl gap-2"
                                            >
                                                <XCircle className="w-4 h-4" />
                                                Tolak
                                            </Button>
                                        </div>
                                    </div>
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </div>
                ))}
            </div>

            {/* Reject Modal */}
            <AnimatePresence>
                {showRejectModal !== null && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4"
                        onClick={() => setShowRejectModal(null)}
                    >
                        <motion.div
                            initial={{ scale: 0.95, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.95, opacity: 0 }}
                            className="bg-charcoal-900 border border-white/10 rounded-2xl p-6 w-full max-w-md"
                            onClick={(e) => e.stopPropagation()}
                        >
                            <div className="flex items-center gap-3 mb-4">
                                <div className="w-10 h-10 rounded-xl bg-red-500/20 flex items-center justify-center">
                                    <XCircle className="w-5 h-5 text-red-500" />
                                </div>
                                <div>
                                    <h3 className="font-bold text-white">Tolak Polis</h3>
                                    <p className="text-xs text-zinc-500">Berikan alasan penolakan</p>
                                </div>
                            </div>

                            <div className="space-y-4">
                                <div className="space-y-2">
                                    <label className="text-xs font-bold text-zinc-400 uppercase tracking-widest">Alasan Penolakan</label>
                                    <textarea
                                        value={rejectReason}
                                        onChange={(e) => setRejectReason(e.target.value)}
                                        placeholder="Contoh: Nomor polis tidak valid, premi tidak sesuai, dll..."
                                        className="w-full bg-charcoal-800/50 border border-white/10 rounded-xl p-4 text-white text-sm resize-none focus:outline-none focus:border-red-500/50 transition-colors"
                                        rows={4}
                                    />
                                </div>

                                <div className="flex gap-3">
                                    <Button
                                        onClick={() => setShowRejectModal(null)}
                                        className="flex-1 bg-charcoal-800 hover:bg-charcoal-700 text-white h-12 rounded-xl"
                                    >
                                        Batal
                                    </Button>
                                    <Button
                                        onClick={() => rejectMutation.mutate({ id: showRejectModal, reason: rejectReason })}
                                        isLoading={rejectMutation.isPending}
                                        disabled={!rejectReason.trim()}
                                        className="flex-1 bg-red-600 hover:bg-red-500 text-white h-12 rounded-xl disabled:opacity-50"
                                    >
                                        Konfirmasi Tolak
                                    </Button>
                                </div>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}