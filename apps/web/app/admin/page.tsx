"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/src/hooks/useAuth";
import api from "@/src/lib/api-client";
import { toast } from "sonner";
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

interface ActivationCode {
    id: number;
    code: string;
    isUsed: boolean;
    generatedByName: string;
    usedByName: string | null;
    createdAt: string;
}

export default function AdminPage() {
    const { user, isAuthenticated, logout } = useAuth();
    const router = useRouter();

    // UI State
    const [activeTab, setActiveTab] = useState<'redeem' | 'codes'>('redeem');
    const [loading, setLoading] = useState(true);

    // Data State
    const [requests, setRequests] = useState<RedeemRequest[]>([]);
    const [codes, setCodes] = useState<ActivationCode[]>([]);

    // Action State
    const [processing, setProcessing] = useState<string | number | null>(null);
    const [rejectTarget, setRejectTarget] = useState<RedeemRequest | null>(null);
    const [isGenerating, setIsGenerating] = useState(false);

    const isAdmin = user?.role === 'super_admin' || user?.role === 'admin_input' || user?.role === 'admin_view';
    const canManageCodes = user?.role === 'super_admin' || user?.role === 'admin_input';
    const isSuperAdmin = user?.role === 'super_admin';

    const fetchRequests = async () => {
        try {
            const res = await api.get('/v1/admin/redeem/pending');
            if (res.data.success) {
                setRequests(res.data.data);
            }
        } catch (error) {
            console.error("Fetch requests error:", error);
        }
    };

    const fetchCodes = async () => {
        try {
            const res = await api.get('/v1/admin/codes');
            if (res.data.success) {
                setCodes(res.data.data);
            }
        } catch (error) {
            console.error("Fetch codes error:", error);
        }
    };

    const fetchData = async () => {
        if (!user || !isAdmin) return;
        setLoading(true);
        try {
            await Promise.all([fetchRequests(), fetchCodes()]);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (isAuthenticated && isAdmin) {
            fetchData();
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
                toast.success(`Status updated to ${status}`);
            }
        } catch (error: any) {
            toast.error(error.response?.data?.message || "Action failed");
        } finally {
            setProcessing(null);
        }
    };

    const handleGenerateCode = async () => {
        setIsGenerating(true);
        try {
            const res = await api.post('/v1/admin/codes');
            if (res.data.success) {
                toast.success("Activation code generated!");
                fetchCodes();
            }
        } catch (error: any) {
            toast.error(error.response?.data?.message || "Failed to generate code");
        } finally {
            setIsGenerating(false);
        }
    };

    const handleDeleteCode = async (id: number) => {
        if (!confirm("Are you sure you want to delete this available code?")) return;
        setProcessing(id);
        try {
            const res = await api.delete(`/v1/admin/codes/${id}`);
            if (res.data.success) {
                toast.success("Code deleted successfully");
                setCodes(prev => prev.filter(c => c.id !== id));
            }
        } catch (error: any) {
            toast.error(error.response?.data?.message || "Delete failed");
        } finally {
            setProcessing(null);
        }
    };

    const copyToClipboard = (text: string) => {
        navigator.clipboard.writeText(text);
        toast.success("Code copied to clipboard!");
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
        <div className="min-h-screen bg-zinc-950 text-white p-6 md:p-12 relative overflow-hidden">
            {/* Background Ambience */}
            <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-amber-500/5 blur-[120px] rounded-full pointer-events-none" />

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

            <header className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-12 relative z-10">
                <div>
                    <h1 className="text-4xl font-black text-white mb-2 tracking-tight">
                        <span className="text-amber-500">TRISULA</span> ADMIN
                    </h1>
                    <p className="text-zinc-500 font-medium">Control Center & System Management</p>
                </div>

                <div className="flex items-center gap-3">
                    <button
                        onClick={() => router.push('/')}
                        className="px-5 py-2.5 bg-white/5 hover:bg-white/10 rounded-xl transition-all text-sm font-bold border border-white/10 flex items-center gap-2"
                    >
                        <span>🏠</span> Landing
                    </button>
                    <button
                        onClick={() => logout()}
                        className="px-5 py-2.5 bg-red-500/10 hover:bg-red-500/20 text-red-400 rounded-xl transition-all text-sm font-bold border border-red-500/20 flex items-center gap-2"
                    >
                        <span>🚪</span> Sign Out
                    </button>
                </div>
            </header>

            {/* Tab Navigation */}
            <nav className="flex items-center gap-2 mb-10 p-1.5 bg-zinc-900/50 border border-white/5 rounded-2xl w-fit relative z-10">
                <button
                    onClick={() => setActiveTab('redeem')}
                    className={`px-8 py-3 rounded-xl text-sm font-black uppercase tracking-widest transition-all ${activeTab === 'redeem' ? 'bg-amber-500 text-black shadow-lg shadow-amber-500/20' : 'text-zinc-500 hover:text-zinc-300'}`}
                >
                    Redeem Queue
                </button>
                <button
                    onClick={() => setActiveTab('codes')}
                    className={`px-8 py-3 rounded-xl text-sm font-black uppercase tracking-widest transition-all ${activeTab === 'codes' ? 'bg-amber-500 text-black shadow-lg shadow-amber-500/20' : 'text-zinc-500 hover:text-zinc-300'}`}
                >
                    Agent Codes
                </button>
            </nav>

            <div className="grid grid-cols-1 lg:grid-cols-4 gap-8 relative z-10">
                {/* Stats Section */}
                <div className="lg:col-span-1 space-y-6">
                    {activeTab === 'redeem' ? (
                        <div className="bg-zinc-900 border border-white/5 rounded-[32px] p-8 shadow-xl relative overflow-hidden group">
                            <div className="absolute top-0 right-0 w-32 h-32 bg-amber-500/10 blur-2xl rounded-full -mr-16 -mt-16 transition-transform group-hover:scale-110" />
                            <h3 className="text-zinc-500 text-xs font-black uppercase tracking-widest mb-4">Pending Requests</h3>
                            <p className="text-7xl font-black text-amber-500 drop-shadow-2xl">{requests.length}</p>
                        </div>
                    ) : (
                        <div className="space-y-4">
                            <div className="bg-zinc-900 border border-white/5 rounded-[32px] p-8 shadow-xl relative overflow-hidden">
                                <h3 className="text-zinc-500 text-xs font-black uppercase tracking-widest mb-4">Available Codes</h3>
                                <p className="text-6xl font-black text-amber-500">{codes.filter(c => !c.isUsed).length}</p>
                            </div>
                            <div className="bg-zinc-900 border border-white/5 rounded-[32px] p-8 shadow-xl relative overflow-hidden">
                                <h3 className="text-zinc-500 text-xs font-black uppercase tracking-widest mb-4">Codes Used</h3>
                                <p className="text-6xl font-black text-zinc-400">{codes.filter(c => c.isUsed).length}</p>
                            </div>
                        </div>
                    )}

                    <div className="bg-zinc-900 border border-white/5 rounded-[32px] p-8 shadow-xl relative overflow-hidden">
                        <h3 className="text-zinc-500 text-xs font-black uppercase tracking-widest mb-4">Admin Status</h3>
                        <div className="flex items-center gap-3">
                            <span className="w-3 h-3 bg-green-500 rounded-full animate-pulse shadow-[0_0_15px_rgba(34,197,94,0.6)]" />
                            <span className="font-black text-green-500 uppercase tracking-widest text-sm italic">{user.role}</span>
                        </div>
                    </div>
                </div>

                {/* Main Content Area */}
                <div className="lg:col-span-3">
                    <div className="bg-zinc-900 border border-white/5 rounded-[32px] overflow-hidden shadow-2xl backdrop-blur-sm bg-zinc-900/80">
                        {activeTab === 'redeem' ? (
                            <>
                                <div className="p-8 border-b border-white/5 flex justify-between items-center">
                                    <h2 className="text-2xl font-black flex items-center gap-3 uppercase tracking-tight">
                                        <span className="w-1.5 h-6 bg-amber-500 rounded-full" />
                                        Withdrawal Queue
                                    </h2>
                                    <button onClick={fetchRequests} className="p-2.5 bg-white/5 hover:bg-white/10 rounded-xl transition-all border border-white/10 text-xl" title="Refresh">🔄</button>
                                </div>

                                {loading ? (
                                    <div className="p-20 text-center text-zinc-500 font-bold uppercase tracking-widest animate-pulse">Scanning database...</div>
                                ) : requests.length === 0 ? (
                                    <div className="p-32 text-center">
                                        <div className="text-4xl mb-4 opacity-20">📭</div>
                                        <div className="text-zinc-500 font-black uppercase tracking-widest italic text-sm">Target Clear. No Pending Data.</div>
                                    </div>
                                ) : (
                                    <div className="overflow-x-auto">
                                        <table className="w-full text-left">
                                            <thead className="bg-white/5 text-zinc-500 text-[10px] font-black uppercase tracking-[0.2em] border-b border-white/5">
                                                <tr>
                                                    <th className="px-8 py-6">Member Identity</th>
                                                    <th className="px-8 py-6">Requested Reward</th>
                                                    <th className="px-8 py-6">Current Status</th>
                                                    <th className="px-8 py-6 text-right">Approval Actions</th>
                                                </tr>
                                            </thead>
                                            <tbody className="divide-y divide-white/5">
                                                {requests.map((req) => (
                                                    <tr key={req.id} className="group hover:bg-white/[0.03] transition-colors">
                                                        <td className="px-8 py-6">
                                                            <div className="font-black text-white text-lg tracking-tight group-hover:text-amber-500 transition-colors uppercase">{req.userName}</div>
                                                            <div className="text-xs text-zinc-500 font-bold mt-1 tracking-widest">{req.whatsapp}</div>
                                                        </td>
                                                        <td className="px-8 py-6">
                                                            <div className="text-white font-bold">{req.itemName}</div>
                                                            <div className="text-[10px] text-amber-500/50 font-black mt-1 uppercase tracking-widest">{req.pointsUsed.toLocaleString()} Points Used</div>
                                                        </td>
                                                        <td className="px-8 py-6">
                                                            <span className={`px-4 py-1.5 rounded-full text-[9px] font-black uppercase tracking-[0.15em] border ${req.status === 'pending' ? 'bg-yellow-500/10 text-yellow-500 border-yellow-500/20 shadow-[0_0_15px_rgba(234,179,8,0.1)]' :
                                                                req.status === 'processing' ? 'bg-cyan-500/10 text-cyan-500 border-cyan-500/20' :
                                                                    'bg-emerald-500/10 text-emerald-500 border-emerald-500/20'
                                                                }`}>
                                                                {req.status === 'pending' ? 'Waiting' : req.status === 'processing' ? 'Processing' : req.status}
                                                            </span>
                                                        </td>
                                                        <td className="px-8 py-6 text-right">
                                                            <div className="flex items-center justify-end gap-2 opacity-60 group-hover:opacity-100 transition-opacity">
                                                                {req.status === 'pending' && (
                                                                    <button
                                                                        onClick={() => handleStatusUpdate(req.id, 'processing')}
                                                                        disabled={!!processing}
                                                                        className="px-4 py-2 bg-zinc-800 text-cyan-500 hover:bg-cyan-500 hover:text-black border border-cyan-500/30 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all disabled:opacity-50"
                                                                    >
                                                                        Process
                                                                    </button>
                                                                )}
                                                                {req.status === 'processing' && (
                                                                    <button
                                                                        onClick={() => handleStatusUpdate(req.id, 'ready')}
                                                                        disabled={!!processing}
                                                                        className="px-4 py-2 bg-zinc-800 text-amber-500 hover:bg-amber-500 hover:text-black border border-amber-500/30 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all disabled:opacity-50"
                                                                    >
                                                                        Ship
                                                                    </button>
                                                                )}
                                                                {req.status === 'ready' && (
                                                                    <button
                                                                        onClick={() => handleStatusUpdate(req.id, 'completed')}
                                                                        disabled={!!processing}
                                                                        className="px-4 py-2 bg-zinc-800 text-emerald-500 hover:bg-emerald-500 hover:text-black border border-emerald-500/30 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all disabled:opacity-50"
                                                                    >
                                                                        Finish
                                                                    </button>
                                                                )}
                                                                <button
                                                                    onClick={() => setRejectTarget(req)}
                                                                    disabled={!!processing}
                                                                    className="px-4 py-2 bg-zinc-800 text-red-500 hover:bg-red-500 hover:text-black border border-red-500/30 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all disabled:opacity-50"
                                                                >
                                                                    Void
                                                                </button>
                                                            </div>
                                                        </td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
                                )}
                            </>
                        ) : (
                            <>
                                <div className="p-8 border-b border-white/5 flex justify-between items-center">
                                    <h2 className="text-2xl font-black flex items-center gap-3 uppercase tracking-tight">
                                        <span className="w-1.5 h-6 bg-amber-500 rounded-full" />
                                        Partner Activation Codes
                                    </h2>
                                    <div className="flex items-center gap-2">
                                        <button onClick={fetchCodes} className="p-2.5 bg-white/5 hover:bg-white/10 rounded-xl transition-all border border-white/10 text-xl" title="Refresh">🔄</button>
                                        {canManageCodes && (
                                            <button
                                                onClick={handleGenerateCode}
                                                disabled={isGenerating}
                                                className="px-6 py-2.5 bg-amber-500 hover:bg-amber-400 text-black rounded-xl text-xs font-black uppercase tracking-[0.15em] transition-all disabled:opacity-50 shadow-lg shadow-amber-500/20"
                                            >
                                                {isGenerating ? "Generating..." : "Generate New Code"}
                                            </button>
                                        )}
                                    </div>
                                </div>

                                {loading ? (
                                    <div className="p-20 text-center text-zinc-500 font-bold uppercase tracking-widest animate-pulse">Syncing activation database...</div>
                                ) : codes.length === 0 ? (
                                    <div className="p-32 text-center">
                                        <div className="text-4xl mb-4 opacity-20">🔑</div>
                                        <div className="text-zinc-500 font-black uppercase tracking-widest italic text-sm">No activation codes found.</div>
                                    </div>
                                ) : (
                                    <div className="overflow-x-auto">
                                        <table className="w-full text-left">
                                            <thead className="bg-white/5 text-zinc-500 text-[10px] font-black uppercase tracking-[0.2em] border-b border-white/5">
                                                <tr>
                                                    <th className="px-8 py-6">Unique Activation Code</th>
                                                    <th className="px-8 py-6">Auth Status</th>
                                                    <th className="px-8 py-6">Generator / User</th>
                                                    <th className="px-8 py-6 text-right">Protocol Actions</th>
                                                </tr>
                                            </thead>
                                            <tbody className="divide-y divide-white/5">
                                                {codes.map((c) => (
                                                    <tr key={c.id} className="group hover:bg-white/[0.03] transition-colors">
                                                        <td className="px-8 py-6">
                                                            <div className="flex items-center gap-3">
                                                                <div className="font-mono font-black text-amber-500 text-lg tracking-widest bg-amber-500/5 px-4 py-1.5 rounded-lg border border-amber-500/10">
                                                                    {c.code}
                                                                </div>
                                                                {!c.isUsed && (
                                                                    <button
                                                                        onClick={() => copyToClipboard(c.code)}
                                                                        className="p-2 hover:bg-white/10 rounded-lg transition-colors text-sm opacity-0 group-hover:opacity-100"
                                                                        title="Copy to Clipboard"
                                                                    >
                                                                        📋
                                                                    </button>
                                                                )}
                                                            </div>
                                                            <div className="text-[10px] text-zinc-600 font-bold mt-2 uppercase tracking-widest">Issued: {new Date(c.createdAt).toLocaleDateString()}</div>
                                                        </td>
                                                        <td className="px-8 py-6">
                                                            <span className={`px-4 py-1.5 rounded-full text-[9px] font-black uppercase tracking-[0.15em] border ${c.isUsed ? 'bg-zinc-800 text-zinc-600 border-white/5 opacity-50' : 'bg-amber-500/10 text-amber-500 border-amber-500/20'
                                                                }`}>
                                                                {c.isUsed ? 'Used & Void' : 'Available'}
                                                            </span>
                                                        </td>
                                                        <td className="px-8 py-6 text-xs text-zinc-400 font-medium">
                                                            <div className="flex flex-col gap-1">
                                                                <div className="flex items-center gap-2">
                                                                    <span className="text-[9px] uppercase tracking-widest text-zinc-600 font-black">Gen by:</span>
                                                                    <span className="font-bold text-zinc-200">{c.generatedByName}</span>
                                                                </div>
                                                                {c.isUsed && (
                                                                    <div className="flex items-center gap-2 border-t border-white/5 pt-1 mt-1">
                                                                        <span className="text-[9px] uppercase tracking-widest text-amber-500/50 font-black">Used by:</span>
                                                                        <span className="font-bold text-amber-200 underline decoration-amber-500/30">{c.usedByName}</span>
                                                                    </div>
                                                                )}
                                                            </div>
                                                        </td>
                                                        <td className="px-8 py-6 text-right">
                                                            {isSuperAdmin && !c.isUsed && (
                                                                <button
                                                                    onClick={() => handleDeleteCode(c.id)}
                                                                    disabled={processing === c.id}
                                                                    className="px-4 py-2 text-red-500/50 hover:text-red-500 text-[10px] font-black uppercase tracking-widest transition-all opacity-0 group-hover:opacity-100"
                                                                >
                                                                    Purge Code
                                                                </button>
                                                            )}
                                                            {c.isUsed && (
                                                                <span className="text-[10px] text-zinc-600 font-black uppercase italic tracking-widest">Locked</span>
                                                            )}
                                                        </td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
                                )}
                            </>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
