"use client";

import { useMemo } from "react";

type TrackingStep = {
    id: string;
    label: string;
    icon: string;
    active: boolean;
    completed: boolean;
};

type StatusTrackerProps = {
    status: 'pending' | 'processing' | 'ready' | 'completed' | 'cancelled' | 'rejected';
    txHash?: string | null;
    updatedAt: string;
    rejectedReason?: string | null;
};

export default function StatusTracker({ status, txHash, updatedAt, rejectedReason }: StatusTrackerProps) {
    const steps = useMemo(() => {
        const allSteps = [
            { id: 'pending', label: 'Requested', icon: '📝' },
            { id: 'processing', label: 'Processing', icon: '⚙️' },
            { id: 'ready', label: 'Ready', icon: '🎁' },
            { id: 'completed', label: 'Delivered', icon: '✅' }
        ];

        const currentIndex = allSteps.findIndex(s => s.id === status) || 0;

        // Handle cancelled/rejected as special states
        if (status === 'cancelled' || status === 'rejected') {
            return [];
        }

        return allSteps.map((step, index) => ({
            ...step,
            completed: index <= currentIndex,
            active: index === currentIndex
        }));
    }, [status]);

    if (status === 'cancelled') {
        return (
            <div className="p-6 bg-zinc-800/50 border border-zinc-700 rounded-xl text-center">
                <span className="text-3xl block mb-3">🚫</span>
                <p className="text-zinc-300 font-medium">Pesanan Dibatalkan</p>
                <p className="text-sm text-zinc-500 mt-2">
                    Pembatalan berhasil. Poin telah dikembalikan ke saldo Anda.
                </p>
            </div>
        );
    }

    if (status === 'rejected') {
        return (
            <div className="p-6 bg-red-500/10 border border-red-500/20 rounded-xl text-center">
                <span className="text-3xl block mb-3">😔</span>
                <p className="text-red-300 font-medium">Mohon Maaf, Permintaan Ditolak</p>
                <p className="text-sm text-red-400/70 mt-2">
                    Permintaan Anda belum bisa kami penuhi saat ini. Poin telah dikembalikan.
                </p>
                {rejectedReason && (
                    <p className="text-xs text-red-500/60 mt-3 bg-red-500/10 p-2 rounded-lg inline-block">
                        Alasan: {rejectedReason}
                    </p>
                )}
            </div>
        );
    }

    return (
        <div className="w-full">
            <div className="flex justify-between relative mb-8">
                {/* Connecting Line */}
                <div className="absolute top-1/2 left-0 w-full h-1 bg-white/10 -translate-y-1/2 rounded-full -z-10" />
                <div
                    className="absolute top-1/2 left-0 h-1 bg-amber-500 -translate-y-1/2 rounded-full -z-10 transition-all duration-500"
                    style={{ width: `${(steps.filter(s => s.completed).length - 1) / (steps.length - 1) * 100}%` }}
                />

                {steps.map((step) => (
                    <div key={step.id} className="flex flex-col items-center group relative cursor-help">
                        {/* Circle */}
                        <div className={`w-10 h-10 rounded-full flex items-center justify-center border-2 transition-all duration-300 z-10
                            ${step.completed
                                ? 'bg-amber-500 border-amber-500 text-black shadow-[0_0_15px_rgba(245,158,11,0.5)]'
                                : 'bg-gray-900 border-white/10 text-white/20'}`
                        }>
                            <span className="text-lg">{step.icon}</span>
                        </div>

                        {/* Label */}
                        <p className={`absolute top-12 text-xs font-medium whitespace-nowrap transition-colors
                            ${step.active ? 'text-amber-400' : step.completed ? 'text-white/80' : 'text-white/20'}`
                        }>
                            {step.label}
                        </p>
                    </div>
                ))}
            </div>

            {/* Info Card */}
            <div className="bg-white/5 border border-white/10 rounded-xl p-4 mt-6">
                <div className="flex justify-between items-center text-sm">
                    <span className="text-white/40">Last Update</span>
                    <span className="text-white/60">{new Date(updatedAt).toLocaleString()}</span>
                </div>
                {txHash && (
                    <div className="flex justify-between items-center text-sm mt-2 pt-2 border-t border-white/5">
                        <span className="text-white/40">On-chain Proof</span>
                        <a
                            href={`https://sepolia.basescan.org/tx/${txHash}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-amber-500 hover:text-amber-400 underline truncate max-w-[200px]"
                        >
                            {txHash.substring(0, 10)}...{txHash.substring(txHash.length - 8)}
                        </a>
                    </div>
                )}
            </div>
        </div>
    );
}
