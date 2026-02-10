"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/src/hooks/useAuth";
import api from "@/src/lib/api-client";
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
    const { user, isAuthenticated } = useAuth();
    const router = useRouter();
    const [catalog, setCatalog] = useState<CatalogItem[]>([]);
    const [myRequests, setMyRequests] = useState<RedemptionRequest[]>([]);
    const [loading, setLoading] = useState(true);
    const [userPoints, setUserPoints] = useState(0);

    // activeRequest is the most recent incomplete request to show in the Tracker
    const activeRequest = myRequests.find(r => ['pending', 'processing', 'ready'].includes(r.status));

    // Fetch All Data
    const fetchData = async () => {
        if (!user) return;
        try {
            // 1. Fetch Profile (Points)
            const profileRes = await api.get('/v1/user/profile');
            if (profileRes.data.success) {
                setUserPoints(profileRes.data.data.points);
            }

            // 2. Fetch Catalog
            const catalogRes = await api.get('/v1/redeem/catalog');
            if (catalogRes.data.success) {
                setCatalog(catalogRes.data.data);
            }

            // 3. Fetch My Requests
            const requestsRes = await api.get('/v1/redeem/my-requests');
            if (requestsRes.data.success) {
                setMyRequests(requestsRes.data.data);
            }

        } catch (error) {
            console.error("Fetch error:", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (isAuthenticated && user) {
            fetchData();
        } else if (!isAuthenticated) {
            setLoading(false);
        }
    }, [isAuthenticated, user]);

    const handleRedeemSuccess = () => {
        // Refresh data to show new balance and new request in list
        fetchData();
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
                            className="text-zinc-400 hover:text-white mb-4 flex items-center gap-2 transition-colors border-b border-white/10 pb-1"
                        >
                            ← Kembali ke Dashboard
                        </button>
                        <h1 className="text-4xl font-black text-white underline decoration-amber-500/30 underline-offset-8">Katalog Reward</h1>
                        <p className="text-zinc-400 mt-4">Tukarkan Trisula Poin Anda dengan berbagai pilihan reward eksklusif.</p>
                    </div>
                    <div className="bg-amber-500/5 border border-amber-500/20 rounded-2xl p-6 flex flex-col items-end shadow-lg backdrop-blur-xl">
                        <p className="text-xs text-amber-500/70 uppercase tracking-widest font-black mb-1">Saldo Poin</p>
                        <p className="text-4xl font-black text-amber-500">{userPoints.toLocaleString()} <span className="text-sm">PTS</span></p>
                    </div>
                </header>

                {/* Status Tracker for Active Order */}
                {activeRequest && (
                    <div className="mb-12 bg-zinc-900/50 p-8 rounded-3xl border border-amber-500/20 shadow-[0_0_30px_rgba(245,158,11,0.1)]">
                        <div className="flex justify-between items-start mb-8">
                            <div>
                                <h3 className="text-xl font-bold text-white uppercase tracking-tight">Pelacakan Pesanan: {activeRequest.itemName}</h3>
                                <p className="text-sm text-zinc-500 font-mono mt-1">Order-ID: #{activeRequest.id.substring(0, 8)}</p>
                            </div>
                            <div className="text-right flex flex-col items-end gap-3">
                                <span className="text-amber-500 font-bold bg-amber-500/10 px-3 py-1 rounded-lg border border-amber-500/20">{activeRequest.pointsUsed.toLocaleString()} PTS</span>
                                {user && (
                                    <CancelButton
                                        requestId={activeRequest.id}
                                        userId={user.userId}
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

                <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-20">
                    {catalog.length === 0 ? (
                        <div className="col-span-3 text-center py-20 text-zinc-500 bg-white/5 rounded-3xl border border-white/5">
                            Belum ada reward yang tersedia saat ini.
                        </div>
                    ) : (
                        catalog.map((item) => (
                            <div key={item.id} className="bg-white/5 border border-white/10 hover:border-amber-500/50 transition-all rounded-3xl p-8 flex flex-col group relative overflow-hidden shadow-xl">
                                <div className="absolute top-0 right-0 w-24 h-24 bg-amber-500/5 blur-[40px] rounded-full pointer-events-none group-hover:bg-amber-500/10 transition-colors" />

                                <div className="bg-zinc-900 w-full h-48 rounded-2xl mb-6 flex items-center justify-center text-5xl shadow-inner border border-white/5 relative z-10">
                                    🎁
                                </div>
                                <h3 className="text-2xl font-black text-white mb-2">{item.name}</h3>
                                <p className="text-zinc-500 text-sm leading-relaxed mb-8 flex-grow">{item.description}</p>
                                <div className="mt-auto pt-6 border-t border-white/5">
                                    <RedeemButton
                                        item={item}
                                        userId={user?.userId!}
                                        disabled={userPoints < item.pointsRequired}
                                        onSuccess={handleRedeemSuccess}
                                    />
                                    {userPoints < item.pointsRequired && (
                                        <p className="text-center text-[10px] font-black uppercase text-red-500 mt-3 tracking-widest bg-red-500/10 py-1 rounded">Poin tidak mencukupi</p>
                                    )}
                                </div>
                            </div>
                        ))
                    )}
                </div>

                {/* History Section */}
                <div className="bg-white/5 border border-white/10 rounded-3xl p-8 mb-12 shadow-2xl">
                    <h2 className="text-2xl font-bold mb-8 flex items-center gap-3">
                        <span className="w-2 h-8 bg-amber-500 rounded-full" />
                        Riwayat Penukaran
                    </h2>

                    {myRequests.length === 0 ? (
                        <p className="text-zinc-500 italic">Belum ada riwayat penukaran hadiah.</p>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="w-full text-left">
                                <thead className="text-zinc-500 text-xs font-black uppercase tracking-widest">
                                    <tr className="border-b border-white/5">
                                        <th className="pb-6 px-4">Tanggal</th>
                                        <th className="pb-6 px-4">Item</th>
                                        <th className="pb-6 px-4">Status</th>
                                        <th className="pb-6 px-4 text-right">Potongan Poin</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {myRequests.map((req) => (
                                        <tr key={req.id} className="border-b border-white/5 hover:bg-white/[0.02] transition-colors">
                                            <td className="py-6 px-4 text-zinc-400 text-sm font-mono">
                                                {new Date(req.createdAt).toLocaleDateString('id-ID')}
                                            </td>
                                            <td className="py-6 px-4 font-bold text-white">
                                                {req.itemName}
                                            </td>
                                            <td className="py-6 px-4">
                                                <span className={`px-3 py-1 rounded-full text-[10px] uppercase font-black border ${req.status === 'completed' ? 'bg-green-500/10 border-green-500/30 text-green-400' :
                                                    req.status === 'ready' ? 'bg-blue-500/10 border-blue-500/30 text-blue-400' :
                                                        req.status === 'rejected' || req.status === 'cancelled' ? 'bg-red-500/10 border-red-500/30 text-red-400' :
                                                            'bg-amber-500/10 border-amber-500/30 text-amber-400'
                                                    }`}>
                                                    {req.status === 'completed' ? 'SELESAI' : req.status === 'ready' ? 'SIAP DIAMBIL' : req.status === 'pending' ? 'MENUNGGU' : req.status === 'cancelled' ? 'DIBATALKAN' : req.status === 'rejected' ? 'DITOLAK' : req.status}
                                                </span>
                                            </td>
                                            <td className="py-6 px-4 text-right font-black text-zinc-400">
                                                -{req.pointsUsed.toLocaleString()}
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
