"use client";

import { useQuery } from "@tanstack/react-query";
import { Card, Badge, Skeleton } from "@/src/components/atoms";
import api from "@/src/lib/api-client";
import { useAuth } from "@/src/hooks/useAuth";

interface ActivityLog {
    id: string;
    amount: number;
    reason: string;
    source: string;
    createdAt: string;
    status?: 'pending' | 'processing' | 'ready' | 'completed' | 'cancelled' | 'rejected' | 'refund' | null;
}

export function ActivityTable() {
    const { isAuthenticated } = useAuth();

    const { data: activity, isLoading } = useQuery({
        queryKey: ['activityLog'],
        queryFn: async () => {
            const res = await api.get('/v1/user/activity');
            return res.data.data as ActivityLog[];
        },
        enabled: isAuthenticated
    });

    if (isLoading) {
        return (
            <Card className="h-96">
                <div className="space-y-4">
                    <Skeleton className="h-8 w-48 mb-6" />
                    {[1, 2, 3, 4, 5].map(i => (
                        <Skeleton key={i} className="h-12 w-full" />
                    ))}
                </div>
            </Card>
        );
    }

    if (!activity || activity.length === 0) {
        return (
            <Card>
                <h2 className="text-2xl font-bold mb-6 flex items-center gap-3">
                    <span className="w-2 h-8 bg-amber-500 rounded-full" />
                    Riwayat Aktivitas
                </h2>
                <div className="text-center py-12 text-zinc-500 italic">
                    Belum ada riwayat aktivitas.
                </div>
            </Card>
        );
    }

    return (
        <Card variant="glass" className="overflow-x-auto">
            <h2 className="text-2xl font-bold mb-6 flex items-center gap-3">
                <span className="w-2 h-8 bg-amber-500 rounded-full" />
                Riwayat Aktivitas
            </h2>

            <table className="w-full text-left border-collapse min-w-[600px]">
                <thead>
                    <tr className="text-zinc-500 border-b border-white/5">
                        <th className="pb-4 font-medium pl-4">Tanggal</th>
                        <th className="pb-4 font-medium">Aktivitas</th>
                        <th className="pb-4 font-medium">Sumber</th>
                        <th className="pb-4 font-medium text-right pr-4">Poin</th>
                    </tr>
                </thead>
                <tbody className="text-sm">
                    {activity.map((log) => (
                        <tr key={log.id} className="border-b border-white/5 hover:bg-white/5 transition-colors group">
                            <td className="py-4 pl-4 text-zinc-400 font-mono">
                                {new Date(log.createdAt).toLocaleDateString('id-ID')}
                            </td>
                            <td className="py-4 font-medium text-white">
                                <div className="flex items-center gap-2">
                                    {log.reason}
                                    {log.status && (
                                        <Badge variant={
                                            log.status === 'completed' ? 'success' :
                                                log.status === 'rejected' ? 'error' :
                                                    log.status === 'processing' ? 'info' :
                                                        'warning'
                                        }>
                                            {log.status}
                                        </Badge>
                                    )}
                                </div>
                            </td>
                            <td className="py-4 text-zinc-400 capitalize">{log.source}</td>
                            <td className={`py-4 pr-4 text-right font-bold font-mono ${log.amount > 0 ? 'text-green-400' : 'text-red-400'}`}>
                                {log.amount > 0 ? '+' : ''}{log.amount}
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </Card>
    );
}
