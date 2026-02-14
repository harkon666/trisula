"use client";

import Link from "next/link";
import Image from "next/image";
import { useAuth } from "@/src/hooks/useAuth";
import { Button } from "@/src/components/atoms";
import { LogOut, Home, Users, PieChart } from "lucide-react";

export function AgentNavbar() {
    const { logout } = useAuth();

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
