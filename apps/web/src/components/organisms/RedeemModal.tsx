"use client";

import { createContext, useContext, useState, useRef, useEffect } from "react";
import { createPortal } from "react-dom";
import Image from "next/image";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import { X, Sparkles, Gem, ShieldCheck, CheckCircle2 } from "lucide-react";
import { Button } from "@/src/components/atoms";
import type { Reward } from "@/src/hooks/useRewardsCatalog";
import { RedeemSuccessCertificate } from "./RedeemSuccessCertificate";

// --- Context ---
interface RedeemContextType {
    isOpen: boolean;
    selectedReward: Reward | null;
    openModal: (reward: Reward) => void;
    closeModal: () => void;
}

const RedeemContext = createContext<RedeemContextType | null>(null);

export function useRedeem() {
    const ctx = useContext(RedeemContext);
    if (!ctx) throw new Error("Redeem sub-components must be used within Redeem.Modal");
    return ctx;
}

// --- Root: Modal Provider ---
function RedeemModalRoot({ children }: { children: React.ReactNode }) {
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

    // Body scroll lock — position:fixed approach to truly freeze background
    const hasBeenOpened = useRef(false);

    useEffect(() => {
        if (isOpen) {
            hasBeenOpened.current = true;
            const scrollY = window.scrollY;
            const scrollBarWidth = window.innerWidth - document.documentElement.clientWidth;

            document.documentElement.style.overflow = "hidden";
            document.body.style.overflow = "hidden";
            document.body.style.position = "fixed";
            document.body.style.top = `-${scrollY}px`;
            document.body.style.left = "0";
            document.body.style.right = "0";
            document.body.style.paddingRight = `${scrollBarWidth}px`;
        } else if (hasBeenOpened.current) {
            // Only unlock if we previously locked
            const scrollY = document.body.style.top;
            document.documentElement.style.overflow = "";
            document.body.style.overflow = "";
            document.body.style.position = "";
            document.body.style.top = "";
            document.body.style.left = "";
            document.body.style.right = "";
            document.body.style.paddingRight = "";
            window.scrollTo(0, parseInt(scrollY || "0") * -1);
        }
        return () => {
            if (hasBeenOpened.current) {
                const scrollY = document.body.style.top;
                document.documentElement.style.overflow = "";
                document.body.style.overflow = "";
                document.body.style.position = "";
                document.body.style.top = "";
                document.body.style.left = "";
                document.body.style.right = "";
                document.body.style.paddingRight = "";
                window.scrollTo(0, parseInt(scrollY || "0") * -1);
            }
        };
    }, [isOpen]);

    return (
        <RedeemContext.Provider value={{ isOpen, selectedReward, openModal, closeModal }}>
            {children}
        </RedeemContext.Provider>
    );
}

const Redeem = Object.assign(RedeemModalRoot, {
    Header: RedeemHeader,
    Content: RedeemContent,
    Action: RedeemAction,
    Overlay: RedeemOverlay,
});

export { Redeem };

function RedeemHeader() {
    const { closeModal } = useRedeem();

    return (
        <div className="flex items-center justify-between p-6 md:p-8 border-b border-gold-metallic/10 bg-gradient-to-r from-charcoal-deep to-royal-blue/20">
            <h2 className="text-2xl md:text-3xl font-serif text-gold-metallic flex items-center gap-3 tracking-tight">
                <Gem className="w-6 h-6 text-gold-metallic drop-shadow-[0_0_8px_rgba(212,175,55,0.4)]" />
                Konfirmasi Penukaran
            </h2>
            <button
                onClick={closeModal}
                className="p-2 hover:bg-white/10 rounded-full transition-colors text-zinc-400 hover:text-white"
            >
                <X className="w-6 h-6" />
            </button>
        </div>
    );
}

