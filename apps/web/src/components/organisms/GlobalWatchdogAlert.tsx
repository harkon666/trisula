"use client";

import { useWatchdogAlerts } from "@/src/hooks/useAdminWatchdog";
import { ShieldAlert, AlertTriangle, ArrowRight } from "lucide-react";
import { useEffect, useState } from "react";
import { Button } from "@/src/components/atoms";
import { useGSAP } from "@gsap/react";
import gsap from "gsap";

export const GlobalWatchdogAlert = ({ onFocus }: { onFocus: () => void }) => {
    const { data: alerts } = useWatchdogAlerts();
    const [urgentCount, setUrgentCount] = useState(0);

    useEffect(() => {
        if (alerts) {
            const urgent = alerts.filter(a => {
                const diff = Date.now() - new Date(a.clickedAt).getTime();
                return diff > 5 * 60 * 1000; // > 5 mins
            });
            setUrgentCount(urgent.length);
        }
    }, [alerts]);

    useGSAP(() => {
        if (urgentCount > 0) {
            gsap.fromTo("#urgent-banner",
                { y: 100, opacity: 0 },
                { y: 0, opacity: 1, duration: 0.5, ease: "back.out(1.7)" }
            );
            gsap.to("#urgent-pulse", {
                scale: 1.2,
                opacity: 0,
                duration: 1,
                repeat: -1
            });
        }
    }, [urgentCount]);

    if (!urgentCount) return null;

    return (
        <div className="fixed bottom-6 right-6 z-50 max-w-sm w-full" id="urgent-banner">
            <div className="relative overflow-hidden bg-red-600 text-white rounded-2xl shadow-2xl border border-red-400 p-6">
                {/* Background Pulse Effect */}
                <div id="urgent-pulse" className="absolute -right-4 -top-4 w-24 h-24 bg-white/20 rounded-full blur-xl pointer-events-none" />

                <div className="relative z-10 flex flex-col gap-3">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-white/20 rounded-lg animate-pulse">
                            <ShieldAlert className="w-6 h-6" />
                        </div>
                        <div>
                            <h3 className="font-bold text-lg leading-none">CRITICAL ALERT</h3>
                            <p className="text-red-100 text-xs mt-1">
                                {urgentCount} Nasabah menunggu &gt; 5 menit!
                            </p>
                        </div>
                    </div>

                    <p className="text-sm text-red-100/90 leading-relaxed border-l-2 border-white/20 pl-3">
                        Mohon segera selesaikan interaksi ini untuk menjaga standar layanan Sultan.
                    </p>

                    <Button
                        onClick={onFocus}
                        className="w-full bg-white text-red-600 hover:bg-red-50 font-bold mt-2 shadow-lg"
                    >
                        Tangani Sekarang
                        <ArrowRight className="w-4 h-4 ml-2" />
                    </Button>
                </div>
            </div>
        </div>
    );
};
