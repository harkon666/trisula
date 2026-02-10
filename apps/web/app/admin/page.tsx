"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/src/hooks/useAuth";
import api from "@/src/lib/api-client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { Card, Button, Badge, Skeleton } from "@/src/components/atoms";
import { RejectModal } from "@/src/components/organisms/RejectModal";

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
    const queryClient = useQueryClient();

    // UI State
    const [activeTab, setActiveTab] = useState<'redeem' | 'codes'>('redeem');
    const [rejectTarget, setRejectTarget] = useState<RedeemRequest | null>(null);

    const isAdmin = user?.role === 'super_admin' || user?.role === 'admin_input' || user?.role === 'admin_view';
    const canManageCodes = user?.role === 'super_admin' || user?.role === 'admin_input';
    const isSuperAdmin = user?.role === 'super_admin';

    // --- Queries ---
    const { data: requests = [], isLoading: loadingRequests } = useQuery({
        queryKey: ['pendingRequests'],
        queryFn: async () => {
            const res = await api.get('/v1/admin/redeem/pending');
            return res.data.data as RedeemRequest[];
        },
        enabled: isAuthenticated && isAdmin && activeTab === 'redeem',
    });

    const { data: codes = [], isLoading: loadingCodes } = useQuery({
        queryKey: ['activationCodes'],
        queryFn: async () => {
            const res = await api.get('/v1/admin/codes');
            return res.data.data as ActivationCode[];
        },
        enabled: isAuthenticated && isAdmin && activeTab === 'codes',
    });

    // --- Mutations ---
    const updateMutation = useMutation({
        mutationFn: async ({ requestId, status }: { requestId: string, status: string }) => {
            return api.patch(`/v1/admin/redeem/${requestId}`, {
                status,
                adminId: user?.userId,
            });
        },
        onSuccess: () => {
            toast.success("Status updated");
            queryClient.invalidateQueries({ queryKey: ['pendingRequests'] });
        },
        onError: (err: any) => {
            toast.error(err.response?.data?.message || "Action failed");
        }
    });

    const generateMutation = useMutation({
        mutationFn: async () => api.post('/v1/admin/codes'),
        onSuccess: () => {
            toast.success("Activation code generated!");
            queryClient.invalidateQueries({ queryKey: ['activationCodes'] });
        },
        onError: (err: any) => {
            toast.error(err.response?.data?.message || "Failed to generate code");
        }
    });

    const deleteMutation = useMutation({
        mutationFn: async (id: number) => api.delete(`/v1/admin/codes/${id}`),
        onSuccess: () => {
            toast.success("Code deleted successfully");
            queryClient.invalidateQueries({ queryKey: ['activationCodes'] });
        },
        onError: (err: any) => {
            toast.error(err.response?.data?.message || "Delete failed");
        }
    });

    const handleStatusUpdate = (requestId: string, status: 'processing' | 'ready' | 'completed') => {
        updateMutation.mutate({ requestId, status });
    };

    const copyToClipboard = (text: string) => {
        navigator.clipboard.writeText(text);
        toast.success("Code copied to clipboard!");
    };

    if (!isAuthenticated || !isAdmin) {
        return (
            <div className="min-h-screen bg- midnight-950 flex flex-col items-center justify-center text-white p-6">
                <div className="w-16 h-16 bg-red-500/10 rounded-full flex items-center justify-center mb-6">
                    <span className="text-3xl">🔒</span>
                </div>
                <h1 className="text-2xl font-bold mb-2">Restricted Access</h1>
                <p className="text-zinc-500 mb-8 max-w-md text-center">
                    Area ini khusus untuk Administrator. Silakan masuk dengan akun Admin Anda.
                </p>
                <Button variant="primary" onClick={() => router.push('/login')}>
                    Sign In as Admin
                </Button>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-midnight-950 text-white p-6 md:p-12 relative overflow-hidden">
            {/* Background Ambience */}
            <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-trisula-500/5 blur-[120px] rounded-full pointer-events-none" />

            {/* Reject Modal */}
            <RejectModal
                requestId={rejectTarget?.id || ""}
                itemName={rejectTarget?.itemName || ""}
                adminId={user?.userId || ""}
                isOpen={!!rejectTarget}
                onClose={() => setRejectTarget(null)}
                onSuccess={() => queryClient.invalidateQueries({ queryKey: ['pendingRequests'] })}
            />

            <header className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-12 relative z-10">
                <div>
                    <h1 className="text-4xl font-black text-white mb-2 tracking-tight">
                        <span className="text-trisula-500">TRISULA</span> ADMIN
                    </h1>
                    <p className="text-zinc-500 font-medium">Control Center & System Management</p>
                </div>

                <div className="flex items-center gap-3">
                    <Button variant="secondary" onClick={() => router.push('/')}>
                        Landing
                    </Button>
                    <Button variant="danger" onClick={() => logout()}>
                        Sign Out
                    </Button>
                </div>
            </header>

            {/* Tab Navigation */}
            <nav className="flex items-center gap-2 mb-10 p-1.5 bg-white/5 border border-white/5 rounded-2xl w-fit relative z-10">
                <button
                    onClick={() => setActiveTab('redeem')}
                    className={`px-8 py-3 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${activeTab === 'redeem' ? 'bg-trisula-500 text-midnight-950 shadow-lg' : 'text-zinc-500 hover:text-zinc-300'}`}
                >
                    Redeem Queue
                </button>
                <button
                    onClick={() => setActiveTab('codes')}
                    className={`px-8 py-3 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${activeTab === 'codes' ? 'bg-trisula-500 text-midnight-950 shadow-lg' : 'text-zinc-500 hover:text-zinc-300'}`}
                >
                    Agent Codes
                </button>
            </nav>

            <div className="grid grid-cols-1 lg:grid-cols-4 gap-8 relative z-10">
                {/* Stats Section */}
                <div className="lg:col-span-1 space-y-6">
                    <Card variant="glass" className="relative group">
                        <div className="absolute top-0 right-0 w-32 h-32 bg-trisula-500/10 blur-2xl rounded-full -mr-16 -mt-16 transition-transform group-hover:scale-110" />
                        <h3 className="text-zinc-500 text-[10px] font-black uppercase tracking-widest mb-4">
                            {activeTab === 'redeem' ? 'Pending Requests' : 'Total Codes'}
                        </h3>
                        <p className="text-6xl font-black text-trisula-500 drop-shadow-2xl">
                            {activeTab === 'redeem' ? requests.length : codes.length}
                        </p>
                    </Card>

                    <Card variant="solid" className="bg-white/5 border-white/5">
                        <h3 className="text-zinc-500 text-[10px] font-black uppercase tracking-widest mb-4">Admin Status</h3>
                        <div className="flex items-center gap-3">
                            <span className="w-3 h-3 bg-green-500 rounded-full animate-pulse shadow-[0_0_15px_rgba(34,197,94,0.6)]" />
                            <span className="font-black text-green-500 uppercase tracking-widest text-xs italic">{user.role}</span>
                        </div>
                    </Card>
                </div>

                {/* Main Content Area */}
                <div className="lg:col-span-3">
                    <Card variant="glass" className="p-0 overflow-hidden !rounded-[32px] bg-white/5">
                        <div className="p-8 border-b border-white/5 flex justify-between items-center bg-white/5">
                            <h2 className="text-xl font-black flex items-center gap-3 uppercase tracking-tight">
                                <span className="w-1.5 h-6 bg-trisula-500 rounded-full" />
                                {activeTab === 'redeem' ? 'Withdrawal Queue' : 'Partner Activation Codes'}
                            </h2>
                            <div className="flex items-center gap-2">
                                <Button variant="ghost" size="sm" onClick={() => queryClient.invalidateQueries({ queryKey: [activeTab === 'redeem' ? 'pendingRequests' : 'activationCodes'] })}>
                                    ↻
                                </Button>
                                {activeTab === 'codes' && canManageCodes && (
                                    <Button variant="primary" size="sm" onClick={() => generateMutation.mutate()} isLoading={generateMutation.isPending}>
                                        Generate New
                                    </Button>
                                )}
                            </div>
                        </div>

                        {(loadingRequests || loadingCodes) ? (
                            <div className="p-20 text-center text-zinc-500 font-bold uppercase tracking-widest animate-pulse">Scanning Protocol...</div>
                        ) : (activeTab === 'redeem' ? requests : codes).length === 0 ? (
                            <div className="p-32 text-center">
                                <div className="text-4xl mb-4 opacity-20">{activeTab === 'redeem' ? '📭' : '🔑'}</div>
                                <div className="text-zinc-500 font-black uppercase tracking-widest italic text-sm">Target Clear. No Data.</div>
                            </div>
                        ) : (
                            <div className="overflow-x-auto">
                                <table className="w-full text-left">
                                    <thead className="bg-white/5 text-zinc-500 text-[9px] font-black uppercase tracking-[0.2em] border-b border-white/5">
                                        {activeTab === 'redeem' ? (
                                            <tr>
                                                <th className="px-8 py-6">Member Identity</th>
                                                <th className="px-8 py-6">Requested Reward</th>
                                                <th className="px-8 py-6">Current Status</th>
                                                <th className="px-8 py-6 text-right">Approval Actions</th>
                                            </tr>
                                        ) : (
                                            <tr>
                                                <th className="px-8 py-6">Unique Activation Code</th>
                                                <th className="px-8 py-6">Auth Status</th>
                                                <th className="px-8 py-6">Generator / User</th>
                                                <th className="px-8 py-6 text-right">Protocol Actions</th>
                                            </tr>
                                        )}
                                    </thead>
                                    <tbody className="divide-y divide-white/5">
                                        {activeTab === 'redeem' ? (requests as RedeemRequest[]).map((req) => (
                                            <tr key={req.id} className="group hover:bg-white/[0.03] transition-colors">
                                                <td className="px-8 py-6">
                                                    <div className="font-black text-white text-md tracking-tight group-hover:text-trisula-400 transition-colors uppercase">{req.userName}</div>
                                                    <div className="text-[10px] text-zinc-500 font-bold mt-1 tracking-widest">{req.whatsapp}</div>
                                                </td>
                                                <td className="px-8 py-6">
                                                    <div className="text-white font-bold text-sm">{req.itemName}</div>
                                                    <div className="text-[9px] text-trisula-500/50 font-black mt-1 uppercase tracking-widest">{req.pointsUsed.toLocaleString()} Points</div>
                                                </td>
                                                <td className="px-8 py-6">
                                                    <Badge variant={req.status === 'pending' ? 'warning' : req.status === 'processing' ? 'info' : 'success'}>
                                                        {req.status}
                                                    </Badge>
                                                </td>
                                                <td className="px-8 py-6 text-right">
                                                    <div className="flex items-center justify-end gap-2 opacity-60 group-hover:opacity-100 transition-opacity">
                                                        {req.status === 'pending' && (
                                                            <Button variant="secondary" size="sm" onClick={() => handleStatusUpdate(req.id, 'processing')} disabled={updateMutation.isPending}>
                                                                Process
                                                            </Button>
                                                        )}
                                                        {req.status === 'processing' && (
                                                            <Button variant="primary" size="sm" onClick={() => handleStatusUpdate(req.id, 'ready')} disabled={updateMutation.isPending}>
                                                                Ship
                                                            </Button>
                                                        )}
                                                        {req.status === 'ready' && (
                                                            <Button variant="primary" size="sm" onClick={() => handleStatusUpdate(req.id, 'completed')} disabled={updateMutation.isPending}>
                                                                Finish
                                                            </Button>
                                                        )}
                                                        <Button variant="danger" size="sm" onClick={() => setRejectTarget(req)} disabled={updateMutation.isPending}>
                                                            Void
                                                        </Button>
                                                    </div>
                                                </td>
                                            </tr>
                                        )) : (codes as ActivationCode[]).map((c) => (
                                            <tr key={c.id} className="group hover:bg-white/[0.03] transition-colors">
                                                <td className="px-8 py-6">
                                                    <div className="flex items-center gap-3">
                                                        <div className="font-mono font-black text-trisula-500 text-md tracking-widest bg-trisula-500/5 px-4 py-1.5 rounded-lg border border-trisula-500/10">
                                                            {c.code}
                                                        </div>
                                                        {!c.isUsed && (
                                                            <button
                                                                onClick={() => copyToClipboard(c.code)}
                                                                className="p-1.5 hover:bg-white/10 rounded-lg transition-colors text-xs opacity-0 group-hover:opacity-100"
                                                                title="Copy"
                                                            >
                                                                📋
                                                            </button>
                                                        )}
                                                    </div>
                                                    <div className="text-[9px] text-zinc-600 font-bold mt-2 uppercase tracking-widest">Issued: {new Date(c.createdAt).toLocaleDateString()}</div>
                                                </td>
                                                <td className="px-8 py-6">
                                                    <Badge variant={c.isUsed ? 'outline' : 'warning'}>
                                                        {c.isUsed ? 'Used & Void' : 'Available'}
                                                    </Badge>
                                                </td>
                                                <td className="px-8 py-6 text-[10px] text-zinc-400 font-medium">
                                                    <div className="flex flex-col gap-1">
                                                        <div className="flex items-center gap-2">
                                                            <span className="text-[8px] uppercase tracking-widest text-zinc-600 font-black">Gen by:</span>
                                                            <span className="font-bold text-zinc-200">{c.generatedByName}</span>
                                                        </div>
                                                        {c.isUsed && (
                                                            <div className="flex items-center gap-2 border-t border-white/5 pt-1 mt-1">
                                                                <span className="text-[8px] uppercase tracking-widest text-trisula-500/50 font-black">Used by:</span>
                                                                <span className="font-bold text-trisula-200 underline decoration-trisula-500/30">{c.usedByName}</span>
                                                            </div>
                                                        )}
                                                    </div>
                                                </td>
                                                <td className="px-8 py-6 text-right">
                                                    {isSuperAdmin && !c.isUsed ? (
                                                        <Button variant="ghost" size="sm" className="text-red-500/50 hover:text-red-500 opacity-0 group-hover:opacity-100" onClick={() => deleteMutation.mutate(c.id)} isLoading={deleteMutation.isPending}>
                                                            Purge
                                                        </Button>
                                                    ) : c.isUsed ? (
                                                        <span className="text-[8px] text-zinc-600 font-black uppercase italic tracking-widest">Locked</span>
                                                    ) : null}
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        )}
                    </Card>
                </div>
            </div>
        </div>
    );
}
