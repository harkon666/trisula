"use client";

import { useAdminPolisReminders, PolisReminder } from "@/src/hooks/useAdminReminders";
import { useEffect, useState, useRef } from "react";
import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import { Bell, X, Calendar, AlertTriangle } from "lucide-react";

export const GlobalPolisReminderAlert = ({ onFocus }: { onFocus?: () => void }) => {
    const { data: reminders } = useAdminPolisReminders();
    const [visibleCount, setVisibleCount] = useState(0);
    const [showPanel, setShowPanel] = useState(false);
    const panelRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (reminders && reminders.length > 0) {
            setVisibleCount(reminders.length);
        } else {
            setVisibleCount(0);
        }
    }, [reminders]);

    useGSAP(() => {
        if (visibleCount > 0) {
            gsap.to("#polis-reminder-dot", {
                scale: 1.3,
                opacity: 0.5,
                duration: 0.8,
                repeat: -1,
                yoyo: true,
                ease: "sine.inOut"
            });
        }
    }, [visibleCount]);

    if (!visibleCount) return null;

    const getReminderLabel = (daysLeft: number, type: string) => {
        if (daysLeft <= 7) return "7 Hari";
        if (daysLeft <= 30) return "1 Bulan";
        if (daysLeft <= 60) return "2 Bulan";
        if (daysLeft <= 90) return "3 Bulan";
        return `${daysLeft} Hari`;
    };

    const groupedReminders = {
        h7: reminders?.filter(r => r.type === 'h7') || [],
        oneMonth: reminders?.filter(r => r.type === 'monthly' && r.daysLeft <= 30) || [],
        twoMonths: reminders?.filter(r => r.type === 'monthly' && r.daysLeft > 30 && r.daysLeft <= 60) || [],
        threeMonths: reminders?.filter(r => r.type === 'monthly' && r.daysLeft > 60) || [],
    };

    return (
        <div className="fixed bottom-6 left-6 z-50" id="polis-reminder-container">
            {/* Bell Button */}
            <button
                onClick={() => setShowPanel(!showPanel)}
                className="relative flex items-center gap-3 bg-amber-600 hover:bg-amber-500 text-white rounded-2xl shadow-2xl border border-amber-400/30 p-4 transition-all hover:scale-105 active:scale-95 group"
            >
                {/* Blinking Dot */}
                <div className="relative">
                    <div id="polis-reminder-dot" className="w-3 h-3 bg-red-400 rounded-full" />
                    <div className="absolute inset-0 w-3 h-3 bg-red-400 rounded-full animate-ping" />
                </div>

                <div className="flex flex-col items-start">
                    <span className="text-xs font-bold uppercase tracking-widest opacity-80">Polis Jatuh Tempo</span>
                    <span className="text-sm font-black">{visibleCount} Reminder</span>
                </div>
            </button>

            {/* Notification Panel */}
            {showPanel && (
                <div
                    ref={panelRef}
                    className="absolute bottom-full left-0 mb-3 w-96 bg-charcoal-900/95 backdrop-blur-xl border border-white/10 rounded-2xl shadow-2xl overflow-hidden"
                    style={{ animation: 'slideUp 0.2s ease-out' }}
                >
                    {/* Panel Header */}
                    <div className="flex items-center justify-between p-4 border-b border-white/5 bg-midnight-900/80">
                        <div className="flex items-center gap-2">
                            <Calendar className="w-5 h-5 text-amber-500" />
                            <span className="font-bold text-white">Polis Jatuh Tempo</span>
                        </div>
                        <button
                            onClick={() => setShowPanel(false)}
                            className="p-1 rounded-lg hover:bg-white/10 text-zinc-400 hover:text-white transition-colors"
                        >
                            <X className="w-4 h-4" />
                        </button>
                    </div>

                    {/* Reminder Groups */}
                    <div className="max-h-80 overflow-y-auto p-2 space-y-3">
                        {/* H-7 Section */}
                        {groupedReminders.h7.length > 0 && (
                            <div className="space-y-1">
                                <div className="flex items-center gap-2 px-3 py-2">
                                    <span className="text-[10px] font-black uppercase tracking-widest text-red-400">7 Hari</span>
                                    <div className="flex-1 h-px bg-red-400/30" />
                                </div>
                                {groupedReminders.h7.map((reminder) => (
                                    <ReminderItem
                                        key={reminder.id}
                                        reminder={reminder}
                                        onClick={() => {
                                            setShowPanel(false);
                                            onFocus?.();
                                        }}
                                    />
                                ))}
                            </div>
                        )}

                        {/* 1 Bulan Section */}
                        {groupedReminders.oneMonth.length > 0 && (
                            <div className="space-y-1">
                                <div className="flex items-center gap-2 px-3 py-2">
                                    <span className="text-[10px] font-black uppercase tracking-widest text-orange-400">1 Bulan</span>
                                    <div className="flex-1 h-px bg-orange-400/30" />
                                </div>
                                {groupedReminders.oneMonth.map((reminder) => (
                                    <ReminderItem
                                        key={reminder.id}
                                        reminder={reminder}
                                        onClick={() => {
                                            setShowPanel(false);
                                            onFocus?.();
                                        }}
                                    />
                                ))}
                            </div>
                        )}

                        {/* 2 Bulan Section */}
                        {groupedReminders.twoMonths.length > 0 && (
                            <div className="space-y-1">
                                <div className="flex items-center gap-2 px-3 py-2">
                                    <span className="text-[10px] font-black uppercase tracking-widest text-yellow-400">2 Bulan</span>
                                    <div className="flex-1 h-px bg-yellow-400/30" />
                                </div>
                                {groupedReminders.twoMonths.map((reminder) => (
                                    <ReminderItem
                                        key={reminder.id}
                                        reminder={reminder}
                                        onClick={() => {
                                            setShowPanel(false);
                                            onFocus?.();
                                        }}
                                    />
                                ))}
                            </div>
                        )}

                        {/* 3 Bulan Section */}
                        {groupedReminders.threeMonths.length > 0 && (
                            <div className="space-y-1">
                                <div className="flex items-center gap-2 px-3 py-2">
                                    <span className="text-[10px] font-black uppercase tracking-widest text-green-400">3 Bulan</span>
                                    <div className="flex-1 h-px bg-green-400/30" />
                                </div>
                                {groupedReminders.threeMonths.map((reminder) => (
                                    <ReminderItem
                                        key={reminder.id}
                                        reminder={reminder}
                                        onClick={() => {
                                            setShowPanel(false);
                                            onFocus?.();
                                        }}
                                    />
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Footer */}
                    <div className="p-3 border-t border-white/5 bg-midnight-950/50">
                        <button
                            onClick={() => {
                                setShowPanel(false);
                                onFocus?.();
                            }}
                            className="w-full py-2 rounded-xl bg-amber-600 hover:bg-amber-500 text-white text-sm font-bold transition-colors"
                        >
                            Lihat Detail Polis
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
};

function ReminderItem({ reminder, onClick }: { reminder: PolisReminder; onClick: () => void }) {
    return (
        <button
            onClick={onClick}
            className="w-full text-left p-3 rounded-xl bg-white/5 hover:bg-white/10 border border-transparent hover:border-white/10 transition-all group"
        >
            <div className="flex items-start gap-3">
                <div className="p-2 rounded-lg bg-amber-500/20 text-amber-400 group-hover:bg-amber-500/30 transition-colors">
                    <AlertTriangle className="w-4 h-4" />
                </div>
                <div className="flex-1 min-w-0">
                    <p className="text-sm font-bold text-white truncate">{reminder.nasabahName}</p>
                    <p className="text-xs text-zinc-400 mt-0.5">Polis #{reminder.polisNumber}</p>
                    <p className="text-xs text-zinc-500 mt-1 leading-relaxed">{reminder.message}</p>
                </div>
                <div className="flex flex-col items-end">
                    <span className="text-xs font-black text-amber-400">{reminder.daysLeft} Hari</span>
                    <span className="text-[10px] text-zinc-500">{reminder.agentName}</span>
                </div>
            </div>
        </button>
    );
}