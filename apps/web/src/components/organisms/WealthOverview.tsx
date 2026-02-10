"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, Button, Badge, AnimatedCounter } from "@/src/components/atoms";
import api from "@/src/lib/api-client";
import { useAuth } from "@/src/hooks/useAuth";
import { toast } from "sonner";
import { Wallet, Sparkles, Coins, RefreshCw } from "lucide-react";

interface WealthProfile {
    userId: string;
    fiatBalance: number;
    cryptoBalance: number;
    totalAum: number;
    tier: string;
    multiplier: number;
    nextTier?: {
        name: string;
        needed: number;
    };
}

export function WealthOverview() {
    const { isAuthenticated } = useAuth();
    const queryClient = useQueryClient();

    const { data: profile, isLoading } = useQuery({
        queryKey: ['wealthSummary'],
        queryFn: async () => {
            const res = await api.get('/v1/wealth/summary');
            return res.data;
        },
        enabled: isAuthenticated
    });

    const yieldMutation = useMutation({
        mutationFn: async () => api.post('/v1/rewards/daily-yield'),
        onSuccess: () => {
            toast.success("Yield reward distributed!");
            queryClient.invalidateQueries({ queryKey: ['userProfile'] });
            queryClient.invalidateQueries({ queryKey: ['wealthSummary'] });
        }
    });

    const depositMutation = useMutation({
        mutationFn: async (amount: number) => api.post('/v1/wealth/simulate-deposit', { amount }),
        onSuccess: () => {
            toast.success("Simulation deposit successful");
            queryClient.invalidateQueries({ queryKey: ['wealthSummary'] });
        }
    });

    if (isLoading) {
        return (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 animate-pulse">
                <Card className="h-48" />
                <Card className="h-48" />
            </div>
        );
    }

    if (!profile) return null;

    return (
        <div className="space-y-6">
            <Card variant="solid" className="bg-gradient-to-br from-zinc-900 to-black border-white/5 p-8 relative overflow-hidden group">
                {/* Decorative background */}
                <div className="absolute top-0 right-0 w-64 h-64 bg-trisula-500/5 blur-[100px] rounded-full pointer-events-none" />

                <div className="relative z-10">
                    <h3 className="text-zinc-500 text-xs font-bold uppercase tracking-widest mb-2">Total Managed Assets</h3>
                    <div className="flex items-baseline gap-2 mb-6">
                        <span className="text-trisula-500 text-2xl font-bold">Rp</span>
                        <div className="text-5xl md:text-6xl font-black text-white tracking-tight">
                            <AnimatedCounter
                                value={profile.totalAum}
                                duration={2}
                                formatter={(val) => val.toLocaleString('id-ID')}
                            />
                        </div>
                    </div>

                    <div className="flex flex-wrap items-center gap-4">
                        <Badge variant={profile.tier === 'Platinum' ? 'success' : 'warning'}>
                            {profile.tier} Member
                        </Badge>
                        {profile.nextTier && (
                            <span className="text-xs text-zinc-500 font-medium">
                                <span className="text-trisula-400">Rp {profile.nextTier.needed.toLocaleString('id-ID')}</span> more to reach {profile.nextTier.name}
                            </span>
                        )}
                    </div>
                </div>
            </Card>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Card variant="glass" className="group hover:border-green-500/30 transition-all">
                    <div className="flex justify-between items-start mb-4">
                        <div className="w-12 h-12 bg-green-500/10 rounded-2xl flex items-center justify-center text-green-500">
                            <Wallet className="w-6 h-6" />
                        </div>
                        <span className="text-[10px] text-zinc-500 font-bold uppercase tracking-widest">Bank Balance</span>
                    </div>
                    <div className="text-3xl font-bold text-white mb-1">
                        Rp {profile.fiatBalance.toLocaleString('id-ID')}
                    </div>
                    <p className="text-xs text-zinc-500">Secured in Trisula Vault</p>
                </Card>

                <Card variant="glass" className="group hover:border-blue-500/30 transition-all">
                    <div className="flex justify-between items-start mb-4">
                        <div className="w-12 h-12 bg-blue-500/10 rounded-2xl flex items-center justify-center text-blue-400">
                            <Sparkles className="w-6 h-6" />
                        </div>
                        <span className="text-[10px] text-zinc-500 font-bold uppercase tracking-widest">Digital Assets</span>
                    </div>
                    <div className="text-3xl font-bold text-white mb-1">
                        Rp {profile.cryptoBalance.toLocaleString('id-ID')}
                    </div>
                    <p className="text-xs text-zinc-500">Optimized across protocols</p>
                </Card>
            </div>

            {/* Dev Controls */}
            <Card variant="outline" className="border-white/5 bg-white/[0.02]">
                <p className="text-[9px] text-trisula-500/50 font-black uppercase tracking-widest mb-4">Development Environment</p>
                <div className="flex flex-wrap gap-3">
                    <Button
                        variant="secondary"
                        size="sm"
                        onClick={() => depositMutation.mutate(10000000)}
                        isLoading={depositMutation.isPending}
                    >
                        + Rp 10M Deposit Simulation
                    </Button>
                    <Button
                        variant="secondary"
                        size="sm"
                        onClick={() => yieldMutation.mutate()}
                        isLoading={yieldMutation.isPending}
                        className="gap-2"
                    >
                        <Coins className="w-4 h-4" /> Trigger Yield Reward
                    </Button>
                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => queryClient.invalidateQueries({ queryKey: ['wealthSummary'] })}
                        className="gap-2"
                    >
                        <RefreshCw className="w-4 h-4" /> Refresh Network
                    </Button>
                </div>
            </Card>
        </div>
    );
}
