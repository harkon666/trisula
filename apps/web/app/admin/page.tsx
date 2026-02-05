"use client";

import { useActiveAccount } from "thirdweb/react";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import ConnectWallet from "../../components/ConnectWallet";
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
    const account = useActiveAccount();
    const router = useRouter();
    const [requests, setRequests] = useState<RedeemRequest[]>([]);
    const [loading, setLoading] = useState(true);
    const [processing, setProcessing] = useState<string | null>(null);
    const [isAdmin, setIsAdmin] = useState<boolean | null>(null);
    const [rejectTarget, setRejectTarget] = useState<RedeemRequest | null>(null);

    // Fetch user role from database
    const checkAdminRole = async () => {
        if (!account) {
            setIsAdmin(false);
            return;
        }
        try {
            const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000";
            const res = await fetch(`${apiUrl}/api/v1/user/profile?walletAddress=${account.address}`);
            const json = await res.json();

            if (json.success && json.data) {
                const role = json.data.role;
                setIsAdmin(role === 'admin' || role === 'super_admin');
            } else {
                setIsAdmin(false);
            }
        } catch (error) {
            console.error("Role check error:", error);
            setIsAdmin(false);
        }
    };

    const fetchRequests = async () => {
        if (!account) return;
        try {
            const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000";
            const res = await fetch(`${apiUrl}/api/v1/admin/redeem/pending?adminWallet=${account.address}`);
            const json = await res.json();

            if (json.success) {
                setRequests(json.data);
            }
        } catch (error) {
            console.error("Fetch error:", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        checkAdminRole();
    }, [account]);

    useEffect(() => {
        if (isAdmin === true) {
            fetchRequests();
        } else if (isAdmin === false) {
            setLoading(false);
        }
    }, [isAdmin]);

    const handleStatusUpdate = async (requestId: string, status: 'processing' | 'ready' | 'completed') => {
        if (!account) return;
        setProcessing(requestId);
        try {
            const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000";
            const res = await fetch(`${apiUrl}/api/v1/admin/redeem/${requestId}`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    status,
                    adminWallet: account.address,
                })
            });

            const json = await res.json();
            if (json.success) {
                if (status === 'completed') {
                    setRequests(prev => prev.filter(r => r.id !== requestId));
                } else {
                    fetchRequests();
                }
            } else {
                alert(json.message);
            }
        } catch (error) {
            alert("Action failed");
        } finally {
            setProcessing(null);
        }
    };

    // Loading state while checking role
    if (isAdmin === null) {
        return (
            <div className="min-h-screen bg-zinc-950 flex items-center justify-center text-amber-500 animate-pulse">
                Verifying access...
            </div>
        );
    }

    if (!account || !isAdmin) {
        return (
            <div className="min-h-screen bg-zinc-950 flex flex-col items-center justify-center text-white p-6">
                <div className="w-16 h-16 bg-red-500/10 rounded-full flex items-center justify-center mb-6">
                    <span className="text-3xl">🔒</span>
                </div>
                <h1 className="text-2xl font-bold mb-2">Restricted Access</h1>
                <p className="text-zinc-500 mb-8 max-w-md text-center">
                    Area ini khusus untuk Administrator. Silakan hubungkan wallet yang terdaftar sebagai Admin.
                </p>
                <ConnectWallet />
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-zinc-950 text-white p-6 md:p-12">
            {/* Reject Modal */}
            {rejectTarget && account && (
                <RejectModal
                    requestId={rejectTarget.id}
                    itemName={rejectTarget.itemName}
                    adminWallet={account.address}
                    onClose={() => setRejectTarget(null)}
                    onSuccess={fetchRequests}
                />
            )}

            <header className="flex justify-between items-center mb-12">
                <div>
                    <h1 className="text-3xl font-bold text-white mb-2">
                        <span className="text-amber-500">Admin</span> Dashboard
                    </h1>
                    <p className="text-zinc-400">Approval System & User Management</p>
                </div>
                <ConnectWallet />
            </header>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Stats / Sidebar */}
                <div className="space-y-6">
                    <div className="bg-zinc-900 border border-white/5 rounded-3xl p-6">
                        <h3 className="text-zinc-400 text-sm font-medium uppercase tracking-wider mb-4">Pending Requests</h3>
                        <p className="text-5xl font-bold text-white">{requests.length}</p>
                    </div>

                    <div className="bg-zinc-900 border border-white/5 rounded-3xl p-6">
                        <h3 className="text-zinc-400 text-sm font-medium uppercase tracking-wider mb-4">System Status</h3>
                        <div className="flex items-center gap-2 text-green-400">
                            <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                            Operational
                        </div>
                    </div>
                </div>

                {/* Main Content: Pending Table */}
                <div className="lg:col-span-2">
                    <div className="bg-zinc-900 border border-white/5 rounded-3xl overflow-hidden">
                        <div className="p-6 border-b border-white/5 flex justify-between items-center">
                            <h2 className="text-xl font-bold">Redeem Queue</h2>
                            <button onClick={fetchRequests} className="text-sm text-amber-500 hover:text-amber-400">Refresh</button>
                        </div>

                        {loading ? (
                            <div className="p-12 text-center text-zinc-500 animate-pulse">Loading requests...</div>
                        ) : requests.length === 0 ? (
                            <div className="p-12 text-center text-zinc-500">
                                No pending requests found.
                            </div>
                        ) : (
                            <div className="overflow-x-auto">
                                <table className="w-full text-left">
                                    <thead className="bg-white/5 text-zinc-400 text-sm font-medium">
                                        <tr>
                                            <th className="p-4">User</th>
                                            <th className="p-4">Item</th>
                                            <th className="p-4">Status</th>
                                            <th className="p-4 text-right">Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-white/5">
                                        {requests.map((req) => (
                                            <tr key={req.id} className="hover:bg-white/5 transition-colors">
                                                <td className="p-4">
                                                    <div className="font-bold text-white">{req.userName}</div>
                                                    <div className="text-xs text-zinc-500">{req.whatsapp}</div>
                                                </td>
                                                <td className="p-4">
                                                    <div className="text-amber-400">{req.itemName}</div>
                                                    <div className="text-xs text-zinc-500">{req.pointsUsed} Pts</div>
                                                </td>
                                                <td className="p-4">
                                                    <span className={`px-2 py-1 rounded text-xs font-bold uppercase ${req.status === 'pending' ? 'bg-yellow-500/20 text-yellow-400' :
                                                            req.status === 'processing' ? 'bg-blue-500/20 text-blue-400' :
                                                                'bg-green-500/20 text-green-400'
                                                        }`}>
                                                        {req.status}
                                                    </span>
                                                </td>
                                                <td className="p-4 text-right">
                                                    <div className="flex items-center justify-end gap-2">
                                                        {req.status === 'pending' && (
                                                            <button
                                                                onClick={() => handleStatusUpdate(req.id, 'processing')}
                                                                disabled={processing === req.id}
                                                                className="px-3 py-1.5 bg-blue-500/20 text-blue-400 hover:bg-blue-500/30 rounded-lg text-xs font-bold transition-colors disabled:opacity-50"
                                                            >
                                                                Process
                                                            </button>
                                                        )}
                                                        {req.status === 'processing' && (
                                                            <button
                                                                onClick={() => handleStatusUpdate(req.id, 'ready')}
                                                                disabled={processing === req.id}
                                                                className="px-3 py-1.5 bg-amber-500/20 text-amber-400 hover:bg-amber-500/30 rounded-lg text-xs font-bold transition-colors disabled:opacity-50"
                                                            >
                                                                Ready
                                                            </button>
                                                        )}
                                                        {req.status === 'ready' && (
                                                            <button
                                                                onClick={() => handleStatusUpdate(req.id, 'completed')}
                                                                disabled={processing === req.id}
                                                                className="px-3 py-1.5 bg-green-500/20 text-green-400 hover:bg-green-500/30 rounded-lg text-xs font-bold transition-colors disabled:opacity-50"
                                                            >
                                                                Complete
                                                            </button>
                                                        )}
                                                        <button
                                                            onClick={() => setRejectTarget(req)}
                                                            disabled={processing === req.id}
                                                            className="px-3 py-1.5 bg-red-500/20 text-red-400 hover:bg-red-500/30 rounded-lg text-xs font-bold transition-colors disabled:opacity-50"
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
