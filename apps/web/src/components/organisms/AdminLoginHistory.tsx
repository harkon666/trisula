"use client";

import { useQuery } from "@tanstack/react-query";
import api from "@/src/lib/api-client";
import { format } from "date-fns";
import { ShieldCheck, Calendar, Globe, Monitor, Users, Lock } from "lucide-react";
import { useState } from "react";

interface LogEntry {
    id: number;
    // Admin Fields
    adminName?: string | null;
    adminRole?: string | null;
    // User Fields
    userName?: string | null;
    userRole?: string | null;
    userId?: string | null;

    action: string;
    ipAddress: string | null;
    userAgent: string | null;
    createdAt: string;
}

export function AdminLoginHistory() {
    const [logType, setLogType] = useState<'admin' | 'user'>('admin');

    const { data, isLoading, isError } = useQuery({
        queryKey: ["admin-logs", "LOGIN", logType],
        queryFn: async () => {
            const res = await api.get<{ success: boolean; data: LogEntry[] }>(`/v1/admin/logs?type=LOGIN&limit=50&target=${logType}`);
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
                    <p className="text-zinc-400 text-sm">Recent access logs</p>
                </div>

                <div className="flex bg-charcoal-800 p-1 rounded-xl border border-white/5">
                    <button
                        onClick={() => setLogType('admin')}
                        className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-bold transition-all ${logType === 'admin'
                                ? 'bg-gold-metallic text-charcoal-950 shadow-lg'
                                : 'text-zinc-400 hover:text-white'
                            }`}
                    >
                        <ShieldCheck className="w-4 h-4" />
                        ADMIN
                    </button>
                    <button
                        onClick={() => setLogType('user')}
                        className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-bold transition-all ${logType === 'user'
                                ? 'bg-blue-500 text-white shadow-lg'
                                : 'text-zinc-400 hover:text-white'
                            }`}
                    >
                        <Users className="w-4 h-4" />
                        USER
                    </button>
                </div>
            </div>

            <div className="bg-charcoal-900/50 backdrop-blur-sm border border-white/5 rounded-3xl overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="border-b border-white/5 bg-white/5">
                                <th className="p-5 text-xs font-black uppercase tracking-widest text-zinc-500">
                                    {logType === 'admin' ? 'Administrator' : 'User'}
                                </th>
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
                                                {logType === 'admin' ? (log.adminName || "Unknown Admin") : (log.userName || "Unknown User")}
                                            </span>
                                            <span className="text-xs font-mono text-zinc-500 uppercase px-2 py-0.5 bg-white/5 rounded w-fit mt-1">
                                                {logType === 'admin' ? log.adminRole?.replace('_', ' ') : log.userRole}
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
