"use client";

import { useRef } from "react";
import { Button } from "@/src/components/atoms";
import { CalendarCheck, Check, Sparkles } from "lucide-react";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";

interface DailyCheckInProps {
    onClaim: () => void;
    isPending: boolean;
    alreadyClaimed?: boolean;
}

export function DailyCheckIn({ onClaim, isPending, alreadyClaimed }: DailyCheckInProps) {
    const buttonRef = useRef<HTMLDivElement>(null);
    const glowRef = useRef<HTMLDivElement>(null);

    useGSAP(() => {
        if (!buttonRef.current || alreadyClaimed) return;

        const el = buttonRef.current;

        // Hover glow pulse
        const enterHandler = () => {
            gsap.to(el, {
                scale: 1.03,
                duration: 0.3,
                ease: "power2.out",
            });
            if (glowRef.current) {
                gsap.to(glowRef.current, {
                    opacity: 1,
                    scale: 1.1,
                    duration: 0.4,
                    ease: "power2.out",
                });
            }
        };

        const leaveHandler = () => {
            gsap.to(el, {
                scale: 1,
                duration: 0.3,
                ease: "power2.inOut",
            });
            if (glowRef.current) {
                gsap.to(glowRef.current, {
                    opacity: 0,
                    scale: 1,
                    duration: 0.3,
                    ease: "power2.inOut",
                });
            }
        };

        el.addEventListener("mouseenter", enterHandler);
        el.addEventListener("mouseleave", leaveHandler);

        return () => {
            el.removeEventListener("mouseenter", enterHandler);
            el.removeEventListener("mouseleave", leaveHandler);
        };
    }, { scope: buttonRef, dependencies: [alreadyClaimed] });

    if (alreadyClaimed) {
        return (
            <div className="relative rounded-2xl border border-emerald-500/20 bg-emerald-500/5 p-5 flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-emerald-500/10 flex items-center justify-center shrink-0">
                    <Check className="w-6 h-6 text-emerald-400" />
                </div>
                <div>
                    <p className="text-emerald-400 font-bold text-sm">Check-In Harian Selesai ✓</p>
                    <p className="text-zinc-500 text-xs mt-0.5">
                        Bonus harian sudah diklaim. Kembali lagi besok!
                    </p>
                </div>
            </div>
        );
    }

    return (
        <div ref={buttonRef} className="relative">
            {/* Glow effect behind button */}
            <div
                ref={glowRef}
                className="absolute inset-0 rounded-2xl bg-gold-metallic/20 blur-xl opacity-0 pointer-events-none"
            />

            <button
                onClick={onClaim}
                disabled={isPending}
                className="relative w-full rounded-2xl border border-gold-metallic/30 bg-gradient-to-r from-gold-dark/20 via-gold-metallic/10 to-gold-dark/20 p-5 flex items-center gap-4 transition-colors hover:border-gold-metallic/50 disabled:opacity-50 disabled:cursor-not-allowed group"
            >
                <div className="w-12 h-12 rounded-xl bg-gold-metallic/15 flex items-center justify-center shrink-0 group-hover:bg-gold-metallic/25 transition-colors">
                    {isPending ? (
                        <svg className="animate-spin w-6 h-6 text-gold-metallic" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                        </svg>
                    ) : (
                        <CalendarCheck className="w-6 h-6 text-gold-metallic" />
                    )}
                </div>

                <div className="text-left flex-1">
                    <p className="text-white font-bold text-sm flex items-center gap-2">
                        Klaim Bonus Harian
                        <Sparkles className="w-3.5 h-3.5 text-gold-metallic" />
                    </p>
                    <p className="text-zinc-500 text-xs mt-0.5">
                        Dapatkan <span className="text-gold-metallic font-semibold">+10 Poin</span> setiap hari
                    </p>
                </div>

                <div className="text-gold-metallic text-xs font-bold uppercase tracking-wider opacity-60 group-hover:opacity-100 transition-opacity">
                    Klaim →
                </div>
            </button>
        </div>
    );
}
