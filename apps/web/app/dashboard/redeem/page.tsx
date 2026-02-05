"use client";

import { useActiveAccount } from "thirdweb/react";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import RedeemButton from "../../../components/RedeemButton";
import StatusTracker from "../../../components/StatusTracker";
import CancelButton from "../../../components/CancelButton";

interface CatalogItem {
    id: number;
    name: string;
    pointsRequired: number;
    description?: string;
    isActive: boolean;
}

interface RedemptionRequest {
    id: string;
    itemName: string;
    pointsUsed: number;
    status: 'pending' | 'processing' | 'ready' | 'completed' | 'cancelled' | 'rejected';
    createdAt: string;
    updatedAt: string;
    txHash?: string | null;
}

export default function RedeemPage() {
    const account = useActiveAccount();
    const router = useRouter();
    const [catalog, setCatalog] = useState<CatalogItem[]>([]);
    const [myRequests, setMyRequests] = useState<RedemptionRequest[]>([]);
    const [loading, setLoading] = useState(true);
    const [userPoints, setUserPoints] = useState(0);
    const [userId, setUserId] = useState<string | null>(null);

    // activeRequest is the most recent incomplete request to show in the Tracker
    const activeRequest = myRequests.find(r => ['pending', 'processing', 'ready'].includes(r.status));

    // Fetch All Data
    const fetchData = async () => {
        if (!account) return;
        try {
            const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000";

            // 1. Fetch Profile (ID & Points)
            const profileRes = await fetch(`${apiUrl}/api/v1/user/profile?walletAddress=${account.address}`);
            const profileJson = await profileRes.json();
            if (profileJson.success) {
                setUserId(profileJson.data.id);
                setUserPoints(profileJson.data.points);
            }

            // 2. Fetch Catalog
            const catalogRes = await fetch(`${apiUrl}/api/v1/redeem/catalog`);
            const catalogJson = await catalogRes.json();
            if (catalogJson.success) {
                setCatalog(catalogJson.data);
            }

            // 3. Fetch My Requests if we have ID
            if (profileJson.data?.id) {
                const requestsRes = await fetch(`${apiUrl}/api/v1/redeem/my-requests?userId=${profileJson.data.id}`);
                const requestsJson = await requestsRes.json();
                if (requestsJson.success) {
                    setMyRequests(requestsJson.data);
                }
            }

        } catch (error) {
            console.error("Fetch error:", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, [account]);

    const handleRedeemSuccess = () => {
        // Refresh data to show new balance and new request in list
        fetchData();
    };

    if (loading) {
        return <div className="min-h-screen bg-zinc-950 flex items-center justify-center text-amber-500 animate-pulse">Loading Rewards...</div>;
    }

    return (
        <div className="min-h-screen bg-zinc-950 text-white p-6 md:p-12 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-96 h-96 bg-amber-500/10 blur-[120px] rounded-full pointer-events-none" />

            <div className="max-w-6xl mx-auto relative z-10">
                <header className="flex flex-col md:flex-row justify-between items-start md:items-center mb-12 gap-6">
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
                    <div className="bg-white/5 border border-white/10 rounded-2xl p-4 flex flex-col items-end">
                        <p className="text-xs text-zinc-500 uppercase tracking-widest mb-1">Your Balance</p>
                        <p className="text-3xl font-bold text-amber-500">{userPoints.toLocaleString()} Pts</p>
                    </div>
                </header>

                {/* Status Tracker for Active Order */}
                {activeRequest && (
                    <div className="mb-12 bg-zinc-900/50 p-8 rounded-3xl border border-amber-500/20 shadow-[0_0_30px_rgba(245,158,11,0.1)]">
                        <div className="flex justify-between items-start mb-8">
                            <div>
                                <h3 className="text-xl font-bold text-white">Lacak Pesanan: {activeRequest.itemName}</h3>
                                <p className="text-sm text-zinc-400">Order ID: #{activeRequest.id.substring(0, 8)}</p>
                            </div>
                            <div className="text-right flex flex-col items-end gap-2">
                                <span className="text-amber-500 font-bold">{activeRequest.pointsUsed.toLocaleString()} Pts</span>
                                {userId && (
                                    <CancelButton
                                        requestId={activeRequest.id}
                                        userId={userId}
                                        status={activeRequest.status}
                                        onSuccess={handleRedeemSuccess}
                                    />
                                )}
                            </div>
                        </div>

                        <StatusTracker
                            status={activeRequest.status}
                            txHash={activeRequest.txHash}
                            updatedAt={activeRequest.updatedAt}
                        />
                    </div>
                )}

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-20">
                    {catalog.length === 0 ? (
                        <div className="col-span-3 text-center py-20 text-zinc-500 bg-white/5 rounded-3xl border border-white/5">
                            Belum ada reward yang tersedia saat ini.
                        </div>
                    ) : (
                        catalog.map((item) => (
                            <div key={item.id} className="bg-white/5 border border-white/10 hover:border-amber-500/50 transition-all rounded-3xl p-6 flex flex-col group">
                                <div className="bg-zinc-900 w-full h-40 rounded-2xl mb-6 flex items-center justify-center text-zinc-700 text-4xl">
                                    🎁
                                </div>
                                <h3 className="text-xl font-bold text-white mb-2">{item.name}</h3>
                                <p className="text-zinc-400 text-sm mb-4 flex-grow">{item.description}</p>
                                <div className="mt-auto pt-6 border-t border-white/5">
                                    <RedeemButton
                                        item={item}
                                        userId={userId!}
                                        disabled={userPoints < item.pointsRequired}
                                        onSuccess={handleRedeemSuccess}
                                    />
                                    {userPoints < item.pointsRequired && (
                                        <p className="text-center text-xs text-red-500/50 mt-2">Poin tidak mencukupi</p>
                                    )}
                                </div>
                            </div>
                        ))
                    )}
                </div>

                {/* History Section */}
                <div className="bg-white/5 border border-white/10 rounded-3xl p-8 mb-12">
                    <h2 className="text-2xl font-bold mb-6 flex items-center gap-3">
                        <span className="w-1.5 h-6 bg-amber-500 rounded-full" />
                        Riwayat Penukaran
                    </h2>

                    {myRequests.length === 0 ? (
                        <p className="text-zinc-500 italic">Belum ada riwayat penukaran hadiah.</p>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="w-full text-left">
                                <thead className="text-zinc-500 text-sm">
                                    <tr className="border-b border-white/5">
                                        <th className="pb-4 font-medium">Tanggal</th>
                                        <th className="pb-4 font-medium">Hadiah</th>
                                        <th className="pb-4 font-medium">Status</th>
                                        <th className="pb-4 font-medium text-right">Points</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {myRequests.map((req) => (
                                        <tr key={req.id} className="border-b border-white/5 hover:bg-white/5 transition-colors">
                                            <td className="py-4 text-zinc-400 text-sm">
                                                {new Date(req.createdAt).toLocaleDateString()}
                                            </td>
                                            <td className="py-4 font-medium text-white">
                                                {req.itemName}
                                            </td>
                                            <td className="py-4">
                                                <span className={`px-2 py-1 rounded-md text-[10px] uppercase font-bold border ${req.status === 'completed' ? 'bg-green-500/20 border-green-500/30 text-green-400' :
                                                    req.status === 'ready' ? 'bg-blue-500/20 border-blue-500/30 text-blue-400' :
                                                        req.status === 'rejected' || req.status === 'cancelled' ? 'bg-red-500/20 border-red-500/30 text-red-400' :
                                                            'bg-amber-500/20 border-amber-500/30 text-amber-400'
                                                    }`}>
                                                    {req.status}
                                                </span>
                                            </td>
                                            <td className="py-4 text-right font-bold text-zinc-400">
                                                -{req.pointsUsed}
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
