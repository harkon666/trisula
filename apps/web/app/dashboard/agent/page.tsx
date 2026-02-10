"use client";

import RoleGuard from "@/src/components/auth/RoleGuard";
import { PageEntrance } from "@/src/components/ui/GsapContext";
import { useAuth } from "@/src/hooks/useAuth";

export default function AgentDashboard() {
    const { user } = useAuth();

    return (
        <RoleGuard allowedRoles={['agent']}>
            <PageEntrance className="min-h-screen bg-neutral-900 p-8 text-white">
                <h1 className="mb-8 text-4xl font-bold tracking-tight text-royal-blue bg-white px-4 py-2 rounded-lg inline-block">
                    Agent Portal
                </h1>

                <div className="grid gap-6">
                    <div className="rounded-xl border border-white/10 bg-white/5 p-6 backdrop-blur-sm">
                        <h2 className="text-2xl font-semibold">Welcome, Agent {user?.userId}</h2>
                        <p className="mt-2 text-neutral-400">Track your referrals and commissions here.</p>
                    </div>
                </div>
            </PageEntrance>
        </RoleGuard>
    );
}
