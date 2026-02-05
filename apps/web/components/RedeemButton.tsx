"use client";

import { useState } from "react";
import RedeemModal from "./RedeemModal";

type RedeemButtonProps = {
    item: {
        id: number;
        name: string;
        pointsRequired: number;
    };
    userId: string;
    disabled?: boolean;
    onSuccess?: (requestId: string) => void;
};

export default function RedeemButton({ item, userId, disabled, onSuccess }: RedeemButtonProps) {
    const [isModalOpen, setIsModalOpen] = useState(false);

    const handleSuccess = (requestId: string) => {
        if (onSuccess) onSuccess(requestId);
    };

    return (
        <>
            <button
                onClick={() => setIsModalOpen(true)}
                disabled={disabled}
                className="w-full py-3 px-6 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-black font-bold shadow-lg shadow-amber-500/20 active:scale-95 transition-all disabled:opacity-50 disabled:cursor-not-allowed group"
            >
                <div className="flex items-center justify-center space-x-2">
                    <span>Redeem for {item.pointsRequired.toLocaleString()} Pts</span>
                    <span className="group-hover:translate-x-1 transition-transform">→</span>
                </div>
            </button>

            <RedeemModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                item={item}
                userId={userId}
                onSuccess={handleSuccess}
            />
        </>
    );
}
