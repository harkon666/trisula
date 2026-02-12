"use client";

import { useRef, useState, useCallback } from "react";
import RoleGuard from "@/src/components/auth/RoleGuard";
import { NasabahNavbar } from "@/src/components/organisms/NasabahNavbar";
import { RewardGrid } from "@/src/components/organisms/RewardGrid";
import { Redeem, useRedeem } from "@/src/components/organisms/RedeemModal";
import { useRewardsCatalog, type Reward } from "@/src/hooks/useRewardsCatalog";
import { useNasabahDashboard } from "@/src/hooks/useNasabahDashboard";
import { ArrowLeft, Crown } from "lucide-react";
import Link from "next/link";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";

export default function RewardsPage() {
    return (
        <RoleGuard allowedRoles={["nasabah"]}>
            <Redeem>
                <RewardsContent />
            </Redeem>
        </RoleGuard>
    );
}

function RewardsContent() {
    const { rewards, isRewardsLoading, redeemReward, isRedeemPending, resetRedeem } = useRewardsCatalog();
    const { profile } = useNasabahDashboard();
    const { openModal, selectedReward } = useRedeem();

    const userPoints = profile?.points ?? 0;

    const containerRef = useRef<HTMLDivElement>(null);
    const navRef = useRef<HTMLDivElement>(null);
    const headerRef = useRef<HTMLDivElement>(null);
    const gridWrapRef = useRef<HTMLDivElement>(null);

    const [modalView, setModalView] = useState<"confirm" | "success" | "error">("confirm");

    // Orchestrated GSAP Timeline
    useGSAP(() => {
        if (!containerRef.current) return;

        const tl = gsap.timeline({ defaults: { ease: "power3.out" } });

        if (navRef.current) {
            tl.from(navRef.current, { y: -80, opacity: 0, duration: 0.6 });
        }

        if (headerRef.current) {
            tl.from(headerRef.current, { y: 30, opacity: 0, duration: 0.7 }, "-=0.2");
        }

        if (gridWrapRef.current) {
            tl.from(gridWrapRef.current, { opacity: 0, duration: 0.5 }, "-=0.3");
        }
    }, { scope: containerRef });

    const handleSelectReward = useCallback((reward: Reward) => {
        setModalView("confirm");
        resetRedeem();
        openModal(reward);
    }, [openModal, resetRedeem]);

    const handleConfirm = useCallback(() => {
        if (!selectedReward) return;
        redeemReward(selectedReward.id, {
            onSuccess: () => setModalView("success"),
            onError: () => setModalView("error"),
        });
    }, [selectedReward, redeemReward]);

    return (
        <div ref={containerRef} className="min-h-screen bg-charcoal-deep text-white relative overflow-hidden">
            {/* Background ambient glow */}
            <div className="fixed inset-0 pointer-events-none">
                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[400px] bg-royal-blue/8 blur-[150px] rounded-full" />
                <div className="absolute bottom-0 right-0 w-[500px] h-[300px] bg-gold-metallic/5 blur-[120px] rounded-full" />
            </div>

            {/* Navbar */}
            <div ref={navRef} className="relative z-50">
                <NasabahNavbar />
            </div>

            {/* Main Content */}
            <main className="relative z-10 max-w-6xl mx-auto px-6 pt-28 pb-16">
                {/* Header */}
                <div ref={headerRef} className="mb-10">
                    <Link
                        href="/dashboard/nasabah"
                        className="inline-flex items-center gap-2 text-zinc-500 hover:text-gold-metallic text-sm font-medium mb-6 transition-colors group"
                    >
                        <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
                        Kembali ke Dashboard
                    </Link>

                    <div className="flex items-center gap-4 mb-2">
                        <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-gold-metallic/15 to-gold-dark/10 border border-gold-metallic/20 flex items-center justify-center">
                            <Crown className="w-6 h-6 text-gold-metallic" />
                        </div>
                        <div>
                            <h1 className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-gold-metallic via-gold-light to-gold-metallic bg-clip-text text-transparent tracking-tight">
                                Reward Center
                            </h1>
                            <p className="text-zinc-500 text-sm mt-1">
                                Tukarkan poin Anda untuk layanan eksklusif
                            </p>
                        </div>
                    </div>

                    {/* Balance pill */}
                    <div className="mt-6 inline-flex items-center gap-2 bg-white/5 border border-white/5 rounded-full px-5 py-2.5">
                        <span className="text-xs text-zinc-500 font-medium">Saldo Anda:</span>
                        <span className="text-lg font-black text-gold-metallic">
                            {userPoints.toLocaleString()}
                        </span>
                        <span className="text-xs text-gold-metallic/40 font-bold">PTS</span>
                    </div>
                </div>

                {/* Reward Grid */}
                <div ref={gridWrapRef}>
                    <RewardGrid
                        rewards={rewards}
                        isLoading={isRewardsLoading}
                        userPoints={userPoints}
                        onSelectReward={handleSelectReward}
                    />
                </div>
            </main>

            {/* Redeem Confirmation Modal Overlay */}
            <Redeem.Overlay
                userPoints={userPoints}
                isRedeemPending={isRedeemPending}
                onConfirm={handleConfirm}
                view={modalView}
            />
        </div>
    );
}
