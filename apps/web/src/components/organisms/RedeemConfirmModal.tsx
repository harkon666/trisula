"use client";

import { createContext, useContext, useState, useRef, useEffect } from "react";
import { createPortal } from "react-dom";
import gsap from "gsap";
import { Gift, X, Sparkles, CircleCheck, ShieldAlert } from "lucide-react";
import { Button } from "@/src/components/atoms";
import type { Reward } from "@/src/hooks/useRewardsCatalog";

// --- Context ---
interface RedeemConfirmContextType {
    isOpen: boolean;
    selectedReward: Reward | null;
    openModal: (reward: Reward) => void;
    closeModal: () => void;
}

const RedeemConfirmContext = createContext<RedeemConfirmContextType | null>(null);

function useRedeemConfirm() {
    const ctx = useContext(RedeemConfirmContext);
    if (!ctx) throw new Error("RedeemConfirm sub-components must be used within RedeemConfirm.Modal");
    return ctx;
}

// --- Root: Modal Provider ---
function RedeemConfirmModal({ children }: { children: React.ReactNode }) {
    const [isOpen, setIsOpen] = useState(false);
    const [selectedReward, setSelectedReward] = useState<Reward | null>(null);

    const openModal = (reward: Reward) => {
        setSelectedReward(reward);
        setIsOpen(true);
    };

    const closeModal = () => {
        setIsOpen(false);
        setTimeout(() => setSelectedReward(null), 300);
    };

    return (
        <RedeemConfirmContext.Provider value={{ isOpen, selectedReward, openModal, closeModal }}>
            {children}
        </RedeemConfirmContext.Provider>
    );
}

// --- Sub: Header ---
function RedeemConfirmHeader() {
    const { closeModal } = useRedeemConfirm();

    return (
        <div className="flex items-center justify-between p-6 border-b border-white/5 bg-white/5">
            <h2 className="text-xl font-bold text-white flex items-center gap-2">
                <Gift className="w-5 h-5 text-gold-metallic" />
                Konfirmasi Penukaran
            </h2>
            <button
                onClick={closeModal}
                className="p-2 hover:bg-white/10 rounded-full transition-colors text-zinc-400 hover:text-white"
            >
                <X className="w-5 h-5" />
            </button>
        </div>
    );
}

// --- Sub: Content ---
function RedeemConfirmContent({
    userPoints,
    view,
}: {
    userPoints: number;
    view: "confirm" | "success" | "error";
}) {
    const { selectedReward } = useRedeemConfirm();

    if (view === "success") {
        return (
            <div className="p-8 text-center">
                <div className="w-20 h-20 bg-emerald-500/20 rounded-full flex items-center justify-center mx-auto mb-6">
                    <CircleCheck className="w-10 h-10 text-emerald-500 animate-bounce" />
                </div>
                <h3 className="text-2xl font-bold text-white mb-2">Berhasil!</h3>
                <p className="text-zinc-400">
                    Permintaan penukaran reward Anda sedang diproses. Cek status di dashboard.
                </p>
            </div>
        );
    }

    if (view === "error") {
        return (
            <div className="p-8 text-center">
                <div className="w-20 h-20 bg-red-500/20 rounded-full flex items-center justify-center mx-auto mb-6">
                    <ShieldAlert className="w-10 h-10 text-red-500" />
                </div>
                <h3 className="text-2xl font-bold text-white mb-2">Gagal!</h3>
                <p className="text-zinc-400">
                    Terjadi kesalahan saat memproses permintaan. Silakan coba lagi.
                </p>
            </div>
        );
    }

    if (!selectedReward) return null;

    const canAfford = userPoints >= selectedReward.requiredPoints;

    return (
        <div className="p-6 space-y-6">
            {/* Icon */}
            <div className="w-24 h-24 mx-auto bg-gradient-to-br from-gold-metallic/15 to-gold-dark/5 rounded-2xl flex items-center justify-center border border-gold-metallic/25">
                <Sparkles className="w-10 h-10 text-gold-metallic" />
            </div>

            {/* Info */}
            <div className="text-center">
                <h3 className="text-2xl font-bold text-white">{selectedReward.title}</h3>
                {selectedReward.description && (
                    <p className="text-zinc-400 mt-2 text-sm">{selectedReward.description}</p>
                )}
            </div>

            {/* Points Cost */}
            <div className="bg-white/5 p-4 rounded-xl border border-white/5 text-center">
                <p className="text-[10px] text-zinc-500 uppercase font-bold tracking-[0.2em] mb-1">
                    Harga Tukar
                </p>
                <p className="text-3xl font-black text-gold-metallic">
                    {selectedReward.requiredPoints.toLocaleString()}{" "}
                    <span className="text-sm text-gold-metallic/40">PTS</span>
                </p>
            </div>

            {/* Balance Info */}
            <div className="flex items-center justify-between text-sm px-1">
                <span className="text-zinc-500">Saldo Anda</span>
                <span className={`font-bold ${canAfford ? "text-emerald-400" : "text-red-400"}`}>
                    {userPoints.toLocaleString()} PTS
                </span>
            </div>

            {/* Confirmation Message */}
            <p className="text-center text-zinc-400 text-sm italic leading-relaxed">
                "Apakah Anda ingin menukarkan poin untuk layanan eksklusif ini?"
            </p>
        </div>
    );
}

