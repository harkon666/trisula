"use client";

import { useQuery } from "@tanstack/react-query";
import api from "@/src/lib/api-client";
import { format } from "date-fns";
import { ShieldCheck, Calendar, Globe, Monitor } from "lucide-react";

interface AdminLog {
    id: number;
    adminName: string | null;
    adminRole: string | null;
    action: string;
    ipAddress: string | null;
    userAgent: string | null;
    createdAt: string;
}

export function AdminLoginHistory() {
    const { data, isLoading, isError } = useQuery({
        queryKey: ["admin-logs", "LOGIN"],
        queryFn: async () => {
            const res = await api.get<{ success: boolean; data: AdminLog[] }>("/v1/admin/logs?type=LOGIN&limit=50");
            return res.data.data;
        },
    });

    if (isLoading) {
        return (
            <div className="space-y-4 animate-pulse">
                {[...Array(5)].map((_, i) => (
                    <div key={i} className="h-20 bg-white/5 rounded-2xl" />
                ))}
            </div>
        );
    }

    if (isError) {
        return (
            <div className="p-8 text-center bg-red-500/10 border border-red-500/20 rounded-3xl text-red-400">
                Failed to load login history.
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-2xl font-black text-white tracking-tight">Security Audit</h2>
                    <p className="text-zinc-400 text-sm">Recent admin access logs</p>
                </div>
                <div className="px-4 py-2 bg-emerald-500/10 border border-emerald-500/20 rounded-full flex items-center gap-2">
                    <ShieldCheck className="w-4 h-4 text-emerald-500" />
                    <span className="text-xs font-bold text-emerald-500 uppercase tracking-wider">Secure</span>
                </div>
            </div>

            <div className="bg-charcoal-900/50 backdrop-blur-sm border border-white/5 rounded-3xl overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="border-b border-white/5 bg-white/5">
                                <th className="p-5 text-xs font-black uppercase tracking-widest text-zinc-500">Admin</th>
                                <th className="p-5 text-xs font-black uppercase tracking-widest text-zinc-500">Access Time</th>
                                <th className="p-5 text-xs font-black uppercase tracking-widest text-zinc-500">Network</th>
                                <th className="p-5 text-xs font-black uppercase tracking-widest text-zinc-500">Device</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-white/5">
                            {data?.map((log) => (
                                <tr key={log.id} className="hover:bg-white/5 transition-colors group">
                                    <td className="p-5">
                                        <div className="flex flex-col">
                                            <span className="font-bold text-white group-hover:text-gold-metallic transition-colors">
                                                {log.adminName || "Unknown Admin"}
                                            </span>
                                            <span className="text-xs font-mono text-zinc-500 uppercase px-2 py-0.5 bg-white/5 rounded w-fit mt-1">
                                                {log.adminRole?.replace('_', ' ')}
                                            </span>
                                        </div>
                                    </td>
                                    <td className="p-5">
                                        <div className="flex items-center gap-2 text-zinc-400">
                                            <Calendar className="w-4 h-4 text-zinc-600" />
                                            <span className="text-sm font-medium">
                                                {format(new Date(log.createdAt), "dd MMM yyyy, HH:mm")}
                                            </span>
                                        </div>
                                    </td>
                                    <td className="p-5">
                                        <div className="flex items-center gap-2 text-zinc-400">
                                            <Globe className="w-4 h-4 text-zinc-600" />
                                            <span className="text-sm font-mono">{log.ipAddress || "Unknown IP"}</span>
                                        </div>
                                    </td>
                                    <td className="p-5">
                                        <div className="flex items-center gap-2 text-zinc-400 max-w-xs truncate" title={log.userAgent || ""}>
                                            <Monitor className="w-4 h-4 text-zinc-600" />
                                            <span className="text-xs truncate">{log.userAgent || "Unknown Device"}</span>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                            {data?.length === 0 && (
                                <tr>
                                    <td colSpan={4} className="p-12 text-center text-zinc-500">
                                        No login history found.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}
