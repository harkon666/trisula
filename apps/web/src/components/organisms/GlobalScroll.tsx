"use client";

import { ReactNode, useEffect } from "react";
import Lenis from "lenis";

export function GlobalScroll({ children }: { children: ReactNode }) {
    useEffect(() => {
        const lenis = new Lenis({
            duration: 1.2,
            easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
            // strict: true,
        });

        function raf(time: number) {
            lenis.raf(time);
            requestAnimationFrame(raf);
        }

        requestAnimationFrame(raf);

        // Integrate with GSAP ScrollTrigger if used later
        // gsap.ticker.add((time)=>{
        //   lenis.raf(time * 1000)
        // })

        return () => {
            lenis.destroy();
        };
    }, []);

    return <>{children}</>;
}
