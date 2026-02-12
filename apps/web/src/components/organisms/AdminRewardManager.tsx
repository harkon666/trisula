"use client";

import { useState } from "react";
import { useAdminRewards, Reward, CreateRewardInput } from "@/src/hooks/useAdminRewards";
import {
    Plus,
    Gift,
    Trash2,
    Edit2,
    Eye,
    EyeOff,
    Sparkles,
    Loader2,
    ShieldAlert,
    X,
    CheckCircle2
} from "lucide-react";
import { toast } from "sonner";
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs));
}

export function AdminRewardManager() {
    const {
        rewards,
        isLoading,
        createReward,
        isCreating,
        updateReward,
        isUpdating,
        deleteReward,
        isDeleting
    } = useAdminRewards();

    const [isAddModalOpen, setIsAddModalOpen] = useState(false);
    const [editingReward, setEditingReward] = useState<Reward | null>(null);
    const [rewardFormData, setRewardFormData] = useState<CreateRewardInput>({
        title: "",
        description: "",
        requiredPoints: 0,
        isActive: true
    });

    const handleOpenAdd = () => {
        setRewardFormData({ title: "", description: "", requiredPoints: 0, isActive: true });
        setIsAddModalOpen(true);
    };

    const handleOpenEdit = (reward: Reward) => {
        setEditingReward(reward);
        setRewardFormData({
            title: reward.title,
            description: reward.description || "",
            requiredPoints: reward.requiredPoints,
            isActive: reward.isActive
        });
    };

    const handleSubmit = () => {
        if (!rewardFormData.title.trim() || rewardFormData.requiredPoints <= 0) {
            toast.error("Judul dan Poin minimal harus diisi dengan benar");
            return;
        }

        if (editingReward) {
            updateReward({ id: editingReward.id, data: rewardFormData }, {
                onSuccess: () => {
                    setEditingReward(null);
                    toast.success("Reward berhasil diperbarui!");
                }
            });
        } else {
            createReward(rewardFormData, {
                onSuccess: () => {
                    setIsAddModalOpen(false);
                    toast.success("Reward baru telah ditambahkan ke katalog!");
                }
            });
        }
    };

    const toggleStatus = (reward: Reward) => {
        updateReward({ id: reward.id, data: { isActive: !reward.isActive } });
    };

    const handleDelete = (id: number) => {
        if (window.confirm("Apakah Anda yakin ingin menghapus reward ini secara permanen?")) {
            deleteReward(id);
        }
    };

    return (
        <div className="space-y-6">
            {/* Header / Actions */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 p-8 rounded-3xl border border-white/10 bg-charcoal-900/40 backdrop-blur-md relative overflow-hidden">
                <div className="absolute top-0 right-0 w-32 h-32 bg-gold-metallic/5 blur-3xl rounded-full" />

                <div className="space-y-1 relative z-10">
                    <h2 className="text-2xl font-black text-white tracking-tight flex items-center gap-2">
                        Reward Catalog Management
                    </h2>
                    <p className="text-sm text-zinc-500">Kelola daftar layanan dan voucher eksklusif untuk Nasabah.</p>
                </div>

                <button
                    onClick={handleOpenAdd}
                    className="relative px-8 py-4 bg-gold-metallic text-charcoal-950 font-black rounded-2xl hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center gap-3 shadow-xl shadow-gold-metallic/20"
                >
                    <Plus className="w-5 h-5" />
                    <span>TAMBAH VOUCHER BARU</span>
                </button>
            </div>

            {/* Catalog Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {isLoading ? (
                    Array.from({ length: 3 }).map((_, i) => (
                        <div key={i} className="h-64 rounded-3xl bg-white/5 animate-pulse border border-white/10" />
                    ))
                ) : rewards?.length === 0 ? (
                    <div className="col-span-full py-20 text-center border border-dashed border-white/10 rounded-3xl bg-white/[0.02]">
                        <p className="text-zinc-500 italic">Katalog kosong. Silakan tambahkan reward pertama Anda.</p>
                    </div>
                ) : (
                    rewards?.map((reward) => (
                        <div
                            key={reward.id}
                            className={cn(
                                "group relative p-6 rounded-3xl border transition-all duration-300",
                                reward.isActive
                                    ? "bg-charcoal-900/40 border-white/10 hover:border-gold-metallic/30"
                                    : "bg-black/40 border-white/5 opacity-70 grayscale-[0.5]"
                            )}
                        >
                            <div className="flex justify-between items-start mb-4">
                                <div className={cn(
                                    "p-3 rounded-2xl",
                                    reward.isActive ? "bg-gold-metallic/10 text-gold-metallic" : "bg-white/5 text-zinc-500"
                                )}>
                                    <Gift className="w-6 h-6" />
                                </div>
                                <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                    <button
                                        onClick={() => handleOpenEdit(reward)}
                                        className="p-2 rounded-lg bg-white/5 text-zinc-400 hover:text-white transition-colors"
                                    >
                                        <Edit2 className="w-4 h-4" />
                                    </button>
                                    <button
                                        onClick={() => handleDelete(reward.id)}
                                        className="p-2 rounded-lg bg-red-500/10 text-red-500/50 hover:text-red-500 transition-colors"
                                    >
                                        <Trash2 className="w-4 h-4" />
                                    </button>
                                </div>
                            </div>

                            <div className="space-y-2">
                                <h3 className="text-lg font-bold text-white group-hover:text-gold-metallic transition-colors">
                                    {reward.title}
                                </h3>
                                <p className="text-sm text-zinc-500 line-clamp-2 h-10">
                                    {reward.description || "Tidak ada deskripsi."}
                                </p>
                            </div>

                            <div className="mt-6 flex items-center justify-between">
                                <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-gold-metallic/10 border border-gold-metallic/20">
                                    <Sparkles className="w-3.5 h-3.5 text-gold-metallic" />
                                    <span className="text-sm font-black text-gold-metallic">
                                        {reward.requiredPoints.toLocaleString('id-ID')}
                                    </span>
                                </div>

                                <button
                                    onClick={() => toggleStatus(reward)}
                                    className={cn(
                                        "flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-wider border transition-all",
                                        reward.isActive
                                            ? "bg-emerald-500/10 text-emerald-500 border-emerald-500/20"
                                            : "bg-zinc-800 text-zinc-500 border-zinc-700"
                                    )}
                                >
                                    {reward.isActive ? (
                                        <><Eye className="w-3" /> ACTIVE</>
                                    ) : (
                                        <><EyeOff className="w-3" /> INACTIVE</>
                                    )}
                                </button>
                            </div>
                        </div>
                    ))
                )}
            </div>

            {/* Modal Overlay (Simplified for brevity inside components) */}
            {(isAddModalOpen || editingReward) && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-6 bg-black/80 backdrop-blur-sm">
                    <div className="relative w-full max-w-lg p-8 rounded-3xl bg-charcoal-900 border border-gold-metallic/30 shadow-2xl shadow-gold-metallic/10 overflow-hidden">
                        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-gold-metallic to-transparent" />

                        <div className="flex items-center justify-between mb-8">
                            <h3 className="text-xl font-black text-white italic">
                                {editingReward ? "EDIT VOUCHER" : "TAMBAH VOUCHER BARU"}
                            </h3>
                            <button
                                onClick={() => { setIsAddModalOpen(false); setEditingReward(null); }}
                                className="p-2 rounded-xl text-zinc-500 hover:text-white hover:bg-white/5 transition-all"
                            >
                                <X className="w-6 h-6" />
                            </button>
                        </div>

                        <div className="space-y-6">
                            <div className="space-y-2">
                                <label className="text-xs font-black text-zinc-500 uppercase tracking-widest pl-1">Judul Reward</label>
                                <input
                                    type="text"
                                    placeholder="Contoh: Voucher Service Premium"
                                    value={rewardFormData.title}
                                    onChange={(e) => setRewardFormData({ ...rewardFormData, title: e.target.value })}
                                    className="w-full bg-charcoal-800/50 border border-white/5 rounded-2xl px-5 py-4 text-white placeholder:text-zinc-600 focus:outline-none focus:border-gold-metallic/50 transition-all"
                                />
                            </div>

                            <div className="space-y-2">
                                <label className="text-xs font-black text-zinc-500 uppercase tracking-widest pl-1">Deskripsi (Opsional)</label>
                                <textarea
                                    placeholder="Berikan detail layanan di sini..."
                                    value={rewardFormData.description}
                                    onChange={(e) => setRewardFormData({ ...rewardFormData, description: e.target.value })}
                                    className="w-full bg-charcoal-800/50 border border-white/5 rounded-2xl px-5 py-4 text-white placeholder:text-zinc-600 focus:outline-none focus:border-gold-metallic/50 transition-all min-h-[100px]"
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <label className="text-xs font-black text-zinc-500 uppercase tracking-widest pl-1">Minimal Poin</label>
                                    <div className="relative">
                                        <Sparkles className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gold-metallic" />
                                        <input
                                            type="number"
                                            placeholder="0"
                                            value={rewardFormData.requiredPoints || ""}
                                            onChange={(e) => setRewardFormData({ ...rewardFormData, requiredPoints: parseInt(e.target.value) || 0 })}
                                            className="w-full bg-charcoal-800/50 border border-white/5 rounded-2xl pl-12 pr-4 py-4 text-white placeholder:text-zinc-600 focus:outline-none focus:border-gold-metallic/50 transition-all"
                                        />
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <label className="text-xs font-black text-zinc-500 uppercase tracking-widest pl-1">Status Publik</label>
                                    <button
                                        onClick={() => setRewardFormData({ ...rewardFormData, isActive: !rewardFormData.isActive })}
                                        className={cn(
                                            "w-full px-5 py-4 rounded-2xl border font-bold text-sm transition-all flex items-center justify-center gap-2",
                                            rewardFormData.isActive
                                                ? "bg-emerald-500/10 text-emerald-500 border-emerald-500/20"
                                                : "bg-zinc-800 text-zinc-500 border-zinc-700"
                                        )}
                                    >
                                        {rewardFormData.isActive ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
                                        {rewardFormData.isActive ? "PUBLISHED" : "DRAFT"}
                                    </button>
                                </div>
                            </div>

                            <button
                                onClick={handleSubmit}
                                disabled={isCreating || isUpdating}
                                className="w-full h-16 bg-gold-metallic text-charcoal-950 font-black rounded-2xl hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center justify-center gap-3 shadow-xl shadow-gold-metallic/20 mt-4"
                            >
                                {(isCreating || isUpdating) ? (
                                    <Loader2 className="w-6 h-6 animate-spin" />
                                ) : (
                                    <CheckCircle2 className="w-6 h-6" />
                                )}
                                <span>{editingReward ? "SIMPAN PERUBAHAN" : "SIMPAN REWARD"}</span>
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
