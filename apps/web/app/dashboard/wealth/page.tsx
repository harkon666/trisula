"use client";

import { WealthOverview } from "@/src/components/organisms";
import { Button } from "@/src/components/atoms";
import { useRouter } from "next/navigation";

export default function WealthPage() {
    const router = useRouter();

    return (
        <div className="min-h-screen bg-midnight-950 text-white p-6 md:p-12 relative overflow-hidden">
            {/* Background Ambience */}
            <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-trisula-500/5 blur-[120px] rounded-full pointer-events-none" />

            <div className="max-w-4xl mx-auto relative z-10">
                <header className="mb-12">
                    <Button variant="ghost" size="sm" onClick={() => router.push('/dashboard')} className="mb-6 -ml-4">
                        ← Dashboard
                    </Button>
                    <h1 className="text-4xl font-black text-white mb-2 tracking-tight">
                        Wealth <span className="text-trisula-500">Portfolio</span>
                    </h1>
                    <p className="text-zinc-500 font-medium">
                        Your consolidated Net Worth across Trisula Banking & Assets.
                    </p>
                </header>

                <WealthOverview />
            </div>
        </div>
    );
}