// --- Sub: Content ---
function RedeemContent({
    userPoints,
    view,
}: {
    userPoints: number;
    view: "confirm" | "success" | "error";
}) {
    const { selectedReward } = useRedeem();

    if (view === "error") {
        return (
            <div className="p-10 md:p-14 text-center space-y-6">
                <div className="w-24 h-24 bg-red-500/10 border border-red-500/30 rounded-full flex items-center justify-center mx-auto shadow-[0_0_30px_rgba(239,68,68,0.15)]">
                    <ShieldCheck className="w-12 h-12 text-red-500" />
                </div>
                <div className="space-y-2">
                    <h3 className="text-3xl font-serif text-white">Terjadi Gagal</h3>
                    <p className="text-zinc-400 text-sm max-w-[280px] mx-auto leading-relaxed">
                        Terjadi kesalahan saat memproses permintaan keistimewaan Anda. Silakan coba lagi nanti.
                    </p>
                </div>
            </div>
        );
    }

    if (!selectedReward) return null;

    const canAfford = userPoints >= selectedReward.requiredPoints;

    return (
        <div className="p-8 md:p-12 space-y-8 relative overflow-hidden">
            {/* Watermark Logo */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 opacity-[0.05] pointer-events-none select-none">
                <Image src="/icon.png" alt="Watermark" width={300} height={300} className="grayscale invert" />
            </div>

            {/* Reward Icon & Title */}
            <div className="relative z-10 space-y-6 text-center">
                <div className="w-28 h-28 mx-auto bg-gradient-to-br from-gold-metallic/20 to-royal-blue/20 rounded-2xl flex items-center justify-center border border-gold-metallic/30 shadow-[0_0_40px_rgba(212,175,55,0.1)]">
                    <Sparkles className="w-12 h-12 text-gold-metallic" />
                </div>
                <div className="space-y-2">
                    <h3 className="text-3xl md:text-4xl font-serif font-bold text-white tracking-tight">
                        {selectedReward.title}
                    </h3>
                    {selectedReward.description && (
                        <p className="text-zinc-400 text-sm md:text-base italic max-w-sm mx-auto leading-relaxed opacity-80">
                            {selectedReward.description}
                        </p>
                    )}
                </div>
            </div>

            {/* Details Grid */}
            <div className="relative z-10 grid grid-cols-1 gap-4 max-w-sm mx-auto">
                {/* Price Display */}
                <div className="bg-white/[0.03] p-6 rounded-2xl border border-white/5 backdrop-blur-sm text-center">
                    <p className="text-[10px] text-gold-metallic/40 uppercase font-black tracking-[0.3em] mb-2">
                        Harga Penukaran
                    </p>
                    <div className="flex items-center justify-center gap-2">
                        <span className="text-4xl font-black text-gold-metallic drop-shadow-[0_0_15px_rgba(212,175,55,0.3)]">
                            {selectedReward.requiredPoints.toLocaleString()}
                        </span>
                        <span className="text-xs text-gold-metallic/40 font-bold uppercase tracking-wider">PTS</span>
                    </div>
                </div>

                {/* Balance Status */}
                <div className="flex items-center justify-between px-2 pt-2 text-sm">
                    <span className="text-zinc-500 font-medium">Saldo Poin Anda:</span>
                    <span className={`font-black text-lg ${canAfford ? "text-gold-light" : "text-red-400"}`}>
                        {userPoints.toLocaleString()} <span className="text-[10px] opacity-40">PTS</span>
                    </span>
                </div>
            </div>

            {/* Insufficient Points Message */}
            {!canAfford && (
                <div className="relative z-10 mt-4 p-4 rounded-xl bg-red-500/5 border border-red-500/20 text-center">
                    <p className="text-xs text-red-400 font-medium italic">
                        "Mohon maaf, saldo Anda saat ini belum mencukupi untuk penukaran ini."
                    </p>
                </div>
            )}

            {/* Luxury Confirmation Text */}
            {canAfford && (
                <p className="relative z-10 text-center text-zinc-500 text-sm italic leading-relaxed pt-2">
                    "Apakah Anda ingin menukarkan poin untuk layanan eksklusif ini?"
                </p>
            )}
        </div>
    );
}

// --- Sub: Action ---
function RedeemAction({
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
    const { selectedReward, closeModal } = useRedeem();
    const canAfford = selectedReward ? userPoints >= selectedReward.requiredPoints : false;
    const shimmerRef = useRef<HTMLDivElement>(null);

    useGSAP(() => {
        if (canAfford && shimmerRef.current) {
            gsap.to(shimmerRef.current, {
                x: "400%",
                duration: 2.5,
                ease: "power2.inOut",
                repeat: -1,
                repeatDelay: 1.5
            });
        }
    }, { dependencies: [canAfford] });

    if (view === "error") {
        return (
            <div className="p-8 border-t border-white/5 bg-white/5 flex justify-center">
                <Button
                    variant="primary"
                    onClick={closeModal}
                    className="w-full max-w-xs bg-charcoal-700 hover:bg-charcoal-800 text-white"
                >
                    Kembali
                </Button>
            </div>
        );
    }

    if (view === "success") return null;

    return (
        <div className="p-8 md:p-10 border-t border-gold-metallic/10 bg-gradient-to-b from-transparent to-royal-blue/10 flex flex-col sm:flex-row items-center justify-center gap-4">
            <Button
                variant="ghost"
                onClick={closeModal}
                disabled={isLoading}
                className="w-full sm:w-auto text-zinc-500 hover:text-white"
            >
                Batalkan
            </Button>

            <button
                disabled={!canAfford || isLoading}
                onClick={onConfirm}
                className={`group relative overflow-hidden w-full sm:w-[240px] h-[56px] flex items-center justify-center rounded-sm font-black text-sm uppercase tracking-[0.2em] transition-all
                    ${canAfford && !isLoading
                        ? "bg-gold-metallic text-royal-blue shadow-[0_10px_30px_rgba(212,175,55,0.25)] hover:bg-white hover:scale-[1.02] active:scale-95"
                        : "bg-white/5 text-zinc-600 border border-white/5 cursor-not-allowed"
                    }`}
            >
                {/* Shimmer FX */}
                {canAfford && !isLoading && (
                    <div
                        ref={shimmerRef}
                        className="absolute inset-0 w-1/4 h-full bg-gradient-to-r from-transparent via-white/40 to-transparent skew-x-[-25deg] pointer-events-none -left-[50%]"
                    />
                )}

                {/* Loading State: Trident Indicator */}
                {isLoading ? (
                    <div className="flex items-center gap-3">
                        <div className="animate-[spin_2s_linear_infinite] [transform-style:preserve-3d]">
                            <svg className="w-6 h-6 text-royal-blue" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                                <path d="M12 2v20M5 10a7 7 0 0 0 14 0" />
                                <path d="M12 2l3 3-3-3-3 3 3-3z" />
                                <path d="M5 10V7l2-2-2 2zM19 10V7l-2-2 2 2z" />
                            </svg>
                        </div>
                        <span>Memproses...</span>
                    </div>
                ) : (
                    "Tukar Sekarang"
                )}
            </button>
        </div>
    );
}

// --- Overlay / Portal ---
function RedeemOverlay({
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
    const { isOpen, closeModal, selectedReward } = useRedeem();
    const [portalContainer, setPortalContainer] = useState<HTMLElement | null>(null);
    const modalRef = useRef<HTMLDivElement>(null);
    const scrollContainerRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        setPortalContainer(document.body);
    }, []);

    useGSAP(() => {
        if (isOpen && modalRef.current && view === "confirm") {
            gsap.fromTo(modalRef.current,
                { scale: 0.8, y: 50, opacity: 0 },
                { scale: 1, y: 0, opacity: 1, duration: 0.7, ease: "expo.out" }
            );
        }
    }, { dependencies: [isOpen, view] });

    if (!isOpen || !portalContainer) return null;

    // Cinematic Success View (The Golden Voucher)
    if (view === "success" && selectedReward) {
        return createPortal(
            <RedeemSuccessCertificate
                rewardName={selectedReward.title}
                onDone={closeModal}
            />,
            portalContainer
        );
    }

    // Forward wheel events into the scrollable content
    const handleOverlayWheel = (e: React.WheelEvent) => {
        e.stopPropagation();
        if (scrollContainerRef.current) {
            scrollContainerRef.current.scrollTop += e.deltaY;
        }
    };

    return createPortal(
        <div
            className="fixed inset-0 z-[100] flex items-center justify-center p-4"
            onClick={closeModal}
            onWheel={handleOverlayWheel}
        >
            {/* Backdrop */}
            <div className="absolute inset-0 bg-black/90 backdrop-blur-3xl animate-in fade-in duration-500" />

            {/* Modal Box */}
            <div
                ref={modalRef}
                className="relative w-full max-w-xl max-h-[90dvh] md:max-h-[92dvh] flex flex-col bg-gradient-to-br from-charcoal-deep to-royal-800 border-[1.5px] border-gold-metallic/40 rounded-sm overflow-hidden shadow-[0_0_60px_rgba(0,0,0,0.8),inset_0_0_30px_rgba(212,175,55,0.05)]"
                onClick={(e) => e.stopPropagation()}
            >
                <div ref={scrollContainerRef} className="overflow-y-auto flex-1 custom-scrollbar overscroll-contain">
                    <RedeemHeader />
                    <RedeemContent userPoints={userPoints} view={view} />
                </div>
                <RedeemAction
                    userPoints={userPoints}
                    view={view}
                    isLoading={isRedeemPending}
                    onConfirm={onConfirm}
                />

                {/* Decorative Corners */}
                <div className="absolute top-0 left-0 w-8 h-8 border-t-2 border-l-2 border-gold-metallic/20 pointer-events-none" />
                <div className="absolute top-0 right-0 w-8 h-8 border-t-2 border-r-2 border-gold-metallic/20 pointer-events-none" />
                <div className="absolute bottom-0 left-0 w-8 h-8 border-b-2 border-l-2 border-gold-metallic/20 pointer-events-none" />
                <div className="absolute bottom-0 right-0 w-8 h-8 border-b-2 border-r-2 border-gold-metallic/20 pointer-events-none" />
            </div>
        </div>,
        portalContainer
    );
}

// --- Export as Compound Component ---
// (Already exported above via Object.assign if needed, but let's be explicit)

