"use client";

import { useRef, useEffect } from "react";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import { ShieldCheck, Download, CheckCircle2 } from "lucide-react";
import { Button } from "@/src/components/atoms";

interface RedeemSuccessCertificateProps {
    rewardName: string;
    onDone: () => void;
}

export function RedeemSuccessCertificate({ rewardName, onDone }: RedeemSuccessCertificateProps) {
    const containerRef = useRef<HTMLDivElement>(null);
    const certRef = useRef<HTMLDivElement>(null);
    const contentRef = useRef<HTMLDivElement>(null);
    const stampRef = useRef<HTMLDivElement>(null);
    const glowRef = useRef<HTMLDivElement>(null);

    useGSAP(() => {
        if (!containerRef.current || !certRef.current || !contentRef.current || !stampRef.current) return;

        const tl = gsap.timeline({ defaults: { ease: "power4.out" } });

        // 1. Entrance: Dark backdrop fades in
        tl.fromTo(containerRef.current,
            { opacity: 0 },
            { opacity: 1, duration: 0.6 }
        );

        // 2. The Reveal: Certificate zooms in from "the void" with 3D rotation
        tl.fromTo(certRef.current,
            { scale: 0.75, rotationX: 15, y: 80, opacity: 0, filter: "brightness(0.5)" },
            { scale: 1, rotationX: 0, y: 0, opacity: 1, filter: "brightness(1)", duration: 1.8, ease: "expo.out" },
            "-=0.3"
        );

        // 3. Text Stagger: "Layanan Berhasil Diklaim" and other info
        const textElements = contentRef.current.children;
        tl.fromTo(textElements,
            { y: 20, opacity: 0 },
            { y: 0, opacity: 1, stagger: 0.15, duration: 0.8 },
            "-=1.0"
        );

        // 4. The Signature: Gold stamp impacts (dropped from above)
        tl.fromTo(stampRef.current,
            { scale: 3, opacity: 0, rotation: -20 },
            { scale: 1, opacity: 0.8, rotation: 12, duration: 0.6, ease: "back.out(2)" },
            "-=0.4"
        );

        // 5. Luxury Aura: Continuous glow sweep (initiated after reveal)
        if (glowRef.current) {
            tl.fromTo(glowRef.current,
                { x: "-100%" },
                { x: "200%", duration: 2.5, ease: "power2.inOut", repeat: -1, repeatDelay: 1 },
                "-=0.5"
            );
        }

    }, { scope: containerRef });

    return (
        <div ref={containerRef} className="fixed inset-0 z-[110] flex items-center justify-center p-4 bg-black/95 backdrop-blur-2xl overflow-hidden perspective-1000">
            {/* Certificate Container */}
            <div
                ref={certRef}
                className="relative w-full max-w-2xl max-h-[92vh] flex flex-col bg-royal-800 border-[2px] md:border-[3px] border-gold-metallic/50 p-1 shadow-[0_0_80px_rgba(212,175,55,0.2)] rounded-sm overflow-hidden"
            >
                {/* Inner Border & Gradient Background */}
                <div className="relative flex-1 border border-gold-metallic/30 p-6 md:p-12 bg-gradient-to-br from-royal-blue via-charcoal-deep to-black overflow-y-auto rounded-[2px] custom-scrollbar">

                    {/* Animated Glow Sweep FX */}
                    <div
                        ref={glowRef}
                        className="absolute inset-0 w-full h-full bg-gradient-to-tr from-transparent via-gold-metallic/15 to-transparent skew-x-[-25deg] pointer-events-none z-0"
                    />

                    {/* Content */}
                    <div ref={contentRef} className="relative z-10 text-center space-y-5 md:space-y-7">
                        {/* Status Icon */}
                        <div className="flex justify-center">
                            <div className="w-16 h-16 rounded-full bg-gold-metallic/10 border border-gold-metallic/20 flex items-center justify-center">
                                <ShieldCheck className="w-10 h-10 text-gold-metallic" />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <h1 className="text-gold-metallic font-serif text-2xl md:text-5xl tracking-[0.1em] uppercase">
                                Sertifikat Layanan
                            </h1>
                            <p className="text-gold-light/40 text-[10px] uppercase tracking-[0.3em] font-bold">
                                Konfirmasi Klaim Eksklusif
                            </p>
                        </div>

                        {/* Divider */}
                        <div className="flex items-center justify-center">
                            <div className="h-[1px] w-full max-w-[200px] bg-gradient-to-r from-transparent via-gold-metallic/60 to-transparent" />
                        </div>

                        <div className="space-y-3 md:space-y-4">
                            <p className="text-blue-100/60 font-medium italic text-xs md:text-base px-4 md:px-10 leading-relaxed">
                                Layanan di bawah ini telah berhasil diklaim secara sah dan tercatat dalam sistem royalti Trisula.
                            </p>

                            <h2 className="text-white text-2xl md:text-5xl font-black tracking-tight drop-shadow-[0_4px_10px_rgba(0,0,0,0.5)] leading-tight">
                                {rewardName}
                            </h2>
                        </div>

                        {/* Signature Section */}
                        <div className="flex items-end justify-between pt-10 px-4 md:px-8">
                            <div className="text-left space-y-1">
                                <p className="text-gold-metallic/40 text-[10px] uppercase tracking-widest font-bold">ID Transaksi</p>
                                <p className="text-white text-xs md:text-sm font-mono opacity-80">
                                    TRS-{Math.random().toString(36).substring(2, 11).toUpperCase()}
                                </p>
                            </div>

                            {/* The Signature Stamp */}
                            <div ref={stampRef} className="relative transition-opacity">
                                <div className="w-24 h-24 border-4 border-gold-metallic/60 rounded-full flex flex-col items-center justify-center backdrop-blur-sm bg-gold-metallic/5">
                                    <span className="text-gold-metallic font-black text-[9px] tracking-tighter uppercase leading-none mb-1">TRISULA</span>
                                    <span className="text-gold-metallic font-black text-[12px] tracking-widest uppercase leading-none">VALID</span>
                                    <CheckCircle2 className="w-4 h-4 text-gold-metallic absolute -top-1 -right-1" />
                                </div>
                            </div>
                        </div>

                        {/* Actions */}
                        <div className="pt-8 md:pt-12 flex flex-col sm:flex-row gap-3 md:gap-4 justify-center">
                            <Button
                                onClick={onDone}
                                className="px-6 md:px-10 py-3 md:py-4 bg-gold-metallic text-royal-blue font-black rounded-sm hover:bg-white transition-all transform hover:scale-105 active:scale-95 shadow-xl text-sm md:text-base"
                            >
                                Kembali ke Dashboard
                            </Button>
                            <Button
                                variant="outline"
                                className="px-6 md:px-10 py-3 md:py-4 border-gold-metallic/50 text-gold-metallic font-bold rounded-sm hover:bg-gold-metallic/10 group text-sm md:text-base"
                            >
                                <Download size={18} className="group-hover:translate-y-1 transition-transform" />
                                <span>Simpan Digital</span>
                            </Button>
                        </div>
                    </div>
                </div>
            </div>

            {/* Background texture or subtle details */}
            <div className="absolute inset-0 opacity-10 pointer-events-none">
                <div className="absolute top-0 right-0 w-[400px] h-[400px] bg-gold-metallic/20 blur-[150px] rounded-full" />
                <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-royal-blue/30 blur-[150px] rounded-full" />
            </div>
        </div>
    );
}

// Add CSS keyframes for shimmer if needed, though we used GSAP above.
// The user provided a CSS shimmer reference too. Let's stick to GSAP for consistency with the guide.
