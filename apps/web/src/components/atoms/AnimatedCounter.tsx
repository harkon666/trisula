"use client";

import { useEffect, useRef } from "react";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";

interface AnimatedCounterProps {
    value: number;
    duration?: number;
    prefix?: string;
    suffix?: string;
    className?: string;
    formatter?: (value: number) => string;
}

export const AnimatedCounter = ({
    value,
    duration = 1.5,
    prefix = "",
    suffix = "",
    className = "",
    formatter
}: AnimatedCounterProps) => {
    const spanRef = useRef<HTMLSpanElement>(null);
    const previousValue = useRef(0);

    useGSAP(() => {
        if (!spanRef.current) return;

        const start = previousValue.current;
        const end = value;

        gsap.to({ val: start }, {
            val: end,
            duration: duration,
            ease: "power2.out",
            onUpdate: function () {
                if (spanRef.current) {
                    const currentVal = this.targets()[0].val;

                    if (formatter) {
                        spanRef.current.innerText = `${prefix}${formatter(currentVal)}${suffix}`;
                    } else {
                        // Default formatting (integers)
                        spanRef.current.innerText = `${prefix}${Math.round(currentVal).toLocaleString()}${suffix}`;
                    }
                }
            }
        });

        previousValue.current = value;
    }, [value]);

    return <span ref={spanRef} className={className}>{prefix}0{suffix}</span>;
};