// --- Sub: Action ---
function RedeemConfirmAction({
    userPoints,
    view,
    isLoading,
    onConfirm,
}: {
    userPoints: number;
    view: "confirm" | "success" | "error";
    isLoading: boolean;
    onConfirm: () => void;
}) {
    const { selectedReward, closeModal } = useRedeemConfirm();
    const canAfford = selectedReward ? userPoints >= selectedReward.requiredPoints : false;

    if (view === "success" || view === "error") {
        return (
            <div className="p-6 border-t border-white/5 bg-white/5 flex justify-end">
                <Button variant="primary" onClick={closeModal}>Selesai</Button>
            </div>
        );
    }

    return (
        <div className="p-6 border-t border-white/5 bg-white/5 flex justify-end gap-3">
            <Button variant="ghost" onClick={closeModal} disabled={isLoading}>
                Batal
            </Button>
            <div
                className="relative"
                title={!canAfford ? "Poin Anda belum mencukupi untuk layanan ini" : undefined}
            >
                <Button
                    variant="primary"
                    onClick={onConfirm}
                    isLoading={isLoading}
                    disabled={!canAfford || isLoading}
                >
                    Tukar Sekarang
                </Button>
            </div>
        </div>
    );
}

import { RedeemSuccessCertificate } from "./RedeemSuccessCertificate";

// --- Overlay / Portal --- (The actual rendered modal)
function RedeemConfirmOverlay({
    userPoints,
    isRedeemPending,
    onConfirm,
    view,
}: {
    userPoints: number;
    isRedeemPending: boolean;
    onConfirm: () => void;
    view: "confirm" | "success" | "error";
}) {
    const { isOpen, closeModal, selectedReward } = useRedeemConfirm();
    const [portalContainer, setPortalContainer] = useState<HTMLElement | null>(null);
    const modalRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        setPortalContainer(document.body);
    }, []);

    useEffect(() => {
        if (isOpen && modalRef.current && view === "confirm") {
            gsap.from(modalRef.current, {
                scale: 0.8,
                opacity: 0,
                duration: 0.4,
                ease: "back.out(1.7)",
            });
        }
    }, [isOpen, view]);

    if (!isOpen || !portalContainer) return null;

    // Cinematic Success View
    if (view === "success" && selectedReward) {
        return createPortal(
            <RedeemSuccessCertificate
                rewardName={selectedReward.title}
                onDone={closeModal}
            />,
            portalContainer
        );
    }

    return createPortal(
        <div
            className="fixed inset-0 z-[100] flex items-center justify-center p-4"
            onClick={closeModal}
        >
            {/* Backdrop */}
            <div className="absolute inset-0 bg-black/80 backdrop-blur-md" />

            {/* Modal Box */}
            <div
                ref={modalRef}
                className="relative w-full max-w-lg max-h-[90dvh] flex flex-col bg-midnight-950/95 border border-white/10 rounded-3xl overflow-hidden shadow-2xl"
                onClick={(e) => e.stopPropagation()}
            >
                <div className="overflow-y-auto flex-1 custom-scrollbar">
                    <RedeemConfirmHeader />
                    <RedeemConfirmContent userPoints={userPoints} view={view} />
                </div>
                <RedeemConfirmAction
                    userPoints={userPoints}
                    view={view}
                    isLoading={isRedeemPending}
                    onConfirm={onConfirm}
                />
            </div>
        </div>,
        portalContainer
    );
}

// --- Export as Compound Component ---
export const RedeemConfirm = Object.assign(RedeemConfirmModal, {
    Header: RedeemConfirmHeader,
    Content: RedeemConfirmContent,
    Action: RedeemConfirmAction,
    Overlay: RedeemConfirmOverlay,
});

// Re-export hook for external access
export { useRedeemConfirm };
