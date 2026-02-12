"use client";

import { useRef } from "react";
import { AnimatedCounter, Badge, Skeleton } from "@/src/components/atoms";
import { Crown, Sparkles } from "lucide-react";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";

// --- Types ---
interface GoldCardOverviewProps {
    fullName: string | null;
    pointsBalance: number;
    role?: string;
    isLoading?: boolean;
    children?: React.ReactNode;
}

// --- Compound Root ---
function GoldCardRoot({ fullName, pointsBalance, role, isLoading, children }: GoldCardOverviewProps) {
    const cardRef = useRef<HTMLDivElement>(null);

    useGSAP(() => {
        if (!cardRef.current || isLoading) return;

        // Subtle shimmer on the gold border
        gsap.to(cardRef.current, {
            boxShadow: "0 0 60px rgba(212,175,55,0.15), 0 0 120px rgba(0,35,102,0.1)",
            duration: 2,
            yoyo: true,
            repeat: -1,
            ease: "sine.inOut",
        });
    }, { scope: cardRef, dependencies: [isLoading] });

    if (isLoading) {
        return <GoldCardSkeleton />;
    }

    return (
        <div
            ref={cardRef}
            className="relative overflow-hidden rounded-3xl border border-gold-metallic/30 bg-gradient-to-br from-royal-blue via-royal-700 to-charcoal-deep p-8 md:p-10 shadow-2xl"
        >
            {/* Decorative orbs */}
            <div className="absolute -top-20 -right-20 w-72 h-72 bg-gold-metallic/8 blur-[100px] rounded-full pointer-events-none" />
            <div className="absolute -bottom-16 -left-16 w-56 h-56 bg-royal-blue/20 blur-[80px] rounded-full pointer-events-none" />

            {/* Crown watermark */}
            <div className="absolute top-6 right-8 opacity-[0.04] pointer-events-none">
                <Crown className="w-32 h-32 text-gold-metallic" strokeWidth={1} />
            </div>

            <div className="relative z-10 space-y-6">
                {/* User Info */}
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-gold-metallic/20 flex items-center justify-center">
                        <Sparkles className="w-5 h-5 text-gold-metallic" />
                    </div>
                    <div>
                        <p className="text-gold-light/80 text-xs font-bold uppercase tracking-[0.2em]">
                            Nasabah Trisula
                        </p>
                        <h2 className="text-white text-xl font-bold tracking-tight">
                            {fullName || "Member"}
                        </h2>
                    </div>
                    {role && (
                        <Badge variant="warning" className="ml-auto bg-gold-metallic/15 text-gold-metallic border-gold-metallic/25">
                            {role}
                        </Badge>
                    )}
                </div>

                {/* Balance */}
                <div>
                    <p className="text-white/40 text-[10px] font-bold uppercase tracking-[0.25em] mb-2">
                        Saldo Poin Anda
                    </p>
                    <div className="flex items-baseline gap-3">
                        <div className="text-5xl md:text-7xl font-black text-white tracking-tight">
                            <AnimatedCounter value={pointsBalance} duration={2.5} />
                        </div>
                        <span className="text-gold-metallic text-lg font-bold">PTS</span>
                    </div>
                </div>

                {/* Sub-components slot */}
                {children}
            </div>
        </div>
    );
}

// --- Sub: Skeleton ---
function GoldCardSkeleton() {
    return (
        <div className="relative overflow-hidden rounded-3xl border border-gold-metallic/10 bg-gradient-to-br from-royal-blue/50 via-royal-700/50 to-charcoal-deep p-8 md:p-10">
            {/* Pulsing gold accent */}
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-gold-metallic/30 to-transparent animate-pulse" />

            <div className="space-y-6">
                <div className="flex items-center gap-3">
                    <Skeleton className="w-10 h-10 rounded-full bg-gold-metallic/10" />
                    <div className="space-y-2">
                        <Skeleton className="h-3 w-24 bg-gold-metallic/10" />
                        <Skeleton className="h-5 w-40 bg-white/10" />
                    </div>
                </div>
                <div className="space-y-2">
                    <Skeleton className="h-3 w-20 bg-white/5" />
                    <Skeleton className="h-16 w-56 bg-white/10" />
                </div>
            </div>
        </div>
    );
}

// --- Sub: Balance (standalone usage) ---
function GoldCardBalance({ value }: { value: number }) {
    return (
        <div className="text-5xl font-black text-white">
            <AnimatedCounter value={value} duration={2} />
        </div>
    );
}

// --- Sub: UserInfo ---
function GoldCardUserInfo({ name, role }: { name: string; role?: string }) {
    return (
        <div className="flex items-center gap-2">
            <span className="text-white font-semibold">{name}</span>
            {role && <Badge variant="warning">{role}</Badge>}
        </div>
    );
}

// --- Export as Compound Component ---
export const GoldCardOverview = Object.assign(GoldCardRoot, {
    Balance: GoldCardBalance,
    UserInfo: GoldCardUserInfo,
    Skeleton: GoldCardSkeleton,
});
