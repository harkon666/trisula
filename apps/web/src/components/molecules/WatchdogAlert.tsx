"use client";

import { useAgentWatchdog } from "@/src/hooks/useAgentDashboard";
import { useWatchdogStore } from "@/src/store/useWatchdogStore";
import { AlertTriangle, X, ArrowRight } from "lucide-react";
import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import { useRef } from "react";

export const WatchdogAlert = () => {
    const { data, isLoading } = useAgentWatchdog();
    const { dismissed, dismiss } = useWatchdogStore();
    const alertRef = useRef<HTMLDivElement>(null);

    const hasUrgent = data?.hasUrgent && !dismissed;

    useGSAP(() => {
        if (hasUrgent) {
            gsap.fromTo(alertRef.current,
                { y: -50, opacity: 0 },
                { y: 0, opacity: 1, duration: 0.5, ease: "back.out(1.7)" }
            );
        }
    }, { dependencies: [hasUrgent] });

    if (isLoading || !hasUrgent) return null;

    return (
        <div ref={alertRef} className="fixed top-24 right-6 z-40 max-w-sm w-full">
            <div className="bg-red-500/10 border border-red-500/50 backdrop-blur-xl rounded-2xl p-4 shadow-[0_0_30px_rgba(239,68,68,0.2)] flex items-start gap-4 relative overflow-hidden group">
                {/* Pulse Effect */}
                <div className="absolute inset-0 bg-red-500/5 animate-pulse rounded-2xl pointer-events-none" />

                <div className="w-10 h-10 rounded-full bg-red-500/20 flex items-center justify-center text-red-500 shrink-0">
                    <AlertTriangle className="w-5 h-5" />
                </div>

                <div className="flex-1">
                    <h4 className="font-bold text-white text-sm mb-1">Attention Needed!</h4>
                    <p className="text-xs text-zinc-300 mb-3 leading-relaxed">
                        You have <strong className="text-red-400">{data.data.length} potential Nasabah</strong> waiting for a response &gt; 5 mins.
                    </p>

                    <button className="text-xs font-bold uppercase tracking-wider text-red-400 hover:text-red-300 flex items-center gap-1 transition-colors">
                        Check Interactions <ArrowRight className="w-3 h-3" />
                    </button>
                </div>

                <button
                    onClick={dismiss}
                    className="absolute top-2 right-2 p-1.5 text-zinc-500 hover:text-white rounded-lg hover:bg-white/10 transition-colors"
                >
                    <X className="w-3 h-3" />
                </button>
            </div>
        </div>
    );
};
