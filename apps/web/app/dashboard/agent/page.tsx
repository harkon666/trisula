"use client";

import { useAuth } from "@/src/hooks/useAuth";
import { AgentNavbar } from "@/src/components/organisms/AgentNavbar";
import { ReferralTable } from "@/src/components/organisms/ReferralTable";
import { EarningsChart } from "@/src/components/molecules/EarningsChart";
import { WatchdogAlert } from "@/src/components/molecules/WatchdogAlert";
import { useAgentStats } from "@/src/hooks/useAgentDashboard";
import { Button } from "@/src/components/atoms";
import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import { useRef } from "react";
import { Users, CreditCard, BarChart3, Copy } from "lucide-react";
import RoleGuard from "@/src/components/auth/RoleGuard";
import { toast } from "sonner";

export default function AgentDashboard() {
    const { user } = useAuth();
    const { data: stats, isLoading } = useAgentStats();
    const containerRef = useRef<HTMLDivElement>(null);

    useGSAP(() => {
        // Master Timeline
        const tl = gsap.timeline();

        // 1. Stats Card Stagger
        tl.from(".stat-card", {
            y: 30,
            opacity: 0,
            duration: 0.6,
            stagger: 0.1,
            ease: "back.out(1.2)",
            delay: 0.2
        });

        // 2. Chart Scale Up
        tl.from(".chart-container", {
            scale: 0.95,
            opacity: 0,
            duration: 0.8,
            ease: "power2.out"
        }, "-=0.4");

        // 3. Table Slide Up
        tl.from(".table-container", {
            y: 50,
            opacity: 0,
            duration: 0.8,
            ease: "power3.out"
        }, "-=0.6");

    }, { scope: containerRef });

    const handleCopyCode = () => {
        if (user?.userId) {
            navigator.clipboard.writeText(user.userId);
            toast.success("Agent Code Copied!");
        }
    };

    return (
        <RoleGuard allowedRoles={['agent']}>
            <div ref={containerRef} className="min-h-screen bg-midnight-950 text-white pb-20">
                <AgentNavbar />
                <WatchdogAlert />

                <main className="pt-28 max-w-7xl mx-auto px-6">
                    {/* Header */}
                    <div className="flex flex-col md:flex-row justify-between items-end mb-12 gap-6">
                        <div>
                            <h1 className="text-4xl font-black mb-2 tracking-tight">
                                Agent <span className="text-trisula-500">Command Center</span>
                            </h1>
                            <p className="text-zinc-400">Welcome back, <span className="text-white font-bold">{user?.userId}</span>. Here is your performance overview.</p>
                        </div>
                    </div>

                    {/* Stats Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                        {/* Stat 1: Total Referrals */}
                        <div className="stat-card p-6 rounded-[2rem] bg-midnight-900/50 border border-white/5 backdrop-blur-sm relative overflow-hidden group hover:border-trisula-500/30 transition-colors">
                            <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                                <Users className="w-16 h-16 text-trisula-500" />
                            </div>
                            <p className="text-zinc-500 text-xs font-bold uppercase tracking-widest mb-2">Total Nasabah</p>
                            <h3 className="text-4xl font-black text-white">
                                {isLoading ? "..." : stats?.totalReferrals || 0}
                            </h3>
                        </div>

                        {/* Stat 2: Commission */}
                        <div className="stat-card p-6 rounded-[2rem] bg-midnight-900/50 border border-white/5 backdrop-blur-sm relative overflow-hidden group hover:border-emerald-500/30 transition-colors">
                            <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                                <CreditCard className="w-16 h-16 text-emerald-500" />
                            </div>
                            <p className="text-zinc-500 text-xs font-bold uppercase tracking-widest mb-2">Total Commission</p>
                            <h3 className="text-4xl font-black text-emerald-400 flex items-baseline gap-1">
                                <span className="text-lg">pts</span>
                                {isLoading ? "..." : (stats?.totalCommission || 0).toLocaleString('id-ID')}
                            </h3>
                        </div>

                        {/* Stat 3: Interactions */}
                        <div className="stat-card p-6 rounded-[2rem] bg-midnight-900/50 border border-white/5 backdrop-blur-sm relative overflow-hidden group hover:border-blue-500/30 transition-colors">
                            <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                                <BarChart3 className="w-16 h-16 text-blue-500" />
                            </div>
                            <p className="text-zinc-500 text-xs font-bold uppercase tracking-widest mb-2">WA Interactions</p>
                            <h3 className="text-4xl font-black text-blue-400">
                                {isLoading ? "..." : stats?.totalInteractions || 0}
                            </h3>
                        </div>
                    </div>

                    {/* Main Content Grid */}
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                        {/* Left: Chart (2/3 width on large screens) */}
                        <div className="lg:col-span-2 chart-container">
                            <EarningsChart />
                        </div>

                        {/* Right: Quick Actions / Future Expansion */}
                        <div className="lg:col-span-1 space-y-6">
                            <div className="p-8 rounded-[2rem] bg-gradient-to-br from-trisula-900/20 to-midnight-900/50 border border-trisula-500/20 h-full flex flex-col justify-center items-center text-center relative overflow-hidden">
                                <div className="absolute inset-0 bg-[url('/grid.svg')] opacity-10" />
                                <h4 className="text-xl font-bold text-white mb-2 relative z-10">Invite New Nasabah</h4>
                                <p className="text-zinc-400 text-sm mb-6 relative z-10">Share your unique agent code to start earning commissions.</p>

                                <div className="bg-black/30 p-4 rounded-xl mb-4 w-full border border-white/5 relative z-10 flex items-center justify-between group cursor-pointer" onClick={handleCopyCode}>
                                    <code className="text-2xl font-mono text-trisula-400 font-bold tracking-widest">{user?.userId}</code>
                                    <Copy className="w-4 h-4 text-zinc-500 group-hover:text-white transition-colors" />
                                </div>

                                <Button variant="primary" className="w-full relative z-10" onClick={handleCopyCode}>
                                    Copy Invite Link
                                </Button>
                            </div>
                        </div>
                    </div>

                    {/* Bottom: Referral Table */}
                    <div className="mt-12 table-container">
                        <ReferralTable />
                    </div>
                </main>
            </div>
        </RoleGuard>
    );
}
