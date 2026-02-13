"use client";

import { useState } from "react";
import { useAdminRedeem, AdminRedeemRequest } from "@/src/hooks/useAdminRedeem";
import {
    Clock,
    CheckCircle2,
    XCircle,
    Loader2,
    Search,
    Filter,
    MessageCircle,
    MoreHorizontal,
    ArrowRightCircle,
    Sparkles
} from "lucide-react";
import { Button, Input } from "@/src/components/atoms";
import { format } from "date-fns";
import { id } from "date-fns/locale";
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs));
}

export function AdminRedeemTable() {
    const { requests, isLoading, updateStatus, isUpdating } = useAdminRedeem();
    const [activeTab, setActiveTab] = useState<"pending" | "ongoing" | "finished">("pending");
    const [searchTerm, setSearchTerm] = useState("");

    const filteredRequests = requests?.filter(req => {
        const matchesSearch =
            req.userName.toLowerCase().includes(searchTerm.toLowerCase()) ||
            req.itemName.toLowerCase().includes(searchTerm.toLowerCase());

        if (activeTab === "pending") return matchesSearch && req.status === "pending";
        if (activeTab === "ongoing") return matchesSearch && (req.status === "processing" || req.status === "ready");
        // API currently only returns pending/processing/ready for /redeem/pending
        // If we want finished, we might need a different endpoint, but for fulfillment, this is the queue.
        return false;
    }) || [];

    const handleReject = (id: string) => {
        const reason = window.prompt("Berikan alasan penolakan (poin nasabah akan dikembalikan):");
        if (reason === null) return; // Cancelled
        if (!reason.trim()) {
            alert("Alasan penolakan wajib diisi.");
            return;
        }
        updateStatus({ id, status: "rejected", reason });
    };

    const getStatusStyles = (status: string) => {
        switch (status) {
            case "pending": return "bg-amber-500/10 text-amber-500 border-amber-500/20";
            case "processing": return "bg-blue-500/10 text-blue-500 border-blue-500/20";
            case "ready": return "bg-emerald-500/10 text-emerald-500 border-emerald-500/20";
            case "completed": return "bg-green-500/10 text-green-500 border-green-500/20";
            case "rejected": return "bg-red-500/10 text-red-500 border-red-500/20";
            default: return "bg-zinc-500/10 text-zinc-500 border-zinc-500/20";
        }
    };

    return (
        <div className="space-y-6">
            {/* Header Actions */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="flex bg-charcoal-800/50 p-1 rounded-xl border border-white/5 w-fit">
                    {[
                        { id: "pending", label: "Menunggu", icon: Clock },
                        { id: "ongoing", label: "Diproses", icon: ArrowRightCircle },
                    ].map(tab => (
                        <Button
                            key={tab.id}
                            variant="ghost"
                            size="sm"
                            //@ts-ignore
                            onClick={() => setActiveTab(tab.id)}
                            className={cn(
                                "flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-bold transition-all h-auto",
                                activeTab === tab.id
                                    ? "bg-gold-metallic text-charcoal-950 shadow-lg shadow-gold-metallic/20 hover:text-charcoal-950"
                                    : "text-zinc-500 hover:text-white hover:bg-white/5"
                            )}
                        >
                            <tab.icon className="w-4 h-4" />
                            {tab.label}
                        </Button>
                    ))}
                </div>

                <Input
                    placeholder="Cari Nasabah atau Reward..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="bg-charcoal-800/50 border-white/5 rounded-xl text-sm w-full md:w-80 focus:border-gold-metallic/50 pl-10 h-10"
                    icon={<Search className="w-4 h-4 text-zinc-500 group-focus-within:text-gold-metallic" />}
                />
            </div>

            {/* Table Container */}
            <div className="relative overflow-hidden rounded-2xl border border-white/5 bg-charcoal-900/40 backdrop-blur-sm">
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="border-b border-white/5 bg-white/[0.02]">
                                <th className="px-6 py-4 text-xs font-bold text-zinc-500 uppercase tracking-widest">Nasabah</th>
                                <th className="px-6 py-4 text-xs font-bold text-zinc-500 uppercase tracking-widest">Reward</th>
                                <th className="px-6 py-4 text-xs font-bold text-zinc-500 uppercase tracking-widest text-center">Poin</th>
                                <th className="px-6 py-4 text-xs font-bold text-zinc-500 uppercase tracking-widest">Waktu</th>
                                <th className="px-6 py-4 text-xs font-bold text-zinc-500 uppercase tracking-widest">Status</th>
                                <th className="px-6 py-4 text-xs font-bold text-zinc-500 uppercase tracking-widest text-right">Aksi</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-white/5">
                            {isLoading ? (
                                Array.from({ length: 5 }).map((_, i) => (
                                    <tr key={i} className="animate-pulse">
                                        <td colSpan={6} className="px-6 py-8">
                                            <div className="h-4 bg-white/5 rounded w-full" />
                                        </td>
                                    </tr>
                                ))
                            ) : filteredRequests.length === 0 ? (
                                <tr>
                                    <td colSpan={6} className="px-6 py-20 text-center">
                                        <div className="flex flex-col items-center gap-3 text-zinc-500">
                                            <Filter className="w-10 h-10 opacity-20" />
                                            <p className="font-medium">Tidak ada data penukaran di kategori ini.</p>
                                        </div>
                                    </td>
                                </tr>
                            ) : (
                                filteredRequests.map((req) => (
                                    <tr key={req.id} className="hover:bg-white/[0.02] transition-colors group">
                                        <td className="px-6 py-4">
                                            <div className="flex flex-col">
                                                <span className="font-bold text-white group-hover:text-gold-metallic transition-colors">
                                                    {req.userName}
                                                </span>
                                                <span className="text-xs text-zinc-500 font-mono">{req.whatsapp}</span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className="text-sm text-zinc-300">{req.itemName}</span>
                                        </td>
                                        <td className="px-6 py-4 text-center">
                                            <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-gold-metallic/5 border border-gold-metallic/10">
                                                <Sparkles className="w-3 h-3 text-gold-metallic" />
                                                <span className="text-sm font-bold text-gold-metallic">
                                                    {req.pointsUsed.toLocaleString()}
                                                </span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 text-sm text-zinc-500 font-mono">
                                            {format(new Date(req.createdAt), "dd MMM yyyy, HH:mm", { locale: id })}
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-tighter border ${getStatusStyles(req.status)}`}>
                                                {req.status === 'pending' ? 'Tunggu' :
                                                    req.status === 'processing' ? 'Proses' :
                                                        req.status === 'ready' ? 'Siap' : req.status}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            <div className="flex items-center justify-end gap-2">
                                                {req.status === "pending" && (
                                                    <>
                                                        <Button
                                                            onClick={() => updateStatus({ id: req.id, status: "processing" })}
                                                            isLoading={isUpdating}
                                                            size="sm"
                                                            className="px-4 py-2 rounded-lg bg-gold-metallic/10 text-gold-metallic text-xs font-bold hover:bg-gold-metallic hover:text-charcoal-950 transition-all border border-gold-metallic/20 h-auto"
                                                        >
                                                            Proses
                                                        </Button>
                                                        <Button
                                                            onClick={() => handleReject(req.id)}
                                                            isLoading={isUpdating}
                                                            variant="danger"
                                                            size="sm"
                                                            className="px-4 py-2 rounded-lg bg-red-500/10 text-red-500 text-xs font-bold hover:bg-red-500 hover:text-white transition-all border border-red-500/20 h-auto"
                                                        >
                                                            Tolak
                                                        </Button>
                                                    </>
                                                )}
                                                {(req.status === "processing" || req.status === "ready") && (
                                                    <Button
                                                        onClick={() => updateStatus({ id: req.id, status: "completed" })}
                                                        isLoading={isUpdating}
                                                        size="sm"
                                                        className="px-4 py-2 rounded-lg bg-emerald-500/10 text-emerald-500 text-xs font-bold hover:bg-emerald-500 hover:text-white transition-all border border-emerald-500/20 h-auto"
                                                    >
                                                        Selesaikan
                                                    </Button>
                                                )}

                                                <Button variant="ghost" size="sm" className="p-2 rounded-lg hover:bg-white/5 text-zinc-500 hover:text-white transition-colors h-auto border-transparent">
                                                    <MoreHorizontal className="w-4 h-4" />
                                                </Button>
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Legend / Info */}
            <div className="flex items-center gap-6 px-4 py-3 rounded-xl bg-charcoal-900/40 border border-white/5 text-[10px] text-zinc-500 font-bold uppercase tracking-widest">
                <div className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-amber-500" /> Baru Masuk
                </div>
                <div className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-blue-500" /> Sedang Dikerjakan
                </div>
                <div className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-emerald-500" /> Selesai
                </div>
            </div>
        </div>
    );
}
