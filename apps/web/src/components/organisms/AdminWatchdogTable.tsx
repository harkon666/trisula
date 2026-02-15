"use client";

import { useWatchdogAlerts, useResolveWatchdog } from "@/src/hooks/useAdminWatchdog";
import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import { useRef, useState, useEffect } from "react";
import { ShieldAlert, CheckCircle, Phone, Clock, User, UserCog } from "lucide-react";
import { Button } from "@/src/components/atoms";

export const AdminWatchdogTable = () => {
    const { data: alerts, isLoading } = useWatchdogAlerts();
    const { mutate: resolve, isPending } = useResolveWatchdog();
    const tableRef = useRef<HTMLDivElement>(null);

    // Stagger Entrance
    useGSAP(() => {
        if (alerts && alerts.length > 0) {
            gsap.from(".alert-row", {
                y: 20,
                opacity: 0,
                duration: 0.5,
                stagger: 0.05,
                ease: "power2.out",
                clearProps: "all"
            });
        }
    }, { dependencies: [alerts], scope: tableRef });

    // Continuous Pulse for Urgent Items (> 5 mins)
    useGSAP(() => {
        if (alerts && alerts.some(a => isUrgent(a.clickedAt))) {
            gsap.to(".urgent-row", {
                boxShadow: "0 0 15px rgba(212, 175, 55, 0.4)",
                borderColor: "rgba(212, 175, 55, 0.6)",
                repeat: -1,
                yoyo: true,
                duration: 1.5,
                ease: "sine.inOut"
            });
        }
    }, { dependencies: [alerts], scope: tableRef });

    if (isLoading) {
        return (
            <div className="w-full h-64 bg-white/5 rounded-3xl animate-pulse flex items-center justify-center">
                <span className="text-zinc-500 font-medium flex items-center gap-2">
                    <ShieldAlert className="w-5 h-5" />
                    Scanning Interactions...
                </span>
            </div>
        );
    }

    if (!alerts || alerts.length === 0) {
        return (
            <div className="w-full p-12 text-center border border-white/5 rounded-3xl bg-white/5 flex flex-col items-center justify-center gap-4">
                <div className="w-16 h-16 rounded-full bg-green-500/10 flex items-center justify-center">
                    <CheckCircle className="w-8 h-8 text-green-500" />
                </div>
                <div>
                    <h3 className="text-xl font-bold text-white">All Clear</h3>
                    <p className="text-zinc-400">No unhandled interactions pending.</p>
                </div>
            </div>
        );
    }

    return (
        <div ref={tableRef} className="w-full space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h3 className="text-xl font-bold text-white flex items-center gap-2">
                        <ShieldAlert className="w-6 h-6 text-gold-metallic" />
                        Watchdog Monitor
                    </h3>
                    <p className="text-zinc-400 text-xs mt-1">
                        Real-time tracking of unresponded Nasabah interactions.
                    </p>
                </div>
                <div className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
                    <span className="text-xs font-mono text-red-500 font-bold">LIVE</span>
                </div>
            </div>

            <div className="grid gap-3">
                {alerts.map((alert) => (
                    <AlertRow
                        key={alert.id}
                        alert={alert}
                        onResolve={() => resolve(alert.id)}
                        isResolving={isPending}
                    />
                ))}
            </div>
        </div>
    );
};

