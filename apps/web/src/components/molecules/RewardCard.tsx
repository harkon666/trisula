"use client";

import { useRef } from "react";
import { Sparkles } from "lucide-react";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import type { Reward } from "@/src/hooks/useRewardsCatalog";

interface RewardCardProps {
    reward: Reward;
    userPoints: number;
    onSelect: (reward: Reward) => void;
}

export function RewardCard({ reward, userPoints, onSelect }: RewardCardProps) {
    const cardRef = useRef<HTMLDivElement>(null);
    const canAfford = userPoints >= reward.requiredPoints;

    // GSAP hover effect (CSS-only animation → useGSAP is fine)
    useGSAP(() => {
        if (!cardRef.current) return;
        const card = cardRef.current;

        const onEnter = () => {
            gsap.to(card, {
                scale: 1.03,
                boxShadow: "0 0 40px rgba(212,175,55,0.15), 0 20px 60px rgba(0,0,0,0.3)",
                borderColor: "rgba(212,175,55,0.4)",
                duration: 0.3,
                ease: "power2.out",
            });
        };

        const onLeave = () => {
            gsap.to(card, {
                scale: 1,
                boxShadow: "0 0 0px rgba(212,175,55,0), 0 4px 20px rgba(0,0,0,0.2)",
                borderColor: "rgba(212,175,55,0.12)",
                duration: 0.3,
                ease: "power2.inOut",
            });
        };

        card.addEventListener("mouseenter", onEnter);
        card.addEventListener("mouseleave", onLeave);

        return () => {
            card.removeEventListener("mouseenter", onEnter);
            card.removeEventListener("mouseleave", onLeave);
        };
    }, { scope: cardRef });

    return (
        <div
            ref={cardRef}
            onClick={() => canAfford && onSelect(reward)}
            className={`relative overflow-hidden rounded-2xl border bg-gradient-to-br from-charcoal-800 to-charcoal-deep p-6 transition-all
                ${canAfford
                    ? "border-gold-metallic/12 cursor-pointer"
                    : "border-white/5 opacity-60 cursor-not-allowed"
                }`}
            title={!canAfford ? "Poin Anda belum mencukupi untuk layanan ini" : undefined}
        >
            {/* Decorative glow */}
            <div className="absolute -top-10 -right-10 w-32 h-32 bg-gold-metallic/5 blur-[60px] rounded-full pointer-events-none" />

            {/* Icon */}
            <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-gold-metallic/15 to-gold-dark/10 border border-gold-metallic/20 flex items-center justify-center mb-5">
                <Sparkles className="w-6 h-6 text-gold-metallic" />
            </div>

            {/* Title & Description */}
            <h3 className="text-lg font-bold text-white mb-2 tracking-tight">
                {reward.title}
            </h3>
            {reward.description && (
                <p className="text-sm text-zinc-500 line-clamp-2 mb-5 leading-relaxed">
                    {reward.description}
                </p>
            )}

            {/* Points Cost */}
            <div className="flex items-center justify-between mt-auto pt-4 border-t border-white/5">
                <div className="flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-gold-metallic/70" />
                    <span className="text-2xl font-black text-gold-metallic tracking-tight">
                        {reward.requiredPoints.toLocaleString()}
                    </span>
                    <span className="text-xs font-bold text-gold-metallic/40 uppercase tracking-wider">
                        PTS
                    </span>
                </div>

                {!canAfford && (
                    <span className="text-[10px] font-bold text-red-400/70 uppercase tracking-wider">
                        Poin Kurang
                    </span>
                )}
            </div>
        </div>
    );
}

// --- Skeleton ---
export function RewardCardSkeleton() {
    return (
        <div className="rounded-2xl border border-white/5 bg-charcoal-800/50 p-6 space-y-5 animate-pulse">
            <div className="w-14 h-14 rounded-xl bg-white/5" />
            <div className="space-y-2">
                <div className="h-5 w-2/3 rounded bg-white/5" />
                <div className="h-4 w-full rounded bg-white/5" />
            </div>
            <div className="pt-4 border-t border-white/5">
                <div className="h-7 w-1/3 rounded bg-gold-metallic/5" />
            </div>
        </div>
    );
}
