"use client";

import Link from "next/link";
import { useRef } from "react";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import { useAuth } from "@/src/hooks/useAuth";
import { Button } from "@/src/components/atoms";

export function HeroSection() {
    const container = useRef<HTMLDivElement>(null);
    const { isAuthenticated, isLoading } = useAuth();

    useGSAP(() => {
        const tl = gsap.timeline({ defaults: { ease: "power4.out" } });

        tl.fromTo(".hero-badge",
            { y: 20, opacity: 0 },
            { y: 0, opacity: 1, duration: 1, delay: 0.2 }
        )
            .fromTo(".hero-title",
                { y: 50, opacity: 0 },
                { y: 0, opacity: 1, duration: 1.2, stagger: 0.1 },
                "-=0.8"
            )
            .fromTo(".hero-desc",
                { y: 30, opacity: 0 },
                { y: 0, opacity: 1, duration: 1 },
                "-=1"
            )
            .fromTo(".hero-cta",
                { y: 20, opacity: 0 },
                { y: 0, opacity: 1, duration: 0.8, stagger: 0.2 },
                "-=0.8"
            );

    }, { scope: container });

    return (
        <section ref={container} className="relative pt-40 pb-32 md:pt-56 md:pb-40 overflow-hidden z-10">
            <div className="max-w-7xl mx-auto px-6 text-center">

                {/* Badge */}
                <div className="hero-badge inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 border border-white/10 mb-8 backdrop-blur-sm opacity-0 mx-auto">
                    <span className="w-2 h-2 rounded-full bg-trisula-500 animate-pulse" />
                    <span className="text-xs font-bold tracking-widest uppercase text-trisula-300">The New Standard of Wealth</span>
                </div>

                {/* Title */}
                <h1 className="hero-title text-5xl md:text-7xl lg:text-8xl font-black tracking-tight mb-8 leading-[1.1] opacity-0">
                    Unlock Your <br className="hidden md:block" />
                    <span className="text-transparent bg-clip-text bg-gradient-to-r from-trisula-200 via-trisula-400 to-trisula-600 drop-shadow-sm filter">
                        Premium Legacy
                    </span>
                </h1>

                {/* Description */}
                <p className="hero-desc text-lg md:text-xl text-zinc-400 max-w-2xl mx-auto mb-12 leading-relaxed font-light opacity-0">
                    Join the most exclusive referral and loyalty ecosystem.
                    Accumulate <span className="text-white font-semibold">Trisula Points</span>, unlock tiered rewards, and build your digital empire.
                </p>

                {/* CTA */}
                <div className="hero-cta flex flex-col md:flex-row items-center justify-center gap-6 opacity-0">
                    {isLoading ? (
                        <div className="h-14 w-48 rounded-full bg-white/5 animate-pulse" />
                    ) : isAuthenticated ? (
                        <Link href="/dashboard">
                            <Button variant="primary" size="lg" className="group">
                                Enter Dashboard
                            </Button>
                        </Link>
                    ) : (
                        <>
                            <Link href="/auth/register">
                                <Button variant="primary" size="lg">
                                    Start Your Legacy
                                </Button>
                            </Link>
                            <Link href="#how-it-works">
                                <Button variant="ghost" size="lg" className="border border-white/10">
                                    Learn More
                                </Button>
                            </Link>
                        </>
                    )}
                </div>
            </div>
        </section>
    );
}
