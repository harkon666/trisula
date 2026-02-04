"use client";

import { useActiveAccount } from "thirdweb/react";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import ConnectWallet from "../../../components/ConnectWallet";

interface CatalogItem {
    id: number;
    name: string;
    pointsRequired: number;
    description?: string;
    isActive: boolean;
}

export default function RedeemPage() {
    const account = useActiveAccount();
    const router = useRouter();
    const [catalog, setCatalog] = useState<CatalogItem[]>([]);
    const [loading, setLoading] = useState(true);
    const [processing, setProcessing] = useState<number | null>(null);
    const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);
    const [userPoints, setUserPoints] = useState(0);

    // Fetch Catalog & User Points
    useEffect(() => {
        if (!account) return;

        const fetchData = async () => {
            try {
                const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000";

                // Fetch Catalog
                const catalogRes = await fetch(`${apiUrl}/api/v1/redeem/catalog`);
                const catalogJson = await catalogRes.json();
                if (catalogJson.success) {
                    setCatalog(catalogJson.data);
                }

                // Fetch User Profile for Points
                const profileRes = await fetch(`${apiUrl}/api/v1/user/profile?walletAddress=${account.address}`);
                const profileJson = await profileRes.json();
                if (profileJson.success) {
                    setUserPoints(profileJson.data.points);
                }

            } catch (error) {
                console.error("Fetch error:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, [account]);

    const handleRedeem = async (item: CatalogItem) => {
        if (!account) return;
        if (userPoints < item.pointsRequired) {
            setMessage({ type: 'error', text: "Poin Anda tidak mencukupi!" });
            return;
        }

        const confirm = window.confirm(`Redeem ${item.name} for ${item.pointsRequired} points?`);
        if (!confirm) return;

        setProcessing(item.id);
        setMessage(null);

        try {
            const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000";

            // Need userId... retrieving from profile fetch would be better but for now let's rely on backend solving it? 
            // Wait, api/redeem/request needs userId (UUID).
            // I need to get userId from the profile response first.
            // Let's refactor to store userId or fetch it.

            // QUICK FIX: Re-fetch profile to get ID or store it in state.
            const profileRes = await fetch(`${apiUrl}/api/v1/user/profile?walletAddress=${account.address}`);
            const profileJson = await profileRes.json();
            const userId = profileJson.data.id;

            const response = await fetch(`${apiUrl}/api/v1/redeem/request`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    userId,
                    catalogId: item.id,
                    whatsappNumber: "0000000000", // TODO: Ask user input
                }),
            });

            const result = await response.json();

            if (response.ok) {
                setMessage({ type: 'success', text: "Redeem berhasil! Admin akan menghubungi Anda." });
                setUserPoints(prev => prev - item.pointsRequired); // Optimistic update
            } else {
                setMessage({ type: 'error', text: result.message || "Gagal redeem." });
            }

        } catch (error) {
            setMessage({ type: 'error', text: "Terjadi kesalahan sistem." });
        } finally {
            setProcessing(null);
        }
    };

    if (loading) {
        return <div className="min-h-screen bg-zinc-950 flex items-center justify-center text-amber-500 animate-pulse">Loading Rewards...</div>;
    }

    return (
        <div className="min-h-screen bg-zinc-950 text-white p-6 md:p-12 relative overflow-hidden">
            {/* Background Effects */}
            <div className="absolute top-0 right-0 w-96 h-96 bg-amber-500/10 blur-[120px] rounded-full pointer-events-none" />

            <div className="max-w-6xl mx-auto relative z-10">
                <header className="flex justify-between items-center mb-12">
                    <div>
                        <button
                            onClick={() => router.push('/dashboard')}
                            className="text-zinc-400 hover:text-white mb-2 flex items-center gap-2 transition-colors"
                        >
                            ← Back to Dashboard
                        </button>
                        <h1 className="text-4xl font-bold text-white">Reward Catalog</h1>
                        <p className="text-zinc-400">Tukarkan poin Anda dengan hadiah eksklusif.</p>
                    </div>
                    <div className="text-right">
                        <p className="text-xs text-zinc-500 uppercase tracking-widest">Your Balance</p>
                        <p className="text-3xl font-bold text-amber-500">{userPoints.toLocaleString()} Pts</p>
                    </div>
                </header>

                {message && (
                    <div className={`mb-8 p-4 rounded-xl border ${message.type === 'success' ? 'bg-green-500/10 border-green-500/30 text-green-300' : 'bg-red-500/10 border-red-500/30 text-red-300'}`}>
                        {message.text}
                    </div>
                )}

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {catalog.length === 0 ? (
                        <div className="col-span-3 text-center py-20 text-zinc-500 bg-white/5 rounded-3xl border border-white/5">
                            Belum ada reward yang tersedia saat ini.
                        </div>
                    ) : (
                        catalog.map((item) => (
                            <div key={item.id} className="bg-white/5 border border-white/10 hover:border-amber-500/50 transition-all rounded-3xl p-6 flex flex-col group relative overflow-hidden">
                                <div className="absolute inset-0 bg-gradient-to-b from-transparent to-black/50 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />

                                <div className="bg-zinc-900 w-full h-40 rounded-2xl mb-6 flex items-center justify-center text-zinc-700">
                                    [Image Placeholder]
                                </div>

                                <h3 className="text-xl font-bold text-white mb-2">{item.name}</h3>
                                <p className="text-zinc-400 text-sm mb-4 flex-grow">{item.description}</p>

                                <div className="mt-auto pt-6 border-t border-white/5 flex items-center justify-between">
                                    <span className="text-amber-400 font-bold">{item.pointsRequired.toLocaleString()} Pts</span>
                                    <button
                                        onClick={() => handleRedeem(item)}
                                        disabled={userPoints < item.pointsRequired || processing === item.id}
                                        className="px-4 py-2 bg-white text-black font-bold rounded-lg hover:bg-amber-400 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                                    >
                                        {processing === item.id ? "Processing..." : "Redeem"}
                                    </button>
                                </div>
                            </div>
                        ))
                    )}
                </div>
            </div>
        </div>
    );
}
