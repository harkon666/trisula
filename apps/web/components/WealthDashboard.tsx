"use client";

import { useActiveAccount, useActiveWalletChain } from "thirdweb/react";
import { useEffect, useState } from "react";
import { client } from "../lib/thirdweb";

type WealthProfile = {
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
};

export default function WealthDashboard() {
    const account = useActiveAccount();
    const chain = useActiveWalletChain();
    const [profile, setProfile] = useState<WealthProfile | null>(null);
    const [loading, setLoading] = useState(false);

    const fetchWealth = async () => {
        if (!account) return;
        setLoading(true);
        try {
            const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/v1/wealth/summary?walletAddress=${account.address}`);
            const data = await response.json();

            if (data.error) {
                console.error("API Error:", data.error);
                return;
            }

            setProfile(data);
        } catch (e) {
            console.error("Network Error:", e);
        } finally {
            setLoading(false);
        }
    };

    const handleSimulateDeposit = async () => {
        if (!profile?.userId) return;
        setLoading(true);
        try {
            await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/v1/wealth/simulate-deposit`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    userId: profile.userId,
                    amount: 10000000
                })
            });
            // Refresh data
            await fetchWealth();
        } catch (e) {
            console.error(e);
            setLoading(false);
        }
    };

    useEffect(() => {
        if (account) {
            fetchWealth();
        }
    }, [account]);

    if (!account) return <div className="text-white/50 p-4 text-center">Please connect wallet to view wealth.</div>;
    if (loading && !profile) return <div className="text-amber-400 p-4 animate-pulse">Calculating Net Worth...</div>;
    if (!profile) return null;

    return (
        <div className="w-full max-w-4xl mx-auto p-6 space-y-6">
            {/* Total Wealth Card */}
            <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-gray-900 to-black border border-white/10 p-8">
                <div className="absolute top-0 right-0 p-4 opacity-10">
                    <svg className="w-32 h-32 text-amber-500" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M12 2L2 7l10 5 10-5-10-5zm0 9l2.5-1.25L12 8.5l-2.5 1.25L12 11zm0 2.5l-5-2.5-5 2.5L12 22l10-8.5-5-2.5-5 2.5z" />
                    </svg>
                </div>

                <h3 className="text-white/60 text-sm uppercase tracking-widest font-medium mb-1">Total Net Worth</h3>
                <div className="flex items-baseline space-x-2">
                    <span className="text-amber-500 text-2xl font-bold">Rp</span>
                    <span className="text-5xl font-extrabold text-white tracking-tight">
                        {profile.totalAum.toLocaleString('id-ID')}
                    </span>
                </div>

                {/* Tier Badge */}
                <div className="mt-4 flex items-center space-x-3">
                    <div className={`px-4 py-1 rounded-full text-xs font-bold uppercase tracking-wide border 
                        ${profile.tier === 'Platinum' ? 'bg-slate-300 text-slate-900 border-slate-400' :
                            profile.tier === 'Gold' ? 'bg-yellow-500/20 text-yellow-400 border-yellow-500' :
                                profile.tier === 'Silver' ? 'bg-gray-400/20 text-gray-300 border-gray-400' :
                                    'bg-orange-700/20 text-orange-600 border-orange-700'}`}>
                        {profile.tier} Member
                    </div>
                    {profile.nextTier && (
                        <span className="text-xs text-white/40">
                            +{profile.nextTier.needed.toLocaleString('id-ID')} to {profile.nextTier.name}
                        </span>
                    )}
                </div>
            </div>

            {/* Split View */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Fiat Card */}
                <div className="bg-white/5 border border-white/10 rounded-2xl p-6">
                    <div className="flex justify-between items-start mb-4">
                        <div className="p-3 bg-green-500/10 rounded-xl">
                            <span className="text-2xl">💵</span>
                        </div>
                        <span className="text-xs text-white/40 font-mono">FIAT (IDR)</span>
                    </div>
                    <div className="text-2xl font-bold text-white mb-1">
                        Rp {profile.fiatBalance.toLocaleString('id-ID')}
                    </div>
                    <p className="text-sm text-white/50">Stored in Trisula Banking</p>
                </div>

                {/* Crypto Card */}
                <div className="bg-white/5 border border-white/10 rounded-2xl p-6">
                    <div className="flex justify-between items-start mb-4">
                        <div className="p-3 bg-blue-500/10 rounded-xl">
                            <span className="text-2xl">⛓️</span>
                        </div>
                        <span className="text-xs text-white/40 font-mono">CRYPTO (Base)</span>
                    </div>
                    <div className="text-2xl font-bold text-white mb-1">
                        Rp {profile.cryptoBalance.toLocaleString('id-ID')}
                    </div>
                    <p className="text-sm text-white/50">On-chain Assets (Converted)</p>
                </div>
            </div>

            {/* Simulation Button (Dev Only) */}
            <div className="mt-8 pt-8 border-t border-white/10">
                <p className="text-xs text-amber-500/50 uppercase mb-4">Dev Tools</p>
                <div className="flex space-x-2">
                    <button
                        className="px-4 py-2 bg-white/10 hover:bg-white/20 text-white text-xs rounded-lg transition disabled:opacity-50"
                        onClick={handleSimulateDeposit}
                        disabled={loading}
                    >
                        {loading ? 'Processing...' : '+ Add Rp 10jt Fiat (Simulate)'}
                    </button>
                    <button
                        className="px-4 py-2 bg-white/10 hover:bg-white/20 text-white text-xs rounded-lg transition"
                        onClick={fetchWealth}
                    >
                        🔄 Refresh Data
                    </button>
                </div>
            </div>
        </div>
    );
}
