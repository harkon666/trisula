"use client";

import { useRef, useLayoutEffect } from 'react';
import gsap from 'gsap';
import { useGSAP } from '@gsap/react';

// Register GSAP plugins if needed (e.g., ScrollTrigger)
if (typeof window !== "undefined") {
    gsap.registerPlugin(useGSAP);
}

export function useGsapContext(scope?: React.RefObject<HTMLDivElement | null>) {
    const ctx = useRef<gsap.Context | null>(null);

    useGSAP(() => {
        // This is where you can put global GSAP setup or return a cleanup function
        // But mainly useGSAP handles cleanup automatically
    }, { scope });

    return ctx;
}

// Helper component for Entrance Animation
export function PageEntrance({ children, className }: { children: React.ReactNode, className?: string }) {
    const container = useRef<HTMLDivElement>(null);

    useGSAP(() => {
        gsap.from(container.current, {
            opacity: 0,
            y: 20,
            duration: 0.8,
            ease: "power3.out"
        });
    }, { scope: container });

    return <div ref={container} className={className}>{children}</div>;
}
