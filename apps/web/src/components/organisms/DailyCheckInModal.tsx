"use client";

import { createContext, useContext, useState, useRef, useEffect } from "react";
import gsap from "gsap";
import { useNasabahDashboard } from "@/src/hooks/useNasabahDashboard";
import { Sparkles, X } from "lucide-react";
import { Button } from "@/src/components/atoms";

// --- Context ---
interface DailyCheckInModalContextType {
    isOpen: boolean;
    setIsOpen: (open: boolean) => void;
    triggerFirework: () => void;
    fireworkRef: React.RefObject<HTMLDivElement | null>;
}

const DailyCheckInModalContext = createContext<DailyCheckInModalContextType | undefined>(undefined);

export function useDailyCheckInModalContext() {
    const context = useContext(DailyCheckInModalContext);
    if (!context) {
        throw new Error("DailyCheckInModal sub-components must be used within DailyCheckInModal");
    }
    return context;
}

// --- Internal Root Component ---
function DailyCheckInModalRoot({ children }: { children: React.ReactNode }) {
    const [isOpen, setIsOpen] = useState(false);
    const fireworkRef = useRef<HTMLDivElement>(null);

    const triggerFirework = () => {
        if (!fireworkRef.current) return;
        const parent = fireworkRef.current;
        const particles = 60;

        for (let i = 0; i < particles; i++) {
            const particle = document.createElement("div");
            particle.className = "absolute w-1.5 h-1.5 bg-[#D4AF37] rounded-full";
            parent.appendChild(particle);

            const angle = Math.random() * Math.PI * 2;
            const distance = 100 + Math.random() * 250;

            gsap.to(particle, {
                x: Math.cos(angle) * distance,
                y: Math.sin(angle) * distance,
                opacity: 0,
                scale: 0.2,
                duration: 1.5 + Math.random(),
                ease: "power4.out",
                onComplete: () => particle.remove(),
            });

            gsap.to(particle, {
                scale: 1.5,
                repeat: 3,
                yoyo: true,
                duration: 0.2,
            });
        }
    };

    return (
        <DailyCheckInModalContext.Provider value={{ isOpen, setIsOpen, triggerFirework, fireworkRef }}>
            {children}
        </DailyCheckInModalContext.Provider>
    );
}

// --- Sub-components ---

function DailyCheckInModalTrigger({ children }: { children: React.ReactNode }) {
    const { setIsOpen } = useDailyCheckInModalContext();
    return (
        <div onClick={() => setIsOpen(true)} className="cursor-pointer">
            {children}
        </div>
    );
}

function DailyCheckInModalContent({ autoOpen = false }: { autoOpen?: boolean }) {
    const { isOpen, setIsOpen, triggerFirework, fireworkRef } = useDailyCheckInModalContext();
    const { claimDailyBonus, isDailyPending, dailyResult, profile, isProfileLoading } = useNasabahDashboard();
    const modalRef = useRef<HTMLDivElement>(null);

    // Auto-open logic: if claim is available and not open yet
    useEffect(() => {
        if (autoOpen && !isProfileLoading && profile && !profile.isDailyClaimed && !isOpen) {
            setIsOpen(true);
        }
    }, [autoOpen, isProfileLoading, profile, isOpen, setIsOpen]);

    useEffect(() => {
        if (isOpen && modalRef.current) {
            gsap.from(modalRef.current, {
                scale: 0.8,
                opacity: 0,
                duration: 0.5,
                ease: "back.out(1.7)",
            });
        }
    }, [isOpen]);

    if (!isOpen) return null;

    const handleClaim = () => {
        claimDailyBonus(undefined, {
            onSuccess: (data) => {
                if (data.awarded) {
                    triggerFirework();
                }
            }
        });
    };

    const isSuccess = dailyResult?.awarded === true;
    const alreadyClaimed = profile?.isDailyClaimed || dailyResult?.awarded === false;

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <div
                className="absolute inset-0 bg-black/80 backdrop-blur-md"
                onClick={() => setIsOpen(false)}
            />

            <div
                ref={modalRef}
                className="relative w-full max-w-sm overflow-hidden rounded-[2.5rem] bg-gradient-to-b from-royal-blue to-charcoal-deep border border-gold-metallic/30 p-8 text-center shadow-[0_0_50px_rgba(0,35,102,0.3)]"
            >
                <div ref={fireworkRef} className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 pointer-events-none z-0" />

                <div className="relative z-10">
                    <div className="mx-auto w-20 h-20 bg-gold-metallic/10 rounded-full flex items-center justify-center mb-6 border border-gold-metallic/20">
                        <Sparkles className="text-gold-metallic w-10 h-10 animate-pulse" />
                    </div>

                    <h2 className="text-3xl font-bold text-white mb-3 tracking-tight">
                        Selamat Datang, Sultan
                    </h2>
                    <p className="text-blue-100/60 mb-8 text-sm leading-relaxed">
                        Klaim <span className="text-gold-metallic font-bold">10 poin</span> harian Anda untuk menambah saldo eksklusif <span className="text-white font-semibold">TRISULA</span>.
                    </p>

                    <Button
                        onClick={handleClaim}
                        disabled={isDailyPending || isSuccess || alreadyClaimed}
                        className={`w-full py-4 text-royal-blue font-black rounded-2xl transition-all duration-500 shadow-xl ${isSuccess
                            ? "bg-emerald-500 text-white scale-100"
                            : "bg-gold-metallic hover:scale-105 active:scale-95"
                            }`}
                        isLoading={isDailyPending}
                    >
                        {isSuccess ? "Poin Berhasil Diklaim!" : alreadyClaimed ? "Sukses Klaim Hari Ini" : "Klaim Poin Sekarang"}
                    </Button>

                    <button
                        onClick={() => setIsOpen(false)}
                        className="mt-6 flex items-center justify-center gap-2 mx-auto text-[10px] text-white/30 uppercase tracking-[0.3em] font-bold hover:text-white transition-colors group"
                    >
                        <X className="w-3 h-3 group-hover:rotate-90 transition-transform" />
                        Tutup
                    </button>
                </div>

                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-40 h-20 bg-gold-metallic/5 blur-3xl pointer-events-none" />
            </div>
        </div>
    );
}

// --- Export as Compound Component ---
export const DailyCheckInModal = Object.assign(DailyCheckInModalRoot, {
    Trigger: DailyCheckInModalTrigger,
    Content: DailyCheckInModalContent,
});
