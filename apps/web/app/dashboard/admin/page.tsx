"use client";

import RoleGuard from "@/src/components/auth/RoleGuard";
import { PageEntrance } from "@/src/components/ui/GsapContext";

export default function AdminDashboard() {
    return (
        <RoleGuard allowedRoles={['admin', 'super_admin']}>
            <PageEntrance className="min-h-screen bg-neutral-950 p-8 text-white">
                <h1 className="mb-8 text-4xl font-bold text-red-500">
                    Admin Command Center
                </h1>

                <div className="grid grid-cols-1 gap-6">
                    <div className="p-6 border border-red-900/50 bg-red-900/10 rounded-lg">
                        <h3 className="font-mono text-xl text-red-400">System Status: ONLINE</h3>
                    </div>
                </div>
            </PageEntrance>
        </RoleGuard>
    );
}
