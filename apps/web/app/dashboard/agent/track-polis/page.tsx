"use client";

import { useAuth } from "@/src/hooks/useAuth";
import { AgentNavbar } from "@/src/components/organisms/AgentNavbar";
import { AgentPolisTracking } from "@/src/components/organisms/AgentPolisTracking";
import { ArrowLeft, FileText } from "lucide-react";
import Link from "next/link";
import { Button } from "@/src/components/atoms";
import RoleGuard from "@/src/components/auth/RoleGuard";

export default function AgentPolisTrackingPage() {
    const { user } = useAuth();

    return (
        <RoleGuard allowedRoles={['agent']}>
            <div className="min-h-screen bg-midnight-950 text-white pb-20">
                <AgentNavbar />

                <main className="pt-28 max-w-4xl mx-auto px-6">
                    {/* Header */}
                    <div className="flex items-center justify-between mb-8">
                        <div className="flex items-center gap-4">
                            <Link href="/dashboard/agent">
                                <Button variant="ghost" className="p-3 rounded-xl bg-charcoal-800/50 border border-white/5 hover:bg-charcoal-700">
                                    <ArrowLeft className="w-5 h-5" />
                                </Button>
                            </Link>
                            <div>
                                <h1 className="text-3xl font-black tracking-tight">
                                    Tracking <span className="text-trisula-500">Polis</span>
                                </h1>
                                <p className="text-zinc-400 mt-1">Lihat status polis yang sudah anda input</p>
                            </div>
                        </div>

                        {/* Quick Action */}
                        <Link href="/dashboard/agent/input-polis">
                            <Button variant="primary" className="gap-2">
                                <FileText className="w-4 h-4" />
                                Input Polis Baru
                            </Button>
                        </Link>
                    </div>

                    {/* Tracking Component */}
                    <AgentPolisTracking />
                </main>
            </div>
        </RoleGuard>
    );
}