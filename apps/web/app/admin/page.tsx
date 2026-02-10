"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/src/hooks/useAuth";
import api from "@/src/lib/api-client";
import RejectModal from "../../components/RejectModal";

interface RedeemRequest {
    id: string;
    userName: string;
    itemName: string;
    pointsUsed: number;
    whatsapp: string;
    status: string;
    createdAt: string;
}

export default function AdminPage() {
    const { user, isAuthenticated, logout } = useAuth();
    const router = useRouter();
    const [requests, setRequests] = useState<RedeemRequest[]>([]);
    const [loading, setLoading] = useState(true);
    const [processing, setProcessing] = useState<string | null>(null);
    const [rejectTarget, setRejectTarget] = useState<RedeemRequest | null>(null);

    const isAdmin = user?.role === 'admin' || user?.role === 'super_admin' || user?.role === 'admin_input' || user?.role === 'admin_view';

    const fetchRequests = async () => {
        if (!user || !isAdmin) return;
        try {
            const res = await api.get(`/v1/admin/redeem/pending?adminId=${user.userId}`);
            if (res.data.success) {
                setRequests(res.data.data);
            }
        } catch (error) {
            console.error("Fetch error:", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (isAuthenticated && isAdmin) {
            fetchRequests();
        } else if (isAuthenticated && !isAdmin) {
            setLoading(false);
        }
    }, [isAuthenticated, isAdmin]);

    const handleStatusUpdate = async (requestId: string, status: 'processing' | 'ready' | 'completed') => {
        if (!user) return;
        setProcessing(requestId);
        try {
            const res = await api.patch(`/v1/admin/redeem/${requestId}`, {
                status,
                adminId: user.userId,
            });

            if (res.data.success) {
                if (status === 'completed') {
                    setRequests(prev => prev.filter(r => r.id !== requestId));
                } else {
                    fetchRequests();
                }
            } else {
                alert(res.data.message);
            }
        } catch (error: any) {
            alert(error.response?.data?.message || "Action failed");
        } finally {
            setProcessing(null);
        }
    };

    if (!isAuthenticated || !isAdmin) {
        return (
            <div className="min-h-screen bg-zinc-950 flex flex-col items-center justify-center text-white p-6">
                <div className="w-16 h-16 bg-red-500/10 rounded-full flex items-center justify-center mb-6">
                    <span className="text-3xl">🔒</span>
                </div>
                <h1 className="text-2xl font-bold mb-2">Restricted Access</h1>
                <p className="text-zinc-500 mb-8 max-w-md text-center">
                    Area ini khusus untuk Administrator. Silakan masuk dengan akun Admin Anda.
                </p>
                <button
                    onClick={() => router.push('/login')}
                    className="px-8 py-3 bg-amber-500 text-black font-bold rounded-xl"
                >
                    Sign In as Admin
                </button>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-zinc-950 text-white p-6 md:p-12">
            {/* Reject Modal */}
            {rejectTarget && (
                <RejectModal
                    requestId={rejectTarget.id}
                    itemName={rejectTarget.itemName}
                    adminId={user.userId}
                    onClose={() => setRejectTarget(null)}
                    onSuccess={fetchRequests}
                />
            )}

            <header className="flex justify-between items-center mb-12">
                <div>
                    <h1 className="text-3xl font-bold text-white mb-2 underline decoration-amber-500/30 underline-offset-8">
                        <span className="text-amber-500">Admin</span> Dashboard
                    </h1>
                    <p className="text-zinc-400 mt-4">Approval System & User Management</p>
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

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Stats / Sidebar */}
                <div className="space-y-6">
                    <div className="bg-zinc-900 border border-white/5 rounded-3xl p-8 shadow-xl">
                        <h3 className="text-zinc-400 text-sm font-medium uppercase tracking-wider mb-4">Pending Requests</h3>
                        <p className="text-6xl font-black text-amber-500 leading-none">{requests.length}</p>
                    </div>

                    <div className="bg-zinc-900 border border-white/5 rounded-3xl p-8 shadow-xl">
                        <h3 className="text-zinc-400 text-sm font-medium uppercase tracking-wider mb-4">System Status</h3>
                        <div className="flex items-center gap-3 text-green-400 font-bold">
                            <span className="w-3 h-3 bg-green-500 rounded-full animate-pulse shadow-[0_0_10px_rgba(34,197,94,0.5)]" />
                            Operational
                        </div>
                    </div>
                </div>

                {/* Main Content: Pending Table */}
                <div className="lg:col-span-2">
                    <div className="bg-zinc-900 border border-white/5 rounded-3xl overflow-hidden shadow-2xl">
                        <div className="p-8 border-b border-white/5 flex justify-between items-center">
                            <h2 className="text-2xl font-bold flex items-center gap-3">
                                <span className="w-1.5 h-6 bg-amber-500 rounded-full" />
                                Redeem Queue
                            </h2>
                            <button onClick={fetchRequests} className="px-4 py-2 bg-white/5 hover:bg-white/10 rounded-lg text-xs font-bold transition-all">Refresh</button>
                        </div>

                        {loading ? (
                            <div className="p-20 text-center text-zinc-500 animate-pulse">Loading requests...</div>
                        ) : requests.length === 0 ? (
                            <div className="p-20 text-center text-zinc-500 italic">
                                No pending requests found.
                            </div>
                        ) : (
                            <div className="overflow-x-auto">
                                <table className="w-full text-left">
                                    <thead className="bg-white/5 text-zinc-400 text-xs font-bold uppercase tracking-widest">
                                        <tr>
                                            <th className="p-6">User</th>
                                            <th className="p-6">Item</th>
                                            <th className="p-6">Status</th>
                                            <th className="p-6 text-right">Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-white/5">
                                        {requests.map((req) => (
                                            <tr key={req.id} className="hover:bg-white/[0.02] transition-colors">
                                                <td className="p-6">
                                                    <div className="font-bold text-white text-lg">{req.userName}</div>
                                                    <div className="text-sm text-zinc-500 font-mono mt-1">{req.whatsapp}</div>
                                                </td>
                                                <td className="p-6">
                                                    <div className="text-amber-500 font-bold">{req.itemName}</div>
                                                    <div className="text-sm text-zinc-500 mt-1">{req.pointsUsed.toLocaleString()} Pts</div>
                                                </td>
                                                <td className="p-6">
                                                    <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase border ${req.status === 'pending' ? 'bg-yellow-500/10 text-yellow-500 border-yellow-500/30' :
                                                        req.status === 'processing' ? 'bg-blue-500/10 text-blue-500 border-blue-500/30' :
                                                            'bg-green-500/10 text-green-500 border-green-500/30'
                                                        }`}>
                                                        {req.status === 'pending' ? 'MENUNGGU' : req.status === 'processing' ? 'DIPROSES' : req.status}
                                                    </span>
                                                </td>
                                                <td className="p-6 text-right">
                                                    <div className="flex items-center justify-end gap-2">
                                                        {req.status === 'pending' && (
                                                            <button
                                                                onClick={() => handleStatusUpdate(req.id, 'processing')}
                                                                disabled={processing === req.id}
                                                                className="px-4 py-2 bg-blue-500/10 text-blue-400 hover:bg-blue-500/20 border border-blue-500/30 rounded-xl text-xs font-bold transition-all disabled:opacity-50"
                                                            >
                                                                Process
                                                            </button>
                                                        )}
                                                        {req.status === 'processing' && (
                                                            <button
                                                                onClick={() => handleStatusUpdate(req.id, 'ready')}
                                                                disabled={processing === req.id}
                                                                className="px-4 py-2 bg-amber-500/10 text-amber-500 hover:bg-amber-500/20 border border-amber-500/30 rounded-xl text-xs font-bold transition-all disabled:opacity-50"
                                                            >
                                                                Ready
                                                            </button>
                                                        )}
                                                        {req.status === 'ready' && (
                                                            <button
                                                                onClick={() => handleStatusUpdate(req.id, 'completed')}
                                                                disabled={processing === req.id}
                                                                className="px-4 py-2 bg-green-500/10 text-green-500 hover:bg-green-500/20 border border-green-500/30 rounded-xl text-xs font-bold transition-all disabled:opacity-50"
                                                            >
                                                                Complete
                                                            </button>
                                                        )}
                                                        <button
                                                            onClick={() => setRejectTarget(req)}
                                                            disabled={processing === req.id}
                                                            className="px-4 py-2 bg-red-500/10 text-red-400 hover:bg-red-500/20 border border-red-500/30 rounded-xl text-xs font-bold transition-all disabled:opacity-50"
                                                        >
                                                            Reject
                                                        </button>
                                                    </div>
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
        </div>
    );
}
