"use client";

import { useEffect, useRef, useLayoutEffect } from "react";
import gsap from "gsap";

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
    duration = 2.5,
    prefix = "",
    suffix = "",
    className = "",
    formatter
}: AnimatedCounterProps) => {
    const spanRef = useRef<HTMLSpanElement>(null);
    const tweenRef = useRef<gsap.core.Tween | null>(null);
    // Store this OUTSIDE the component lifecycle so it survives Strict Mode remounts
    const animatedTo = useRef<number | null>(null);

    const format = (val: number) => {
        const formatted = formatter
            ? formatter(val)
            : Math.round(val).toLocaleString();
        return `${prefix}${formatted}${suffix}`;
    };

    useEffect(() => {
        if (!spanRef.current) return;

        const endValue = Number(value) || 0;

        // Determine the start: if we've animated before, start from there.
        // On first mount (or Strict Mode remount), animatedTo is null → start from 0.
        const startValue = animatedTo.current ?? 0;

        // Kill any in-flight animation
        if (tweenRef.current) {
            tweenRef.current.kill();
            tweenRef.current = null;
        }

        // If both start and end are zero, just display 0, don't animate
        if (endValue === 0 && startValue === 0) {
            spanRef.current.textContent = format(0);
            return;
        }

        // If we're already at the target, just display it
        if (startValue === endValue) {
            spanRef.current.textContent = format(endValue);
            return;
        }

        // Show starting value immediately
        spanRef.current.textContent = format(startValue);

        // Determine animation style:
        // First time (from 0): slow + delayed for the "Sultan" entrance
        // Subsequent updates (after claim): fast + instant
        const isFirstEntrance = startValue === 0;

        const obj = { val: startValue };

        tweenRef.current = gsap.to(obj, {
            val: endValue,
            duration: isFirstEntrance ? duration : 1,
            delay: isFirstEntrance ? 0.5 : 0,
            ease: "power2.out",
            onUpdate: () => {
                if (spanRef.current) {
                    spanRef.current.textContent = format(obj.val);
                }
            },
            onComplete: () => {
                if (spanRef.current) {
                    spanRef.current.textContent = format(endValue);
                }
                animatedTo.current = endValue;
            }
        });

        // Cleanup: kill the tween but do NOT update animatedTo.
        // This is critical for React Strict Mode, which will unmount and remount.
        // By leaving animatedTo as null (or its previous value), the remount
        // will correctly start the animation from 0 again.
        return () => {
            if (tweenRef.current) {
                tweenRef.current.kill();
                tweenRef.current = null;
            }
        };
    }, [value]);

    // Render an empty span — all text is managed by GSAP via the ref.
    return <span ref={spanRef} className={className} />;
};
