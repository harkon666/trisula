"use client";

import Link from "next/link";
import Image from "next/image";
import { useAuth } from "@/src/hooks/useAuth";
import { Button } from "@/src/components/atoms";
import { LogOut, Home, Users, PieChart, Bell, AlertTriangle } from "lucide-react";
import { useAgentReminders } from "@/src/hooks/useAgentDashboard";
import { useState, useRef, useEffect } from "react";
import { AnimatePresence, motion } from "framer-motion";

export function AgentNavbar() {
    const { logout } = useAuth();
    const { data: reminders } = useAgentReminders();
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);
    const dropdownRef = useRef<HTMLDivElement>(null);

    // Close dropdown when clicking outside
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setIsDropdownOpen(false);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    return (
        <nav className="fixed top-0 w-full z-50 bg-midnight-950/80 backdrop-blur-xl border-b border-white/5 transition-all duration-300">
            <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
                {/* Logo + Brand */}
                <div className="flex items-center gap-3 group">
                    <div className="w-10 h-10 relative transition-transform duration-500 group-hover:rotate-12">
                        <Image
                            src="/icon.png"
                            alt="Trisula"
                            fill
                            className="object-contain drop-shadow-[0_0_10px_rgba(0,35,102,0.4)]"
                        />
                    </div>
                    <div className="flex flex-col">
                        <span className="text-lg font-bold tracking-tight text-white group-hover:text-trisula-400 transition-colors">
                            TRISULA
                        </span>
                        <span className="text-[9px] font-bold uppercase tracking-[0.2em] text-trisula-500/60">
                            Agent Portal
                        </span>
                    </div>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-3">
                    <Link href="/dashboard/agent">
                        <Button variant="ghost" size="sm" className="gap-2 text-zinc-400 hover:text-white">
                            <Home className="w-4 h-4" />
                            <span className="hidden sm:inline">Overview</span>
                        </Button>
                    </Link>
                    {/* Placeholder for future links */}
                    {/* <Button variant="ghost" size="sm" className="gap-2 text-zinc-400 hover:text-white">
                        <Users className="w-4 h-4" />
                        <span className="hidden sm:inline">Nasabah</span>
                    </Button> */}
                    {/* Reminder Bell */}
                    <div className="relative" ref={dropdownRef}>
                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                            className="relative text-zinc-400 hover:text-white min-w-[32px] min-h-[32px] p-2"
                        >
                            <Bell className="w-5 h-5" />
                            {reminders && reminders.length > 0 && (
                                <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full animate-pulse shadow-[0_0_8px_rgba(239,68,68,0.8)]" />
                            )}
                        </Button>

                        <AnimatePresence>
                            {isDropdownOpen && (
                                <motion.div
                                    initial={{ opacity: 0, y: 10, scale: 0.95 }}
                                    animate={{ opacity: 1, y: 0, scale: 1 }}
                                    exit={{ opacity: 0, y: 10, scale: 0.95 }}
                                    transition={{ duration: 0.2 }}
                                    className="absolute right-0 mt-2 w-80 bg-midnight-900 border border-white/10 rounded-2xl shadow-2xl overflow-hidden z-50"
                                >
                                    <div className="p-4 border-b border-white/5 bg-midnight-950/50">
                                        <h3 className="font-bold text-white text-sm">Reminders</h3>
                                        <p className="text-xs text-zinc-500 mt-1">Jatuh tempo polis nasabah</p>
                                    </div>
                                    <div className="max-h-[300px] overflow-y-auto scrollbar-thin scrollbar-thumb-white/10">
                                        {reminders && reminders.length > 0 ? (
                                            <div className="p-2 space-y-1">
                                                {/* Group by category */}
                                                {(() => {
                                                    const h7 = reminders.filter(r => r.daysLeft !== undefined && r.daysLeft <= 7);
                                                    const oneMonth = reminders.filter(r => r.daysLeft !== undefined && r.daysLeft > 7 && r.daysLeft <= 30);
                                                    const twoMonths = reminders.filter(r => r.daysLeft !== undefined && r.daysLeft > 30 && r.daysLeft <= 60);
                                                    const threeMonths = reminders.filter(r => r.daysLeft !== undefined && r.daysLeft > 60);

                                                    return (
                                                        <>
                                                            {h7.length > 0 && (
                                                                <div className="space-y-1">
                                                                    <div className="flex items-center gap-2 px-3 py-1">
                                                                        <span className="text-[10px] font-black uppercase tracking-widest text-red-400">7 Hari</span>
                                                                        <div className="flex-1 h-px bg-red-400/20" />
                                                                    </div>
                                                                    {h7.map((r, i) => <ReminderItem key={i} r={r} />)}
                                                                </div>
                                                            )}
                                                            {oneMonth.length > 0 && (
                                                                <div className="space-y-1">
                                                                    <div className="flex items-center gap-2 px-3 py-1">
                                                                        <span className="text-[10px] font-black uppercase tracking-widest text-orange-400">1 Bulan</span>
                                                                        <div className="flex-1 h-px bg-orange-400/20" />
                                                                    </div>
                                                                    {oneMonth.map((r, i) => <ReminderItem key={i} r={r} />)}
                                                                </div>
                                                            )}
                                                            {twoMonths.length > 0 && (
                                                                <div className="space-y-1">
                                                                    <div className="flex items-center gap-2 px-3 py-1">
                                                                        <span className="text-[10px] font-black uppercase tracking-widest text-yellow-400">2 Bulan</span>
                                                                        <div className="flex-1 h-px bg-yellow-400/20" />
                                                                    </div>
                                                                    {twoMonths.map((r, i) => <ReminderItem key={i} r={r} />)}
                                                                </div>
                                                            )}
                                                            {threeMonths.length > 0 && (
                                                                <div className="space-y-1">
                                                                    <div className="flex items-center gap-2 px-3 py-1">
                                                                        <span className="text-[10px] font-black uppercase tracking-widest text-green-400">3 Bulan</span>
                                                                        <div className="flex-1 h-px bg-green-400/20" />
                                                                    </div>
                                                                    {threeMonths.map((r, i) => <ReminderItem key={i} r={r} />)}
                                                                </div>
                                                            )}
                                                        </>
                                                    );
                                                })()}
                                            </div>
                                        ) : (
                                            <div className="p-8 text-center">
                                                <div className="w-12 h-12 bg-white/5 rounded-full flex items-center justify-center mx-auto mb-3">
                                                    <Bell className="w-5 h-5 text-zinc-600" />
                                                </div>
                                                <p className="text-sm text-zinc-400 font-medium">Tidak ada reminder</p>
                                                <p className="text-xs text-zinc-600 mt-1">Semua polis aman</p>
                                            </div>
                                        )}
                                    </div>
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </div>

                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => logout()}
                        className="gap-2 text-zinc-400 hover:text-red-400 ml-2"
                    >
                        <LogOut className="w-4 h-4" />
                        <span className="hidden sm:inline">Sign Out</span>
                    </Button>
                </div>
            </div>
        </nav>
    );
}

function ReminderItem({ r }: { r: any }) {
    return (
        <div className="p-3 hover:bg-white/5 rounded-xl transition-colors">
            <div className="flex items-start justify-between gap-3 mb-1">
                <p className="text-sm font-bold text-white">{r.nasabahName}</p>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-amber-500/10 text-amber-400 border border-amber-500/20 whitespace-nowrap">
                    {r.daysLeft || r.monthsLeft * 30} Hari
                </span>
            </div>
            <p className="text-xs text-zinc-400 mb-1">Polis #{r.polisNumber}</p>
            <p className="text-[10px] text-zinc-500">{r.message}</p>
        </div>
    );
}
