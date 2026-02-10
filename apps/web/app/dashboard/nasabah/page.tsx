"use client";

import RoleGuard from "@/src/components/auth/RoleGuard";
import { GoldCard } from "@/src/components/ui/GoldCard";
import { PageEntrance } from "@/src/components/ui/GsapContext";
import { useAuth } from "@/src/hooks/useAuth";

export default function NasabahDashboard() {
    const { user } = useAuth();

    return (
        <RoleGuard allowedRoles={['nasabah']}>
            <PageEntrance className="min-h-screen bg-neutral-900 p-8 text-white">
                <h1 className="mb-8 text-4xl font-bold tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-gold-metallic to-white">
                    Nasabah Dashboard
                </h1>

                <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                    <GoldCard>
                        <h3 className="text-lg font-medium text-white/80">Total Points</h3>
                        <p className="mt-2 text-4xl font-bold text-white">{user?.pointsBalance?.toLocaleString() || 0}</p>
                        <p className="mt-4 text-xs text-white/60">Available to redeem</p>
                    </GoldCard>

                    {/* Other cards... */}
                </div>
            </PageEntrance>
        </RoleGuard>
    );
}
