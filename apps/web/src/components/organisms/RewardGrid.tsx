"use client";

import { useRef } from "react";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import { RewardCard, RewardCardSkeleton } from "@/src/components/molecules/RewardCard";
import { PackageOpen } from "lucide-react";
import type { Reward } from "@/src/hooks/useRewardsCatalog";

interface RewardGridProps {
    rewards: Reward[] | undefined;
    isLoading: boolean;
    userPoints: number;
    onSelectReward: (reward: Reward) => void;
}

export function RewardGrid({ rewards, isLoading, userPoints, onSelectReward }: RewardGridProps) {
    const gridRef = useRef<HTMLDivElement>(null);

    // GSAP Stagger animation on cards
    useGSAP(() => {
        if (!gridRef.current || isLoading || !rewards?.length) return;

        const cards = gridRef.current.querySelectorAll("[data-reward-card]");
        if (!cards.length) return;

        gsap.from(cards, {
            y: 40,
            opacity: 0,
            duration: 0.6,
            stagger: 0.1,
            ease: "power3.out",
            clearProps: "all",
        });
    }, { scope: gridRef, dependencies: [isLoading, rewards] });

    // Skeleton loading state
    if (isLoading) {
        return (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                {Array.from({ length: 6 }).map((_, i) => (
                    <RewardCardSkeleton key={i} />
                ))}
            </div>
        );
    }

    // Empty state
    if (!rewards || rewards.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center py-20 text-center">
                <div className="w-20 h-20 rounded-2xl bg-white/5 border border-white/5 flex items-center justify-center mb-6">
                    <PackageOpen className="w-10 h-10 text-zinc-600" />
                </div>
                <h3 className="text-xl font-bold text-white mb-2">Belum Ada Reward</h3>
                <p className="text-zinc-500 text-sm max-w-sm">
                    Reward eksklusif akan segera tersedia. Terus kumpulkan poin Anda!
                </p>
            </div>
        );
    }

    return (
        <div ref={gridRef} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {rewards.map((reward) => (
                <div key={reward.id} data-reward-card>
                    <RewardCard
                        reward={reward}
                        userPoints={userPoints}
                        onSelect={onSelectReward}
                    />
                </div>
            ))}
        </div>
    );
}
