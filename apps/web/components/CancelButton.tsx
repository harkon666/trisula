"use client";

import { useState } from "react";

interface CancelButtonProps {
    requestId: string;
    userId: string;
    status: string;
    onSuccess: () => void;
}

export default function CancelButton({ requestId, userId, status, onSuccess }: CancelButtonProps) {
    const [loading, setLoading] = useState(false);
    const [showConfirm, setShowConfirm] = useState(false);

    // Only show for cancellable statuses
    const CANCELLABLE = ['pending', 'processing'];
    if (!CANCELLABLE.includes(status)) {
        return null;
    }

    const handleCancel = async () => {
        setLoading(true);
        try {
            const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000";
            const res = await fetch(`${apiUrl}/api/v1/redeem/${requestId}/cancel`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ userId }),
            });

            const json = await res.json();
            if (json.success) {
                onSuccess();
            } else {
                alert(json.message || "Gagal membatalkan pesanan");
            }
        } catch (error) {
            alert("Terjadi kesalahan sistem");
        } finally {
            setLoading(false);
            setShowConfirm(false);
        }
    };

    if (showConfirm) {
        return (
            <div className="flex items-center gap-2">
                <span className="text-xs text-zinc-400">Yakin batalkan?</span>
                <button
                    onClick={handleCancel}
                    disabled={loading}
                    className="px-3 py-1 bg-red-500/20 text-red-400 hover:bg-red-500/30 rounded-lg text-xs font-bold transition-colors disabled:opacity-50"
                >
                    {loading ? "Memproses..." : "Ya, Batalkan"}
                </button>
                <button
                    onClick={() => setShowConfirm(false)}
                    className="px-3 py-1 bg-zinc-700 text-zinc-300 hover:bg-zinc-600 rounded-lg text-xs transition-colors"
                >
                    Tidak
                </button>
            </div>
        );
    }

    return (
        <button
            onClick={() => setShowConfirm(true)}
            className="px-4 py-2 bg-red-500/10 border border-red-500/30 text-red-400 hover:bg-red-500/20 rounded-xl text-sm font-medium transition-all flex items-center gap-2"
        >
            <span>✕</span>
            Batalkan Pesanan
        </button>
    );
}
