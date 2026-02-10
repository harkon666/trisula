"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/src/hooks/useAuth";

interface UserProfile {
    name: string;
    email: string;
    walletAddress: string;
    role: string;
    status: string;
    referralCode?: string;
    points: number;
    dailyYield?: {
        claimed: boolean;
        points: number;
        reason?: string;
    } | null;
    wealth?: {
        totalAum: number;
        estimatedYield: number;
        tier: string;
    };
}

interface ActivityLog {
    id: string;
    amount: number;
    reason: string;
    source: string;
    createdAt: string;
    txHash?: string;
    status?: 'pending' | 'processing' | 'ready' | 'completed' | 'cancelled' | 'rejected' | 'refund' | null;
}

export default function DashboardPage() {
    const { user, isAuthenticated, logout } = useAuth();
    const router = useRouter();
    const [profile, setProfile] = useState<UserProfile | null>(null);
    const [activity, setActivity] = useState<ActivityLog[]>([]);
    const [loading, setLoading] = useState(true);
    const [showYieldModal, setShowYieldModal] = useState(false);
    const [yieldReward, setYieldReward] = useState<{ points: number } | null>(null);

    useEffect(() => {
        if (!isAuthenticated || !user) return;

        const fetchData = async () => {
            try {
                const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000";

                // Fetch Profile
                const profileRes = await fetch(`${apiUrl}/api/v1/user/profile?userId=${user.userId}`);
                const profileJson = await profileRes.json();

                if (profileJson.success) {
                    setProfile(profileJson.data);
                    if (profileJson.data.dailyYield?.claimed) {
                        setYieldReward(profileJson.data.dailyYield);
                        setShowYieldModal(true);
                    }
                }

                // Fetch Activity
                const activityRes = await fetch(`${apiUrl}/api/v1/user/activity?userId=${user.userId}`);
                const activityJson = await activityRes.json();

                if (activityJson.success) {
                    setActivity(activityJson.data);
                }

            } catch (error) {
                console.error("Dashboard fetch error:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, [isAuthenticated, user]);

    const resetDailyCheckIn = async () => {
        if (!user) return;
        if (!confirm("Reset daily check-in for testing? This will reload the page.")) return;

        const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000";
        try {
            const res = await fetch(`${apiUrl}/api/v1/rewards/reset-claim`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ userId: user.userId })
            });
            const json = await res.json();
            if (json.success) {
                window.location.reload();
            } else {
                alert("Failed: " + json.error);
            }
        } catch (e) {
            alert("Error resetting check-in");
        }
    };

    if (!isAuthenticated) {
        return (
            <div className="min-h-screen flex flex-col items-center justify-center bg-zinc-950 text-white">
                <button
                    onClick={() => router.push('/login')}
                    className="px-8 py-4 bg-amber-500 text-black font-bold rounded-xl"
                >
                    Sign In to Access
                </button>
                <p className="mt-4 text-zinc-500">Access Restricted. Members Only.</p>
            </div>
        );
    }

    if (loading) {
        return <div className="min-h-screen bg-zinc-950 flex items-center justify-center text-amber-500 animate-pulse">Loading Member Data...</div>;
    }

    return (
        <div className="min-h-screen bg-zinc-950 text-white p-6 md:p-12 relative overflow-hidden">
            {/* Background Effects */}
            <div className="absolute top-0 left-0 w-full h-96 bg-amber-500/10 blur-[120px] rounded-full pointer-events-none" />

            <div className="max-w-6xl mx-auto relative z-10">
                {/* Header */}
                <header className="flex flex-col md:flex-row justify-between items-start md:items-center mb-12 gap-6">
                    <div>
                        <h1 className="text-4xl font-bold bg-gradient-to-r from-amber-200 via-yellow-400 to-amber-600 bg-clip-text text-transparent underline decoration-amber-500/30 underline-offset-8">
                            Member Dashboard
                        </h1>
                        <p className="text-zinc-400 mt-4">Welcome back, <span className="text-white font-semibold">{profile?.name || "Member"}</span></p>
                    </div>
                    <div className="flex items-center gap-4">
                        <button
                            onClick={() => router.push('/')}
                            className="px-4 py-2 bg-white/5 hover:bg-white/10 rounded-xl transition-all text-sm font-medium border border-white/10"
                        >
                            Landing
                        </button>
                        <button
                            onClick={() => logout()}
                            className="px-4 py-2 bg-red-500/10 hover:bg-red-500/20 text-red-400 rounded-xl transition-all text-sm font-medium border border-red-500/20"
                        >
                            Sign Out
                        </button>
                    </div>
                </header>

                {/* Stats Grid */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
                    {/* Points Card */}
                    <div className="col-span-1 md:col-span-2 bg-white/5 border border-white/10 backdrop-blur-xl rounded-3xl p-8 relative overflow-hidden group hover:border-amber-500/30 transition-all">
                        <div className="absolute top-0 right-0 p-8 opacity-10 group-hover:opacity-20 transition-opacity">
                            <span className="text-9xl font-bold text-amber-500">₿</span>
                        </div>
                        <h3 className="text-zinc-400 uppercase tracking-widest text-sm font-semibold mb-2">Total Trisula Poin</h3>
                        <div className="text-6xl md:text-7xl font-bold text-white mb-4">
                            {profile?.points.toLocaleString()}
                        </div>
                        <div className="flex gap-3">
                            <span className="px-3 py-1 rounded-full bg-amber-500/20 text-amber-300 text-xs border border-amber-500/30 font-bold">
                                Level: Priority
                            </span>
                            <span className="px-3 py-1 rounded-full bg-zinc-800 text-zinc-300 text-xs border border-white/5 font-mono">
                                REF-ID: {profile?.referralCode || "-"}
                            </span>
                        </div>
                    </div>

                    {/* Total Wealth Card (New) */}
                    <div
                        onClick={() => router.push('/dashboard/wealth')}
                        className="cursor-pointer bg-gradient-to-br from-zinc-900 to-black border border-white/10 backdrop-blur-xl rounded-3xl p-8 relative overflow-hidden group hover:border-amber-500/50 transition-all shadow-lg"
                    >
                        <div className="absolute top-0 right-0 p-6 opacity-10 group-hover:opacity-20 transition-opacity">
                            <svg className="w-24 h-24 text-amber-500" fill="currentColor" viewBox="0 0 24 24">
                                <path d="M12 2L2 7l10 5 10-5-10-5zm0 9l2.5-1.25L12 8.5l-2.5 1.25L12 11zm0 2.5l-5-2.5-5 2.5L12 22l10-8.5-5-2.5-5 2.5z" />
                            </svg>
                        </div>
                        <h3 className="text-zinc-400 uppercase tracking-widest text-sm font-semibold mb-2 flex items-center gap-2">
                            Total Aset
                            <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse"></span>
                        </h3>
                        <div className="text-3xl md:text-4xl font-bold text-white mb-2 truncate">
                            {profile?.wealth?.totalAum
                                ? new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR' }).format(profile.wealth.totalAum)
                                : "Rp 0"}
                        </div>
                        <p className="text-zinc-500 text-xs mb-4">
                            ~{profile?.wealth?.estimatedYield} Pts/Hari (Est.)
                        </p>
                        <div className="flex items-center text-amber-500 text-sm font-medium gap-1 group-hover:translate-x-1 transition-transform">
                            Kelola Portofolio &rarr;
                        </div>
                    </div>

                    {/* Status Card */}
                    <div className="bg-zinc-900/50 border border-white/5 rounded-3xl p-8 flex flex-col justify-center">
                        <h3 className="text-zinc-400 uppercase tracking-widest text-sm font-semibold mb-4">Status Akun</h3>
                        <div className="flex items-center gap-4 mb-6">
                            <div className={`w-3 h-3 rounded-full ${profile?.status === 'active' ? 'bg-green-500 shadow-[0_0_10px_rgba(34,197,94,0.5)]' : 'bg-red-500'}`} />
                            <span className="text-xl capitalize font-bold">{profile?.status === 'active' ? 'AKTIF' : profile?.status}</span>
                        </div>
                        <div className="mt-auto">
                            <button
                                onClick={() => router.push('/dashboard/redeem')}
                                className="w-full py-4 bg-amber-500 hover:bg-amber-400 text-black rounded-xl transition-all text-sm font-bold shadow-lg"
                            >
                                Tukar Reward
                            </button>
                        </div>
                    </div>
                </div>

                {/* Activity Table */}
                <div className="bg-white/5 border border-white/10 backdrop-blur-md rounded-3xl p-8 shadow-2xl">
                    <h2 className="text-2xl font-bold mb-6 flex items-center gap-3">
                        <span className="w-2 h-8 bg-amber-500 rounded-full" />
                        Riwayat Aktivitas
                    </h2>

                    {activity.length === 0 ? (
                        <p className="text-zinc-500 italic">Belum ada riwayat aktivitas.</p>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="w-full text-left border-collapse">
                                <thead>
                                    <tr className="text-zinc-500 border-b border-white/5">
                                        <th className="pb-4 font-medium pl-4">Tanggal</th>
                                        <th className="pb-4 font-medium">Aktivitas</th>
                                        <th className="pb-4 font-medium">Sumber</th>
                                        <th className="pb-4 font-medium text-right pr-4">Poin</th>
                                    </tr>
                                </thead>
                                <tbody className="text-sm">
                                    {activity.map((log) => (
                                        <tr key={log.id} className="border-b border-white/5 hover:bg-white/5 transition-colors">
                                            <td className="py-4 pl-4 text-zinc-400">
                                                {new Date(log.createdAt).toLocaleDateString('id-ID')}
                                            </td>
                                            <td className="py-4 font-medium text-white flex items-center gap-2">
                                                {log.reason}
                                                {log.status && (
                                                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold border ${log.status === 'completed' ? 'bg-green-500/20 border-green-500/30 text-green-300' :
                                                        log.status === 'rejected' ? 'bg-red-500/20 border-red-500/30 text-red-300' :
                                                            log.status === 'cancelled' ? 'bg-zinc-500/20 border-zinc-500/30 text-zinc-300' :
                                                                log.status === 'ready' ? 'bg-emerald-500/20 border-emerald-500/30 text-emerald-300' :
                                                                    log.status === 'processing' ? 'bg-blue-500/20 border-blue-500/30 text-blue-300' :
                                                                        log.status === 'refund' ? 'bg-purple-500/20 border-purple-500/30 text-purple-300' :
                                                                            'bg-amber-500/20 border-amber-500/30 text-amber-300'
                                                        }`}>
                                                        {log.status === 'cancelled' ? 'DIBATALKAN' :
                                                            log.status === 'rejected' ? 'DITOLAK' :
                                                                log.status === 'ready' ? 'SIAP DIAMBIL' :
                                                                    log.status === 'completed' ? 'SELESAI' :
                                                                        log.status === 'processing' ? 'DIPROSES' :
                                                                            log.status === 'refund' ? 'DIKEMBALIKAN' :
                                                                                'MENUNGGU'}
                                                    </span>
                                                )}
                                            </td>
                                            <td className="py-4 text-zinc-400 capitalize">{log.source}</td>
                                            <td className={`py-4 pr-4 text-right font-bold ${log.amount > 0 ? 'text-green-400' : 'text-red-400'}`}>
                                                {log.amount > 0 ? '+' : ''}{log.amount}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>
            </div>

            {/* Developer Tools (Bottom) */}
            <div className="mt-12 pt-12 border-t border-dashed border-zinc-800 opacity-20 hover:opacity-100 transition-opacity max-w-6xl mx-auto">
                <h3 className="text-zinc-500 text-sm font-mono mb-4">🛠️ DEVELOPER TOOLS</h3>
                <div className="flex gap-4">
                    <button
                        onClick={resetDailyCheckIn}
                        className="bg-red-900/20 hover:bg-red-900/40 border border-red-500/30 text-red-400 px-4 py-2 rounded text-xs font-mono transition-colors"
                    >
                        Reset Daily Check-in & Refresh
                    </button>
                    <button
                        onClick={() => logout()}
                        className="bg-zinc-900 hover:bg-zinc-800 border border-white/10 text-white px-4 py-2 rounded text-xs font-mono"
                    >
                        Quick Logout
                    </button>
                </div>
            </div>

            {/* Daily Yield Modal */}
            {
                showYieldModal && yieldReward && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-300">
                        <div className="bg-zinc-900 border border-amber-500/50 rounded-3xl p-8 max-w-md w-full relative overflow-hidden shadow-[0_0_50px_rgba(245,158,11,0.2)] animate-in zoom-in-95 duration-300">
                            {/* Glow Effect */}
                            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-32 h-32 bg-amber-500/20 blur-[50px] rounded-full pointer-events-none" />

                            <div className="text-center relative z-10">
                                <div className="text-6xl mb-4 animate-bounce">🎉</div>
                                <h2 className="text-2xl font-bold text-white mb-2">Check-in Harian Berhasil!</h2>
                                <p className="text-zinc-400 mb-6">Anda mendapatkan reward Trisula Poin berdasarkan total aset terkelola Anda.</p>

                                <div className="bg-white/5 border border-white/10 rounded-2xl p-6 mb-6">
                                    <span className="block text-sm text-zinc-500 uppercase tracking-widest font-semibold mb-1">Poin Didapat</span>
                                    <span className="text-5xl font-bold text-amber-500">+{yieldReward?.points}</span>
                                    <span className="text-amber-500/50 text-xl font-bold ml-1">PTS</span>
                                </div>

                                <button
                                    onClick={() => setShowYieldModal(false)}
                                    className="w-full py-4 bg-amber-500 hover:bg-amber-600 text-black font-bold rounded-xl transition-all hover:scale-105 active:scale-95"
                                >
                                    Luar Biasa!
                                </button>
                            </div>
                        </div>
                    </div>
                )
            }
        </div>
    );
}
