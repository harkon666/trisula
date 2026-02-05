"use client";

import { useState } from "react";

interface RejectModalProps {
    requestId: string;
    itemName: string;
    adminWallet: string;
    onClose: () => void;
    onSuccess: () => void;
}

export default function RejectModal({ requestId, itemName, adminWallet, onClose, onSuccess }: RejectModalProps) {
    const [reason, setReason] = useState("");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    const handleReject = async () => {
        if (!reason.trim()) {
            setError("Alasan penolakan wajib diisi");
            return;
        }

        setLoading(true);
        setError("");

        try {
            const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000";
            const res = await fetch(`${apiUrl}/api/v1/admin/redeem/${requestId}`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    status: 'rejected',
                    adminWallet,
                    reason,
                }),
            });

            const json = await res.json();
            if (json.success) {
                onSuccess();
                onClose();
            } else {
                setError(json.message || "Gagal menolak permintaan");
            }
        } catch (err) {
            setError("Terjadi kesalahan sistem");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="bg-zinc-900 border border-white/10 rounded-3xl max-w-md w-full p-8 shadow-2xl">
                {/* Header */}
                <div className="flex items-center gap-3 mb-6">
                    <div className="w-12 h-12 bg-red-500/20 rounded-full flex items-center justify-center">
                        <span className="text-2xl">⚠️</span>
                    </div>
                    <div>
                        <h2 className="text-xl font-bold text-white">Tolak Permintaan</h2>
                        <p className="text-sm text-zinc-500">{itemName}</p>
                    </div>
                </div>

                {/* Form */}
                <div className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-zinc-400 mb-2">
                            Alasan Penolakan <span className="text-red-500">*</span>
                        </label>
                        <textarea
                            value={reason}
                            onChange={(e) => setReason(e.target.value)}
                            placeholder="Contoh: Stok habis, Data tidak valid, dll."
                            rows={3}
                            className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder:text-zinc-600 focus:border-red-500/50 focus:outline-none resize-none"
                        />
                    </div>

                    {error && (
                        <p className="text-red-400 text-sm bg-red-500/10 p-3 rounded-lg border border-red-500/20">
                            {error}
                        </p>
                    )}

                    <p className="text-xs text-zinc-600 italic">
                        *Poin nasabah akan dikembalikan secara otomatis setelah penolakan.
                    </p>
                </div>

                {/* Actions */}
                <div className="flex gap-3 mt-8">
                    <button
                        onClick={onClose}
                        disabled={loading}
                        className="flex-1 px-4 py-3 bg-zinc-800 hover:bg-zinc-700 text-white rounded-xl font-medium transition-colors"
                    >
                        Batal
                    </button>
                    <button
                        onClick={handleReject}
                        disabled={loading || !reason.trim()}
                        className="flex-1 px-4 py-3 bg-red-500 hover:bg-red-600 text-white rounded-xl font-bold transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {loading ? "Memproses..." : "Tolak Permintaan"}
                    </button>
                </div>
            </div>
        </div>
    );
}
