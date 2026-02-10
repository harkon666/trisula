"use client";

import React, { createContext, useContext, useState, ReactNode } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Button, Card, Input } from "@/src/components/atoms";
import api from "@/src/lib/api-client";
import { toast } from "sonner";

interface RejectContextType {
    isOpen: boolean;
    requestId: string;
    itemName: string;
    adminId: string;
    reason: string;
    setReason: (val: string) => void;
    onClose: () => void;
    handleReject: () => void;
    isLoading: boolean;
}

const RejectContext = createContext<RejectContextType | null>(null);

function useReject() {
    const context = useContext(RejectContext);
    if (!context) throw new Error("useReject must be used within a RejectModal");
    return context;
}

export function RejectModal({
    requestId,
    itemName,
    adminId,
    isOpen,
    onClose,
    onSuccess
}: {
    requestId: string;
    itemName: string;
    adminId: string;
    isOpen: boolean;
    onClose: () => void;
    onSuccess: () => void;
}) {
    const [reason, setReason] = useState("");
    const queryClient = useQueryClient();

    const mutation = useMutation({
        mutationFn: async () => {
            return api.patch(`/v1/admin/redeem/${requestId}`, {
                status: 'rejected',
                adminId,
                reason,
            });
        },
        onSuccess: () => {
            toast.success("Permintaan berhasil ditolak");
            onSuccess();
            onClose();
        },
        onError: (err: any) => {
            toast.error(err.response?.data?.message || "Gagal menolak permintaan");
        }
    });

    const handleReject = () => {
        if (!reason.trim()) {
            toast.error("Alasan penolakan wajib diisi");
            return;
        }
        mutation.mutate();
    };

    if (!isOpen) return null;

    return (
        <RejectContext.Provider value={{
            isOpen, requestId, itemName, adminId, reason, setReason, onClose, handleReject,
            isLoading: mutation.isPending
        }}>
            <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-in fade-in duration-200">
                <Card variant="solid" className="max-w-md w-full p-8 shadow-2xl animate-in zoom-in-95 duration-200">
                    <RejectModal.Header />
                    <RejectModal.Form />
                    <RejectModal.Actions />
                </Card>
            </div>
        </RejectContext.Provider>
    );
}

RejectModal.Header = function Header() {
    const { itemName } = useReject();
    return (
        <div className="flex items-center gap-3 mb-6">
            <div className="w-12 h-12 bg-red-500/20 rounded-full flex items-center justify-center">
                <span className="text-2xl">⚠️</span>
            </div>
            <div>
                <h2 className="text-xl font-bold text-white">Tolak Permintaan</h2>
                <p className="text-sm text-zinc-500">{itemName}</p>
            </div>
        </div>
    );
};

RejectModal.Form = function Form() {
    const { reason, setReason } = useReject();
    return (
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
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder:text-zinc-600 focus:border-red-500/50 focus:outline-none resize-none transition-all"
                />
            </div>
            <p className="text-xs text-zinc-600 italic">
                *Poin nasabah akan dikembalikan secara otomatis setelah penolakan.
            </p>
        </div>
    );
};

RejectModal.Actions = function Actions() {
    const { onClose, handleReject, isLoading, reason } = useReject();
    return (
        <div className="flex gap-3 mt-8">
            <Button variant="secondary" className="flex-1" onClick={onClose} disabled={isLoading}>
                Batal
            </Button>
            <Button variant="danger" className="flex-1" onClick={handleReject} isLoading={isLoading} disabled={!reason.trim()}>
                Tolak Permintaan
            </Button>
        </div>
    );
};
