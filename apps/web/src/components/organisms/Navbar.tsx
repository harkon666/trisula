"use client";

import Link from "next/link";
import Image from "next/image";
import { useAuth } from "@/src/hooks/useAuth";
import { Button } from "@/src/components/atoms";
import { ArrowRight } from "lucide-react";

export function Navbar() {
    const { isAuthenticated } = useAuth();

    return (
        <nav className="fixed top-0 w-full z-50 bg-midnight-950/70 backdrop-blur-xl border-b border-white/5 transition-all duration-300">
            <div className="max-w-7xl mx-auto px-6 h-24 flex items-center justify-between">
                {/* Logo */}
                <div className="flex items-center gap-3 group cursor-pointer">
                    <div className="w-14 h-14 relative transition-transform duration-500 group-hover:rotate-12">
                        <Image
                            src="/icon.png"
                            alt="Trisula"
                            fill
                            className="object-contain drop-shadow-[0_0_15px_rgba(234,179,8,0.5)]"
                        />
                    </div>
                    <span className="text-2xl font-bold tracking-tight text-white group-hover:text-trisula-400 transition-colors">
                        TRISULA
                    </span>
                </div>

                {/* Links (Desktop) */}
                <div className="hidden md:flex items-center gap-10 text-sm font-medium text-zinc-400">
                    {["Benefits", "How it Works", "Testimonials"].map((item) => (
                        <Link
                            key={item}
                            href={`#${item.toLowerCase().replace(/\s/g, '-')}`}
                            className="relative hover:text-white transition-colors after:content-[''] after:absolute after:-bottom-1 after:left-0 after:w-0 after:h-px after:bg-trisula-500 hover:after:w-full after:transition-all"
                        >
                            {item}
                        </Link>
                    ))}
                </div>

                {/* Auth Action */}
                <div className="flex items-center gap-4">
                    {isAuthenticated ? (
                        <Link href="/dashboard/nasabah">
                            <Button variant="secondary" size="md" className="group">
                                Dashboard
                                <ArrowRight className="ml-2 w-4 h-4 group-hover:translate-x-1 transition-transform" />
                            </Button>
                        </Link>
                    ) : (
                        <Link href="/login">
                            <Button variant="primary" size="md">
                                Sign In
                            </Button>
                        </Link>
                    )}
                </div>
            </div>
        </nav>
    );
}
