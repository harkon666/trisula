"use client";

import { useAdminLeaderboard } from "@/src/hooks/useAdminLeaderboard";
import { Trophy, AlertCircle, RefreshCw, Phone, ArrowDown, ArrowUp } from "lucide-react";
import { Skeleton } from "@/src/components/atoms";
import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import { useRef, useState, useMemo } from "react";

export function AdminAgentLeaderboard() {
    const { data: leaderboard, isLoading, isError, error, refetch } = useAdminLeaderboard();
    const containerRef = useRef<HTMLDivElement>(null);
    const [sortOrder, setSortOrder] = useState<"desc" | "asc">("desc");

    const sortedLeaderboard = useMemo(() => {
        if (!leaderboard) return [];

        const dataWithRanks = leaderboard.map((agent, index) => ({
            ...agent,
            rank: index + 1
        }));

        return dataWithRanks.sort((a, b) => {
            return sortOrder === "desc"
                ? b.totalReferrals - a.totalReferrals
                : a.totalReferrals - b.totalReferrals;
        });
    }, [leaderboard, sortOrder]);

    useGSAP(() => {
        if (sortedLeaderboard.length > 0) {
            gsap.fromTo(
                ".leaderboard-item",
                { y: 20, opacity: 0 },
                {
                    y: 0,
                    opacity: 1,
                    duration: 0.6,
                    stagger: 0.1,
                    ease: "power3.out",
                    overwrite: "auto"
                }
            );
        }
    }, [sortedLeaderboard]);

    if (isLoading) {
        return (
            <div className="space-y-4">
                {[1, 2, 3, 4, 5].map((i) => (
                    <Skeleton key={i} className="h-16 w-full rounded-xl bg-gray-800/50" />
                ))}
            </div>
        );
    }

    if (isError) {
        return (
            <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-6 text-center">
                <AlertCircle className="w-8 h-8 text-red-400 mx-auto mb-3" />
                <p className="text-red-200 mb-4">{error instanceof Error ? error.message : "Gagal memuat data leaderboard"}</p>
                <button
                    onClick={() => refetch()}
                    className="flex items-center gap-2 mx-auto bg-red-500/20 hover:bg-red-500/30 text-red-300 px-4 py-2 rounded-lg transition"
                >
                    <RefreshCw className="w-4 h-4" /> Coba Lagi
                </button>
            </div>
        );
    }

    if (!leaderboard || leaderboard.length === 0) {
        return (
            <div className="text-center py-12 bg-gray-900/50 rounded-2xl border border-gray-800">
                <Trophy className="w-12 h-12 text-gray-600 mx-auto mb-3" />
                <p className="text-gray-400">Belum ada data performa agen.</p>
            </div>
        );
    }

    return (
        <div className="space-y-6" ref={containerRef}>
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
                <div className="space-y-1">
                    <h2 className="text-2xl font-black text-white tracking-tight flex items-center gap-2">
                        <Trophy className="w-6 h-6 text-gold-metallic" /> Agent Performance
                    </h2>
                    <p className="text-sm text-zinc-500">Peringkat agen berdasarkan total akuisisi nasabah.</p>
                </div>
                <button
                    onClick={() => refetch()}
                    className="p-2 hover:bg-gray-800 rounded-lg text-gray-400 transition"
                    title="Refresh Data"
                >
                    <RefreshCw className="w-5 h-5" />
                </button>
            </div>

            <div className="bg-charcoal-900 overflow-hidden border border-white/5 rounded-2xl shadow-xl shadow-black/50">
                <div className="hidden md:grid grid-cols-12 gap-4 p-4 border-b border-white/10 text-sm font-bold text-gray-400 bg-charcoal-800/50 tracking-widest uppercase items-center">
                    <div className="col-span-1 text-center">Rank</div>
                    <div className="col-span-3">Agent Code</div>
                    <div className="col-span-4">Full Name</div>
                    <div className="col-span-2 flex justify-center">
                        <button
                            onClick={() => setSortOrder(prev => prev === "desc" ? "asc" : "desc")}
                            className="flex items-center gap-2 hover:text-white transition group"
                        >
                            Referrals
                            {sortOrder === "desc" ? (
                                <ArrowDown className="w-4 h-4 text-zinc-500 group-hover:text-gold-400" />
                            ) : (
                                <ArrowUp className="w-4 h-4 text-zinc-500 group-hover:text-gold-400" />
                            )}
                        </button>
                    </div>
                    <div className="col-span-2 text-right">Contact</div>
                </div>

                <div className="divide-y divide-white/5">
                    {sortedLeaderboard.map((agent) => {
                        const isTop1 = agent.rank === 1;
                        const isTop2 = agent.rank === 2;
                        const isTop3 = agent.rank === 3;

                        let rankColor = "text-gray-500 text-sm";
                        if (isTop1) rankColor = "text-yellow-400 text-xl drop-shadow-[0_0_8px_rgba(250,204,21,0.5)]";
                        else if (isTop2) rankColor = "text-gray-300 text-xl drop-shadow-[0_0_8px_rgba(209,213,219,0.5)]";
                        else if (isTop3) rankColor = "text-amber-600 text-xl drop-shadow-[0_0_8px_rgba(217,119,6,0.5)]";

                        return (
                            <div
                                key={agent.id}
                                className={`leaderboard-item grid grid-cols-1 md:grid-cols-12 gap-4 p-4 items-center hover:bg-white/5 transition-colors ${isTop1 ? "bg-yellow-500/5 border-l-4 border-l-yellow-500" : "border-l-4 border-l-transparent"
                                    }`}
                            >
                                <div className="col-span-1 flex items-center justify-center">
                                    <span className={`font-mono font-black ${rankColor}`}>#{agent.rank}</span>
                                </div>
                                <div className="col-span-3 flex items-center">
                                    <span className="text-zinc-300 font-mono text-xs tracking-widest bg-charcoal-800 border border-white/10 px-2 py-1.5 rounded-lg shadow-inner">
                                        {agent.userId}
                                    </span>
                                </div>
                                <div className="col-span-4">
                                    <p className={`font-bold ${isTop1 ? "text-yellow-400" : "text-white"}`}>
                                        {agent.fullName || "Unnamed Agent"}
                                    </p>
                                </div>
                                <div className="col-span-2 flex items-center justify-start md:justify-center gap-2">
                                    <span className="md:hidden text-zinc-500 text-xs font-bold uppercase tracking-widest">Nasabah:</span>
                                    <span className={`font-mono text-lg ${isTop1 ? "text-yellow-400 font-black" : "text-zinc-300 font-bold"}`}>
                                        {agent.totalReferrals}
                                    </span>
                                </div>
                                <div className="col-span-2 flex items-center justify-start md:justify-end">
                                    {agent.whatsapp ? (
                                        <a
                                            href={`https://wa.me/${agent.whatsapp}`}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="text-zinc-500 hover:text-green-400 hover:bg-green-500/10 p-2 rounded-full transition flex items-center gap-2"
                                            title="Hubungi via WhatsApp"
                                        >
                                            <Phone className="w-5 h-5" />
                                            <span className="text-sm md:hidden text-green-400 font-bold">{agent.whatsapp}</span>
                                        </a>
                                    ) : (
                                        <span className="text-zinc-700 text-xs uppercase tracking-widest font-bold">No WA</span>
                                    )}
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>
        </div>
    );
}
