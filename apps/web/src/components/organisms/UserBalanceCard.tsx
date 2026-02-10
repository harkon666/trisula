"use client";

import { useQuery } from "@tanstack/react-query";
import { Card, Skeleton, AnimatedCounter, Badge } from "@/src/components/atoms";
import api from "@/src/lib/api-client";
import { useAuth } from "@/src/hooks/useAuth";

// Data Types
interface UserProfile {
    points: number;
    wealth?: {
        totalAum: number;
        estimatedYield: number;
        tier: string;
    };
    referralCode?: string;
}

export function UserBalanceCard() {
    const { isAuthenticated } = useAuth();

    // Server State Management with TanStack Query
    const { data, isLoading, isError } = useQuery({
        queryKey: ['userProfile'],
        queryFn: async () => {
            const res = await api.get('/v1/user/profile');
            return res.data.data as UserProfile;
        },
        enabled: isAuthenticated, // Only fetch if authenticated
        staleTime: 1000 * 60 * 5, // Data is fresh for 5 minutes
    });

    if (isLoading) {
        return (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Card className="h-48 flex flex-col justify-between">
                    <div className="space-y-4">
                        <Skeleton className="h-4 w-1/3" />
                        <Skeleton className="h-16 w-2/3" />
                    </div>
                    <Skeleton className="h-6 w-1/4" />
                </Card>
                <Card className="h-48 flex flex-col justify-between bg-white/5">
                    <div className="space-y-4">
                        <Skeleton className="h-4 w-1/3" />
                        <Skeleton className="h-12 w-1/2" />
                    </div>
                    <Skeleton className="h-4 w-3/4" />
                </Card>
            </div>
        );
    }

    if (isError || !data) {
        return (
            <Card className="border-red-500/20 bg-red-500/5">
                <p className="text-red-400">Gagal memuat data saldo. Silakan refresh.</p>
            </Card>
        );
    }

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Points Section */}
            <Card variant="glass" glow className="group relative">
                {/* Background Decor */}
                <div className="absolute top-0 right-0 p-8 opacity-10 group-hover:opacity-20 transition-opacity pointer-events-none">
                    <span className="text-9xl font-bold text-amber-500">₿</span>
                </div>

                <div className="relative z-10 flex flex-col justify-between h-full min-h-[160px]">
                    <div>
                        <h3 className="text-zinc-400 uppercase tracking-widest text-xs font-bold mb-2">Total Trisula Poin</h3>
                        <div className="text-5xl md:text-6xl font-bold text-white mb-2">
                            <AnimatedCounter value={data.points} duration={2} />
                        </div>
                    </div>

                    <div className="flex gap-2 mt-4">
                        <Badge variant="warning">Level: {data.wealth?.tier || "Priority"}</Badge>
                        <Badge variant="outline">REF: {data.referralCode || "-"}</Badge>
                    </div>
                </div>
            </Card>

            {/* Wealth Section */}
            <Card
                variant="solid"
                glow
                className="bg-gradient-to-br from-zinc-900 to-black group cursor-pointer"
            >
                <div className="absolute top-0 right-0 p-6 opacity-10 group-hover:opacity-20 transition-opacity">
                    <svg className="w-24 h-24 text-amber-500" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M12 2L2 7l10 5 10-5-10-5zm0 9l2.5-1.25L12 8.5l-2.5 1.25L12 11zm0 2.5l-5-2.5-5 2.5L12 22l10-8.5-5-2.5-5 2.5z" />
                    </svg>
                </div>

                <div className="relative z-10 flex flex-col justify-between h-full min-h-[160px]">
                    <div>
                        <h3 className="text-zinc-400 uppercase tracking-widest text-xs font-bold mb-2 flex items-center gap-2">
                            Total Aset
                            <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse"></span>
                        </h3>
                        <div className="text-3xl md:text-4xl font-bold text-white mb-1">
                            <AnimatedCounter
                                value={data.wealth?.totalAum || 0}
                                formatter={(val) => new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(val)}
                                duration={2.5}
                            />
                        </div>
                        <p className="text-zinc-500 text-xs">
                            ~{data.wealth?.estimatedYield} Pts/Hari (Est.)
                        </p>
                    </div>

                    <div className="flex items-center text-amber-500 text-xs font-bold uppercase tracking-wider mt-4 group-hover:translate-x-1 transition-transform">
                        Kelola Portofolio &rarr;
                    </div>
                </div>
            </Card>
        </div>
    );
}

// Subcomponents for finer control if needed later (Compound Pattern Extension)
UserBalanceCard.Points = ({ points }: { points: number }) => (
    <div className="text-5xl font-bold"><AnimatedCounter value={points} /></div>
);
