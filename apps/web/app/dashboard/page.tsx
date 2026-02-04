"use client";

import { useActiveAccount } from "thirdweb/react";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import ConnectWallet from "../../components/ConnectWallet";

interface UserProfile {
    name: string;
    email: string;
    walletAddress: string;
    role: string;
    status: string;
    referralCode?: string;
    points: number;
}

interface ActivityLog {
    id: string;
    amount: number;
    reason: string;
    source: string;
    createdAt: string;
    onchainTx?: string;
}

export default function DashboardPage() {
    const account = useActiveAccount();
    const router = useRouter();
    const [profile, setProfile] = useState<UserProfile | null>(null);
    const [activity, setActivity] = useState<ActivityLog[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!account) return;

        const fetchData = async () => {
            try {
                const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000";

                // Fetch Profile
                const profileRes = await fetch(`${apiUrl}/api/v1/user/profile?walletAddress=${account.address}`);
                const profileJson = await profileRes.json();

                if (profileJson.success) {
                    setProfile(profileJson.data);
                }

                // Fetch Activity
                const activityRes = await fetch(`${apiUrl}/api/v1/user/activity?walletAddress=${account.address}`);
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
    }, [account]);

    if (!account) {
        return (
            <div className="min-h-screen flex flex-col items-center justify-center bg-zinc-950 text-white">
                <ConnectWallet />
                <p className="mt-4 text-zinc-500">Access Restricted. Sultan Only.</p>
            </div>
        );
    }

    if (loading) {
        return <div className="min-h-screen bg-zinc-950 flex items-center justify-center text-amber-500 animate-pulse">Loading Sultan Data...</div>;
    }

    return (
        <div className="min-h-screen bg-zinc-950 text-white p-6 md:p-12 relative overflow-hidden">
            {/* Background Effects */}
            <div className="absolute top-0 left-0 w-full h-96 bg-amber-500/10 blur-[120px] rounded-full pointer-events-none" />

            <div className="max-w-6xl mx-auto relative z-10">
                {/* Header */}
                <header className="flex flex-col md:flex-row justify-between items-start md:items-center mb-12 gap-6">
                    <div>
                        <h1 className="text-4xl font-bold bg-gradient-to-r from-amber-200 via-yellow-400 to-amber-600 bg-clip-text text-transparent">
                            Sultan Dashboard
                        </h1>
                        <p className="text-zinc-400 mt-2">Welcome back, {profile?.name || "Member"}</p>
                    </div>
                    <ConnectWallet />
                </header>

                {/* Stats Grid */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
                    {/* Points Card */}
                    <div className="col-span-1 md:col-span-2 bg-white/5 border border-white/10 backdrop-blur-xl rounded-3xl p-8 relative overflow-hidden group hover:border-amber-500/30 transition-all">
                        <div className="absolute top-0 right-0 p-8 opacity-10 group-hover:opacity-20 transition-opacity">
                            <span className="text-9xl font-bold text-amber-500">₿</span>
                        </div>
                        <h3 className="text-zinc-400 uppercase tracking-widest text-sm font-semibold mb-2">Total Points</h3>
                        <div className="text-6xl md:text-7xl font-bold text-white mb-4">
                            {profile?.points.toLocaleString()}
                        </div>
                        <div className="flex gap-3">
                            <span className="px-3 py-1 rounded-full bg-amber-500/20 text-amber-300 text-xs border border-amber-500/30">
                                Level: Priority
                            </span>
                            <span className="px-3 py-1 rounded-full bg-zinc-800 text-zinc-400 text-xs border border-white/5">
                                Referral Code: {profile?.referralCode || "-"}
                            </span>
                        </div>
                    </div>

                    {/* Status Card */}
                    <div className="bg-zinc-900/50 border border-white/5 rounded-3xl p-8 flex flex-col justify-center">
                        <h3 className="text-zinc-400 uppercase tracking-widest text-sm font-semibold mb-4">Account Status</h3>
                        <div className="flex items-center gap-4 mb-6">
                            <div className={`w-3 h-3 rounded-full ${profile?.status === 'active' ? 'bg-green-500 shadow-[0_0_10px_rgba(34,197,94,0.5)]' : 'bg-red-500'}`} />
                            <span className="text-xl capitalize">{profile?.status}</span>
                        </div>
                        <div className="mt-auto">
                            <button className="w-full py-3 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl transition-all text-sm font-medium">
                                View Benefits
                            </button>
                        </div>
                    </div>
                </div>

                {/* Activity Table */}
                <div className="bg-white/5 border border-white/10 backdrop-blur-md rounded-3xl p-8">
                    <h2 className="text-2xl font-bold mb-6 flex items-center gap-3">
                        <span className="w-2 h-8 bg-amber-500 rounded-full" />
                        Activity History
                    </h2>

                    {activity.length === 0 ? (
                        <p className="text-zinc-500 italic">No activity recorded yet.</p>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="w-full text-left border-collapse">
                                <thead>
                                    <tr className="text-zinc-500 border-b border-white/5">
                                        <th className="pb-4 font-medium pl-4">Date</th>
                                        <th className="pb-4 font-medium">Activity</th>
                                        <th className="pb-4 font-medium">Source</th>
                                        <th className="pb-4 font-medium text-right pr-4">Points</th>
                                    </tr>
                                </thead>
                                <tbody className="text-sm">
                                    {activity.map((log) => (
                                        <tr key={log.id} className="border-b border-white/5 hover:bg-white/5 transition-colors">
                                            <td className="py-4 pl-4 text-zinc-400">
                                                {new Date(log.createdAt).toLocaleDateString()}
                                            </td>
                                            <td className="py-4 font-medium text-white">
                                                {log.reason}
                                                {log.onchainTx && (
                                                    <span className="ml-2 px-2 py-0.5 rounded bg-blue-500/20 text-blue-300 text-[10px] border border-blue-500/30">
                                                        On-chain
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
        </div>
    );
}
