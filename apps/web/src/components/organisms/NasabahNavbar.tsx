"use client";

import Link from "next/link";
import Image from "next/image";
import { useAuth } from "@/src/hooks/useAuth";
import { Button } from "@/src/components/atoms";
import { LogOut, Home } from "lucide-react";

export function NasabahNavbar() {
    const { logout } = useAuth();

    return (
        <nav className="fixed top-0 w-full z-50 bg-charcoal-deep/80 backdrop-blur-xl border-b border-white/5 transition-all duration-300">
            <div className="max-w-6xl mx-auto px-6 h-20 flex items-center justify-between">
                {/* Logo + Brand */}
                <div className="flex items-center gap-3 group">
                    <div className="w-10 h-10 relative transition-transform duration-500 group-hover:rotate-12">
                        <Image
                            src="/icon.png"
                            alt="Trisula"
                            fill
                            className="object-contain drop-shadow-[0_0_10px_rgba(212,175,55,0.4)]"
                        />
                    </div>
                    <div className="flex flex-col">
                        <span className="text-lg font-bold tracking-tight text-white group-hover:text-gold-metallic transition-colors">
                            TRISULA
                        </span>
                        <span className="text-[9px] font-bold uppercase tracking-[0.2em] text-gold-metallic/60">
                            Dashboard Nasabah
                        </span>
                    </div>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-3">
                    <Link href="/">
                        <Button variant="ghost" size="sm" className="gap-2 text-zinc-400 hover:text-white">
                            <Home className="w-4 h-4" />
                            <span className="hidden sm:inline">Beranda</span>
                        </Button>
                    </Link>
                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => logout()}
                        className="gap-2 text-zinc-400 hover:text-red-400"
                    >
                        <LogOut className="w-4 h-4" />
                        <span className="hidden sm:inline">Keluar</span>
                    </Button>
                </div>
            </div>
        </nav>
    );
}
