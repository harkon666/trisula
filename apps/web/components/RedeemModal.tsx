"use client";

import { useState } from "react";

type RewardItem = {
    id: number;
    name: string;
    pointsRequired: number;
    description?: string;
};

type RedeemModalProps = {
    isOpen: boolean;
    onClose: () => void;
    item: RewardItem;
    userId: string;
    onSuccess: (requestId: string) => void;
};

export default function RedeemModal({ isOpen, onClose, item, userId, onSuccess }: RedeemModalProps) {
    const [loading, setLoading] = useState(false);
    const [step, setStep] = useState<'confirm' | 'processing'>('confirm');
    const [error, setError] = useState<string | null>(null);

    if (!isOpen) return null;

    const handleRedeem = async () => {
        setLoading(true);
        setError(null);

        try {
            // 2. Call Backend
            setStep('processing');
            const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/v1/redeem`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    userId,
                    rewardId: item.id,
                    whatsappNumber: "62812345678" // Hardcoded for demo, normally from user profile input
                })
            });

            const data = await response.json();

            if (!data.success) {
                throw new Error(data.message || "Redemption failed");
            }

            // Success
            onSuccess(data.data.requestId);
            onClose();

        } catch (err: any) {
            console.error(err);
            setError(err.message || "Something went wrong");
            setStep('confirm');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
            <div className="w-full max-w-md bg-white/10 border border-white/20 rounded-3xl p-6 shadow-2xl backdrop-blur-xl relative overflow-hidden">
                {/* Decorative Elements */}
                <div className="absolute top-0 right-0 w-32 h-32 bg-amber-500/20 rounded-full blur-3xl -z-10" />
                <div className="absolute bottom-0 left-0 w-32 h-32 bg-blue-500/20 rounded-full blur-3xl -z-10" />

                <h2 className="text-2xl font-bold text-white mb-2">Confirm Redemption</h2>
                <p className="text-white/60 text-sm mb-6">
                    You are about to redeem <span className="text-amber-400 font-bold">{item.name}</span>
                </p>

                <div className="bg-black/20 rounded-xl p-4 mb-6 border border-white/5">
                    <div className="flex justify-between items-center">
                        <span className="text-white/40 text-sm">Cost</span>
                        <span className="text-amber-400 font-mono font-bold">{item.pointsRequired.toLocaleString()} Pts</span>
                    </div>
                </div>

                {error && (
                    <div className="mb-4 p-3 bg-red-500/20 border border-red-500/50 rounded-lg text-red-200 text-sm">
                        {error}
                    </div>
                )}

                <div className="flex space-x-3">
                    <button
                        onClick={onClose}
                        disabled={loading}
                        className="flex-1 px-4 py-3 rounded-xl bg-white/5 hover:bg-white/10 text-white font-medium transition disabled:opacity-50"
                    >
                        Cancel
                    </button>
                    <button
                        onClick={handleRedeem}
                        disabled={loading}
                        className="flex-1 px-4 py-3 rounded-xl bg-amber-500 hover:bg-amber-400 text-black font-bold transition disabled:opacity-50 flex items-center justify-center space-x-2"
                    >
                        {loading ? (
                            <>
                                <svg className="w-4 h-4 animate-spin" viewBox="0 0 24 24">
                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                                </svg>
                                <span>Processing...</span>
                            </>
                        ) : (
                            <span>Confirm & Pay</span>
                        )}
                    </button>
                </div>
            </div>
        </div>
    );
}
