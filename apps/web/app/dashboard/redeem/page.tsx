"use client";

import { useRouter } from "next/navigation";
import { useAuth } from "@/src/hooks/useAuth";
import api from "@/src/lib/api-client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { Card, Button, Badge, Skeleton } from "@/src/components/atoms";
import { RedeemModal } from "@/src/components/organisms/RedeemModal";

interface CatalogItem {
    id: string; // Changed to string to match Product type
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
}

export default function RedeemPage() {
    const { user, isAuthenticated } = useAuth();
    const router = useRouter();
    const queryClient = useQueryClient();

    // --- Queries ---
    const { data: userPoints = 0 } = useQuery({
        queryKey: ['userProfile'],
        queryFn: async () => {
            const res = await api.get('/v1/user/profile');
            return res.data.data.points as number;
        },
        enabled: isAuthenticated
    });

    const { data: catalog = [], isLoading: loadingCatalog } = useQuery({
        queryKey: ['redeemCatalog'],
        queryFn: async () => {
            const res = await api.get('/v1/redeem/catalog');
            return res.data.data as CatalogItem[];
        },
        enabled: isAuthenticated
    });

    const { data: myRequests = [], isLoading: loadingRequests } = useQuery({
        queryKey: ['myRequests'],
        queryFn: async () => {
            const res = await api.get('/v1/redeem/my-requests');
            return res.data.data as RedemptionRequest[];
        },
        enabled: isAuthenticated
    });

    // --- Mutations ---
    const cancelMutation = useMutation({
        mutationFn: async (requestId: string) => {
            return api.patch(`/v1/redeem/${requestId}/cancel`, { userId: user?.userId });
        },
        onSuccess: () => {
            toast.success("Request cancelled successfully");
            queryClient.invalidateQueries({ queryKey: ['myRequests'] });
            queryClient.invalidateQueries({ queryKey: ['userProfile'] });
        },
        onError: (err: any) => {
            toast.error(err.response?.data?.message || "Cancellation failed");
        }
    });

    const activeRequest = myRequests.find(r => ['pending', 'processing', 'ready'].includes(r.status));

    if (!isAuthenticated) {
        return (
            <div className="min-h-screen bg-midnight-950 flex flex-col items-center justify-center text-white p-6">
                <div className="w-16 h-16 bg-trisula-500/10 rounded-full flex items-center justify-center mb-6">
                    <span className="text-3xl">🔓</span>
                </div>
                <h1 className="text-2xl font-bold mb-2">Members Only</h1>
                <p className="text-zinc-500 mb-8 max-w-md text-center">
                    Please sign in to access the rewards catalog.
                </p>
                <Button variant="primary" onClick={() => router.push('/login')}>
                    Sign In
                </Button>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-midnight-950 text-white p-6 md:p-12 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-trisula-500/5 blur-[120px] rounded-full pointer-events-none" />

            <div className="max-w-6xl mx-auto relative z-10">
                <header className="flex flex-col md:flex-row justify-between items-start md:items-center mb-12 gap-6">
                    <div>
                        <Button variant="ghost" size="sm" onClick={() => router.push('/dashboard')} className="mb-4 -ml-4">
                            ← Dashboard
                        </Button>
                        <h1 className="text-4xl font-black text-white tracking-tight">
                            Reward <span className="text-trisula-500">Catalog</span>
                        </h1>
                        <p className="text-zinc-500 font-medium mt-2">Tukarkan poin Anda dengan pengalaman eksklusif.</p>
                    </div>
                    <Card variant="solid" className="bg-trisula-500/5 border-trisula-500/20 p-6 flex flex-col items-end backdrop-blur-xl">
                        <p className="text-[10px] text-trisula-500/70 uppercase tracking-widest font-black mb-1">Available Points</p>
                        <p className="text-4xl font-black text-trisula-500">
                            {userPoints.toLocaleString()} <span className="text-sm">PTS</span>
                        </p>
                    </Card>
                </header>

                {/* Status Tracker for Active Order */}
                {activeRequest && (
                    <Card variant="glass" className="mb-12 p-8 border-trisula-500/20 bg-trisula-500/[0.02]">
                        <div className="flex flex-col md:flex-row justify-between items-start mb-8 gap-4">
                            <div>
                                <Badge variant="warning" className="mb-2">Active Redemption</Badge>
                                <h3 className="text-2xl font-black text-white uppercase tracking-tight">{activeRequest.itemName}</h3>
                                <p className="text-[10px] text-zinc-500 font-mono mt-1 uppercase tracking-widest">Protocol-ID: {activeRequest.id.substring(0, 8)}</p>
                            </div>
                            <div className="flex flex-col items-end gap-3 w-full md:w-auto">
                                <span className="text-trisula-400 font-black text-lg">{activeRequest.pointsUsed.toLocaleString()} PTS</span>
                                {activeRequest.status === 'pending' && (
                                    <Button
                                        variant="danger"
                                        size="sm"
                                        onClick={() => cancelMutation.mutate(activeRequest.id)}
                                        isLoading={cancelMutation.isPending}
                                    >
                                        Cancel Request
                                    </Button>
                                )}
                            </div>
                        </div>

                        {/* Simplified Status UI for this page since StatusTracker was removed */}
                        <div className="flex items-center justify-between relative">
                            <div className="absolute top-1/2 left-0 w-full h-0.5 bg-white/5 -translate-y-1/2" />
                            {['pending', 'processing', 'ready', 'completed'].map((step, idx) => {
                                const steps = ['pending', 'processing', 'ready', 'completed'];
                                const currentIdx = steps.indexOf(activeRequest.status);
                                const isCompleted = idx <= currentIdx;
                                const isActive = idx === currentIdx;

                                return (
                                    <div key={step} className="relative z-10 flex flex-col items-center">
                                        <div className={`w-4 h-4 rounded-full border-4 ${isCompleted ? 'bg-trisula-500 border-trisula-500 shadow-[0_0_10px_rgba(234,179,8,0.5)]' : 'bg-zinc-800 border-zinc-700'}`} />
                                        <span className={`text-[8px] font-black uppercase tracking-widest mt-3 ${isActive ? 'text-trisula-500' : isCompleted ? 'text-zinc-300' : 'text-zinc-600'}`}>
                                            {step}
                                        </span>
                                    </div>
                                );
                            })}
                        </div>
                    </Card>
                )}

                <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-20">
                    {loadingCatalog ? (
                        Array.from({ length: 3 }).map((_, i) => <Skeleton key={i} className="h-96 rounded-[32px]" />)
                    ) : catalog.length === 0 ? (
                        <Card className="col-span-3 text-center py-20 text-zinc-500 border-dashed">
                            Catalog currently offline. Check back soon.
                        </Card>
                    ) : (
                        catalog.map((item) => (
                            <Card key={item.id} variant="glass" className="p-8 flex flex-col group relative overflow-hidden hover:border-trisula-500/50 transition-all">
                                <div className="absolute top-0 right-0 w-32 h-32 bg-trisula-500/5 blur-3xl rounded-full group-hover:bg-trisula-500/10 transition-all" />

                                <div className="bg-white/5 w-full h-48 rounded-2xl mb-6 flex items-center justify-center text-4xl shadow-inner border border-white/5 group-hover:scale-105 transition-transform">
                                    🎁
                                </div>
                                <h3 className="text-2xl font-black text-white mb-2 uppercase tracking-tight">{item.name}</h3>
                                <p className="text-zinc-500 text-sm font-medium leading-relaxed mb-8 flex-grow">{item.description}</p>

                                <div className="mt-auto pt-6 border-t border-white/5 flex flex-col gap-4">
                                    <div className="flex justify-between items-center">
                                        <span className="text-trisula-500 font-black tracking-widest">{item.pointsRequired.toLocaleString()} PTS</span>
                                        <Badge variant={userPoints >= item.pointsRequired ? 'success' : 'outline'}>
                                            {userPoints >= item.pointsRequired ? 'Affordable' : 'Locked'}
                                        </Badge>
                                    </div>
                                    <RedeemModal
                                        item={item as any} // Cast to any to avoid minor TS quibbles if necessary, but should match Product now
                                        userPoints={userPoints}
                                        onSuccess={() => {
                                            queryClient.invalidateQueries({ queryKey: ['myRequests'] });
                                            queryClient.invalidateQueries({ queryKey: ['userProfile'] });
                                        }}
                                    >
                                        <RedeemModal.Trigger asChild>
                                            <Button
                                                variant="primary"
                                                className="w-full"
                                                disabled={userPoints < item.pointsRequired}
                                            >
                                                Redeem Reward
                                            </Button>
                                        </RedeemModal.Trigger>
                                        <RedeemModal.Content />
                                    </RedeemModal>
                                </div>
                            </Card>
                        ))
                    )}
                </div>

                {/* History Section */}
                <Card variant="solid" className="bg-white/5 border-white/5 p-8 mb-12 shadow-2xl">
                    <h2 className="text-xl font-black mb-8 flex items-center gap-3 uppercase tracking-widest">
                        <span className="w-1.5 h-6 bg-trisula-500 rounded-full" />
                        Operation History
                    </h2>

                    {loadingRequests ? (
                        <div className="space-y-4">
                            <Skeleton className="h-10 w-full" />
                            <Skeleton className="h-10 w-full" />
                            <Skeleton className="h-10 w-full" />
                        </div>
                    ) : myRequests.length === 0 ? (
                        <p className="text-zinc-500 italic text-sm">No recorded transactions found.</p>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="w-full text-left">
                                <thead className="text-zinc-500 text-[10px] font-black uppercase tracking-[0.2em] border-b border-white/5">
                                    <tr>
                                        <th className="pb-6 px-4">Timestamp</th>
                                        <th className="pb-6 px-4">Item Identity</th>
                                        <th className="pb-6 px-4">Status</th>
                                        <th className="pb-6 px-4 text-right">Points</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-white/5">
                                    {myRequests.map((req) => (
                                        <tr key={req.id} className="hover:bg-white/[0.02] transition-colors">
                                            <td className="py-6 px-4 text-zinc-500 text-[10px] font-mono font-bold">
                                                {new Date(req.createdAt).toLocaleString()}
                                            </td>
                                            <td className="py-6 px-4 font-black text-white text-sm uppercase tracking-tight">
                                                {req.itemName}
                                            </td>
                                            <td className="py-6 px-4">
                                                <Badge variant={req.status === 'completed' ? 'success' : req.status === 'rejected' || req.status === 'cancelled' ? 'outline' : 'warning'}>
                                                    {req.status}
                                                </Badge>
                                            </td>
                                            <td className="py-6 px-4 text-right font-black text-zinc-400 text-sm">
                                                -{req.pointsUsed.toLocaleString()}
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
    );
}