// --- Sub Component: Alert Row with Timer ---
const AlertRow = ({ alert, onResolve, isResolving }: any) => {
    const elapsed = useElapsedTime(alert.clickedAt);
    const urgent = elapsed.minutes >= 5;
    const warning = elapsed.minutes >= 3 && elapsed.minutes < 5;

    // Traffic Light Colors
    let timeColor = "text-white";
    if (warning) timeColor = "text-gold-metallic";
    if (urgent) timeColor = "text-red-500 animate-pulse font-bold";

    return (
        <div className={`alert-row p-4 rounded-xl border bg-midnight-900/50 backdrop-blur-sm flex flex-col md:flex-row items-center justify-between gap-4 transition-all
            ${urgent ? 'urgent-row border-gold-metallic/30' : 'border-white/5 hover:border-white/10'}
        `}>
            {/* 1. Nasabah Info */}
            <div className="flex items-center gap-4 flex-1 min-w-0">
                <div className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center shrink-0">
                    <User className="w-5 h-5 text-zinc-400" />
                </div>
                <div className="min-w-0">
                    <h4 className="text-white font-bold truncate">{alert.nasabah.name}</h4>
                    <p className="text-zinc-500 text-xs flex items-center gap-1">
                        <Phone className="w-3 h-3" />
                        {alert.nasabah.whatsapp}
                    </p>
                </div>
            </div>

            {/* 2. Agent Info */}
            <div className="flex items-center gap-3 flex-1 min-w-0 md:pl-4 md:border-l border-white/5">
                <div className="w-8 h-8 rounded-full bg-indigo-500/10 flex items-center justify-center shrink-0">
                    <UserCog className="w-4 h-4 text-indigo-400" />
                </div>
                <div className="min-w-0">
                    <p className="text-zinc-400 text-xs uppercase tracking-wider font-bold">Assigned Agent</p>
                    <p className="text-indigo-300 text-sm truncate">{alert.agent.name}</p>
                </div>
            </div>

            {/* 3. Timer */}
            <div className="flex flex-col items-center justify-center px-4 min-w-[100px]">
                <div className={`text-xl font-mono flex items-center gap-2 ${timeColor}`}>
                    <Clock className="w-4 h-4" />
                    <span>{pad(elapsed.minutes)}:{pad(elapsed.seconds)}</span>
                </div>
                <span className="text-[10px] text-zinc-500 uppercase tracking-widest font-bold">Waiting</span>
            </div>

            {/* 4. Actions */}
            <div className="flex items-center gap-2 w-full md:w-auto">
                <Button
                    variant="outline"
                    size="sm"
                    className="flex-1 md:flex-none h-9 text-xs border-white/10 hover:bg-gold-metallic/10 hover:text-gold-metallic hover:border-gold-metallic/30"
                    onClick={() => {
                        const message = `Halo Bapak/Ibu ${alert.nasabah.name}, saya Admin TRISULA. Apakah sudah terhubung dengan Agen kami? Ada yang bisa saya bantu?`;
                        window.open(`https://wa.me/${alert.nasabah.whatsapp}?text=${encodeURIComponent(message)}`, '_blank');
                    }}
                >
                    <Phone className="w-3 h-3 mr-2" />
                    Hubungi
                </Button>
                <Button
                    variant="primary"
                    size="sm"
                    className="flex-1 md:flex-none h-9 text-xs bg-gold-metallic text-midnight-950 hover:bg-yellow-400"
                    onClick={onResolve}
                    disabled={isResolving}
                >
                    <CheckCircle className="w-3 h-3 mr-2" />
                    Selesaikan
                </Button>
            </div>
        </div>
    );
};

// --- Helpers ---

const isUrgent = (dateString: string) => {
    const diff = Date.now() - new Date(dateString).getTime();
    return diff > 5 * 60 * 1000;
};

const pad = (num: number) => num.toString().padStart(2, '0');

// Hook for live timer
function useElapsedTime(startTime: string) {
    const [elapsed, setElapsed] = useState({ minutes: 0, seconds: 0 });

    useEffect(() => {
        const start = new Date(startTime).getTime();

        const tick = () => {
            const now = Date.now();
            const diff = Math.max(0, now - start);
            const minutes = Math.floor(diff / 60000);
            const seconds = Math.floor((diff % 60000) / 1000);
            setElapsed({ minutes, seconds });
        };

        tick(); // Init immediately
        const interval = setInterval(tick, 1000);
        return () => clearInterval(interval);
    }, [startTime]);

    return elapsed;
}
