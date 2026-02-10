"use client";

import { useRouter } from "next/navigation";
import { useAuth } from "@/src/hooks/useAuth";
import { UserBalanceCard, RedeemModal, ActivityTable, WealthOverview } from "@/src/components/organisms";
import { StatCard } from "@/src/components/molecules/StatCard";
import { Button } from "@/src/components/atoms";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import api from "@/src/lib/api-client";

export default function DashboardPage() {
    const { user, isAuthenticated, logout } = useAuth();
    const router = useRouter();
    const queryClient = useQueryClient();

    // Fetch Profile for the welcome message
    const { data: profile } = useQuery({
        queryKey: ['userProfile'],
        queryFn: async () => {
            const res = await api.get('/v1/user/profile');
            return res.data.data;
        },
        enabled: isAuthenticated,
    });

    const handleRefresh = () => {
        queryClient.invalidateQueries({ queryKey: ['userProfile'] });
        queryClient.invalidateQueries({ queryKey: ['activityLog'] });
        window.location.reload(); // Full reload to reset GSAP contexts if needed, though useGSAP handles it.
    };

    if (!isAuthenticated) {
        // Auth redirection should ideally be handled by middleware or layout, 
        // but keeping this for client-side safety.
        if (typeof window !== 'undefined') router.push('/login');
        return null;
    }

    return (
        <div className="min-h-screen bg-midnight-950 text-white p-6 md:p-12 relative overflow-hidden">
            {/* Background Effects */}
            <div className="absolute top-0 left-0 w-full h-96 bg-trisula-500/10 blur-[120px] rounded-full pointer-events-none" />

            <div className="max-w-6xl mx-auto relative z-10">
                {/* Header */}
                <header className="flex flex-col md:flex-row justify-between items-start md:items-center mb-12 gap-6">
                    <div>
                        <h1 className="text-4xl font-bold bg-gradient-to-r from-trisula-200 via-trisula-400 to-trisula-600 bg-clip-text text-transparent underline decoration-trisula-500/30 underline-offset-8">
                            Member Dashboard
                        </h1>
                        <p className="text-zinc-400 mt-4">Welcome back, <span className="text-white font-semibold">{profile?.name || user?.role || "Member"}</span></p>
                    </div>
                    <div className="flex items-center gap-4">
                        <Button variant="secondary" onClick={() => router.push('/')}>
                            Landing
                        </Button>
                        <Button variant="danger" onClick={() => logout()}>
                            Sign Out
                        </Button>
                    </div>
                </header>

                {/* Main Stats Area */}
                <section className="mb-12">
                    <UserBalanceCard />
                </section>

                {/* Detailed Wealth Section */}
                <section className="mb-12">
                    <h2 className="text-2xl font-bold mb-6 flex items-center gap-3">
                        <span className="w-2 h-8 bg-trisula-500 rounded-full" />
                        Asset Portfolio
                    </h2>
                    <WealthOverview />
                </section>

                {/* Actions & Secondary Stats */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
                    {/* Status Card */}
                    <StatCard
                        label="Status Akun"
                        value={user?.role || "GUEST"} // In a real app, status might come from profile data
                        status="active"
                        className="bg-zinc-900/50"
                    />

                    {/* Redeem Action wrapped in Modal */}
                    <RedeemModal>
                        <RedeemModal.Trigger className="h-full">
                            <div className="bg-gradient-to-br from-trisula-500 to-amber-600 rounded-3xl p-8 flex flex-col justify-center items-center text-center h-full cursor-pointer hover:scale-[1.02] transition-transform shadow-[0_0_30px_rgba(234,179,8,0.2)]">
                                <div className="text-4xl mb-4">🎁</div>
                                <h3 className="text-midnight-950 font-bold text-xl uppercase tracking-wider">Tukar Reward</h3>
                                <p className="text-midnight-900/70 text-sm mt-2 font-medium">Gunakan poin Anda</p>
                            </div>
                        </RedeemModal.Trigger>
                        <RedeemModal.Content />
                    </RedeemModal>

                    {/* Quick Actions */}
                    <div className="flex flex-col gap-4">
                        <Button variant="secondary" className="w-full justify-between group" onClick={handleRefresh}>
                            Refresh Data
                            <span className="text-zinc-500 group-hover:text-white">↻</span>
                        </Button>
                        <Button variant="secondary" className="w-full justify-between group">
                            Bantuan Support
                            <span className="text-zinc-500 group-hover:text-white">?</span>
                        </Button>
                    </div>
                </div>

                {/* Activity Table */}
                <section>
                    <ActivityTable />
                </section>
            </div>
        </div>
    );
}
