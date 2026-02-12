"use client";

import { useRef } from "react";
import RoleGuard from "@/src/components/auth/RoleGuard";
import { NasabahNavbar, GoldCardOverview, NasabahActivityTable, NasabahDevTools } from "@/src/components/organisms";
import { DailyCheckIn } from "@/src/components/molecules/DailyCheckIn";
import { useNasabahDashboard } from "@/src/hooks/useNasabahDashboard";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";

export default function NasabahDashboard() {
    const {
        profile,
        isProfileLoading,
        activity,
        isActivityLoading,
        claimDailyBonus,
        isDailyPending,
        dailyResult,
    } = useNasabahDashboard();

    const containerRef = useRef<HTMLDivElement>(null);
    const navRef = useRef<HTMLDivElement>(null);
    const cardRef = useRef<HTMLDivElement>(null);
    const checkInRef = useRef<HTMLDivElement>(null);
    const tableRef = useRef<HTMLDivElement>(null);
    const toolsRef = useRef<HTMLDivElement>(null);

    // Orchestrated GSAP Timeline: Navbar → GoldCard (scale-up) → DailyCheckIn → ActivityTable (fade-in-up)
    useGSAP(() => {
        if (!containerRef.current) return;

        const tl = gsap.timeline({
            defaults: { ease: "power3.out" },
        });

        // 1. Navbar slides down
        if (navRef.current) {
            tl.from(navRef.current, {
                y: -80,
                opacity: 0,
                duration: 0.6,
            });
        }

        // 2. GoldCard scales up from center
        if (cardRef.current) {
            tl.from(cardRef.current, {
                scale: 0.85,
                opacity: 0,
                duration: 0.8,
                ease: "back.out(1.4)",
            }, "-=0.2");
        }

        // 3. DailyCheckIn fades in
        if (checkInRef.current) {
            tl.from(checkInRef.current, {
                y: 20,
                opacity: 0,
                duration: 0.5,
            }, "-=0.3");
        }

        // 4. ActivityTable fades in from below
        if (tableRef.current) {
            tl.from(tableRef.current, {
                y: 40,
                opacity: 0,
                duration: 0.7,
            }, "-=0.2");
        }

        // 5. Dev Tools fade in subtly
        if (toolsRef.current) {
            tl.from(toolsRef.current, {
                opacity: 0,
                duration: 1,
            }, "-=0.2");
        }
    }, { scope: containerRef });

    return (
        <RoleGuard allowedRoles={["nasabah"]}>
            <div ref={containerRef} className="min-h-screen bg-charcoal-deep text-white relative overflow-hidden">
                {/* Background ambient glow */}
                <div className="fixed inset-0 pointer-events-none">
                    <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[400px] bg-royal-blue/8 blur-[150px] rounded-full" />
                    <div className="absolute bottom-0 right-0 w-[500px] h-[300px] bg-gold-metallic/5 blur-[120px] rounded-full" />
                </div>

                {/* Navbar */}
                <div ref={navRef}>
                    <NasabahNavbar />
                </div>

                {/* Main Content */}
                <main className="relative z-10 max-w-5xl mx-auto px-6 pt-28 pb-16 space-y-8">
                    {/* Welcome */}
                    <div className="mb-2">
                        <p className="text-zinc-500 text-sm font-medium">
                            Selamat datang kembali,
                        </p>
                        <h1 className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-gold-metallic via-gold-light to-gold-metallic bg-clip-text text-transparent tracking-tight">
                            {isProfileLoading ? "..." : (profile?.fullName || "Nasabah")}
                        </h1>
                    </div>

                    {/* Gold Card Overview */}
                    <div ref={cardRef}>
                        <GoldCardOverview
                            fullName={profile?.fullName ?? null}
                            pointsBalance={profile?.points ?? 0}
                            role="Nasabah"
                            isLoading={isProfileLoading}
                        />
                    </div>

                    {/* Daily Check-In */}
                    <div ref={checkInRef}>
                        <DailyCheckIn
                            onClaim={claimDailyBonus}
                            isPending={isDailyPending}
                            alreadyClaimed={dailyResult?.awarded === false}
                        />
                    </div>

                    {/* Activity Table */}
                    <div ref={tableRef}>
                        <NasabahActivityTable
                            activity={activity}
                            isLoading={isActivityLoading}
                        />
                    </div>

                    {/* Dev Tools */}
                    <div ref={toolsRef}>
                        <NasabahDevTools />
                    </div>
                </main>
            </div>
        </RoleGuard>
    );
}
